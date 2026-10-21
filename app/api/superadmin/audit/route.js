import { NextResponse } from "next/server";
import { auth0 } from "../../../../lib/auth0.js";
import { isAuthorizedSuperAdmin } from "../../../../lib/services/users.js";
import { db } from "../../../../lib/db/index.js";
import * as schema from "../../../../lib/db/schema.js";
import { desc, eq, and, sql } from "drizzle-orm";

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

    let query = db.select().from(schema.auditLogs);

    const conditions = [];

    if (tableFilter && tableFilter !== "all") {
      conditions.push(eq(schema.auditLogs.tableName, tableFilter));
    }

    if (actionFilter && actionFilter !== "all") {
      conditions.push(eq(schema.auditLogs.action, actionFilter));
    }

    if (search && search.trim() !== "") {
      const term = `%${search.trim().toLowerCase()}%`;
      conditions.push(
        sql`(LOWER(${schema.auditLogs.changedBy}) LIKE ${term} OR LOWER(${schema.auditLogs.recordId}) LIKE ${term} OR LOWER(${schema.auditLogs.tableName}) LIKE ${term})`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const logs = await query
      .orderBy(desc(schema.auditLogs.changedAt))
      .limit(limit);

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error al obtener registros de auditoría:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
