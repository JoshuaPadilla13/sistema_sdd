import { NextResponse } from "next/server";
import { auth0 } from "../../../../lib/auth0.js";
import { isAuthorizedSuperAdmin } from "../../../../lib/services/users.js";
import { db } from "../../../../lib/db/index.js";
import * as schema from "../../../../lib/db/schema.js";
import { desc, eq, and, sql, or, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Valida que la sesión pertenezca estrictamente a un Super Administrador autorizado.
 */
async function verifySuperAdminSession() {
  try {
    const session = await auth0.getSession();
    if (!session || !session.user) return false;
    return isAuthorizedSuperAdmin(session.user.email);
  } catch (error) {
    return false;
  }
}

export async function GET(request) {
  try {
    const isSuperAdmin = await verifySuperAdminSession();
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: "Acceso denegado: Los registros de auditoría son de acceso exclusivo para Super Administradores." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
    const tableFilter = searchParams.get("table");
    const actionFilter = searchParams.get("action");
    const search = searchParams.get("search");

    // 1. Obtener usuarios registrados para cruzar ID/Auth0Id con Nombre de Usuario y Foto
    const allUsers = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        auth0Id: schema.users.auth0Id,
        picture: schema.users.picture,
      })
      .from(schema.users);

    const conditions = [];

    if (tableFilter && tableFilter !== "all") {
      conditions.push(eq(schema.auditLogs.tableName, tableFilter));
    }

    if (actionFilter && actionFilter !== "all") {
      conditions.push(eq(schema.auditLogs.action, actionFilter));
    }

    if (search && search.trim() !== "") {
      const termRaw = search.trim().toLowerCase();
      const term = `%${termRaw}%`;

      // Encontrar usuarios cuyo nombre o correo coincida con la búsqueda
      const matchingUserIdentifiers = allUsers
        .filter((u) => (u.name && u.name.toLowerCase().includes(termRaw)) || (u.email && u.email.toLowerCase().includes(termRaw)))
        .map((u) => [u.auth0Id, u.email, u.id])
        .flat()
        .filter(Boolean);

      const searchConditions = [
        sql`LOWER(${schema.auditLogs.changedBy}) LIKE ${term}`,
        sql`LOWER(${schema.auditLogs.recordId}) LIKE ${term}`,
        sql`LOWER(${schema.auditLogs.tableName}) LIKE ${term}`,
      ];

      if (matchingUserIdentifiers.length > 0) {
        searchConditions.push(inArray(schema.auditLogs.changedBy, matchingUserIdentifiers));
      }

      conditions.push(or(...searchConditions));
    }

    let query = db.select().from(schema.auditLogs);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const rawLogs = await query
      .orderBy(desc(schema.auditLogs.changedAt))
      .limit(limit);

    // 2. Enriquecer cada log con el Nombre de Usuario, Correo y Foto
    const logs = rawLogs.map((log) => {
      const matchedUser = allUsers.find(
        (u) =>
          (u.auth0Id && u.auth0Id === log.changedBy) ||
          (u.email && u.email.toLowerCase() === log.changedBy?.toLowerCase()) ||
          (u.id && u.id === log.changedBy)
      );

      return {
        ...log,
        userName: matchedUser?.name || null,
        userEmail: matchedUser?.email || null,
        userPicture: matchedUser?.picture || null,
      };
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error al obtener registros de auditoría:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
