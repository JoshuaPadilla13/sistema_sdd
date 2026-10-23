import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { eq, and, or } from "drizzle-orm";
import { withAuditTransaction } from "../db/audit.js";

/**
 * Valida si un valor es un formato UUID válido (v4, etc.).
 */
export function isValidUuid(val) {
  if (!val || typeof val !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());
}

/**
 * Resuelve el UUID real de la tabla 'users' a partir de un identificador
 * que puede ser UUID, auth0Id (sub) o correo electrónico.
 */
export async function resolveDbUserId(identifier, client = db) {
  if (!identifier || typeof identifier !== "string") return null;
  const trimmed = identifier.trim();
  if (isValidUuid(trimmed)) return trimmed;

  try {
    const found = await client
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(
        or(
          eq(schema.users.auth0Id, trimmed),
          eq(schema.users.email, trimmed.toLowerCase())
        )
      )
      .limit(1);

    return found[0]?.id || null;
  } catch (err) {
    return null;
  }
}

/**
 * Lista explícita y estricta de Super Administradores autorizados en el sistema.
 */
export const SUPER_ADMIN_EMAILS = [
  "nayeli.carrizales.diaz@gmail.com",
  "joshuapadillags@gmail.com"
];

/**
 * Verifica si un email corresponde a un Super Admin autorizado.
 */
export function isAuthorizedSuperAdmin(email) {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

/**
 * Sincroniza un usuario de Auth0 con la base de datos Neon.
 * Asigna automáticamente roles SUPER_ADMIN y ADMIN si su email está en la lista autorizada.
 * La operación se ejecuta en una transacción auditada.
 */
export async function syncAuth0User(sessionUser) {
  if (!sessionUser || !sessionUser.sub) return null;

  const auth0Id = sessionUser.sub;
  const email = (sessionUser.email || `${auth0Id}@auth0.placeholder`).toLowerCase().trim();
  const name = sessionUser.name || sessionUser.nickname || "Usuario";
  const picture = sessionUser.picture || null;
  const auditUserId = auth0Id || email;

  return await withAuditTransaction(auditUserId, async (tx) => {
    // Buscar usuario existente por email
    const existing = await tx
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    let user;

    if (existing.length > 0) {
      user = existing[0];
      await tx
        .update(schema.users)
        .set({ auth0Id, name, picture, updatedAt: new Date() })
        .where(eq(schema.users.id, user.id));
    } else {
      // Insertar nuevo usuario
      const [inserted] = await tx
        .insert(schema.users)
        .values({
          auth0Id,
          email,
          name,
          picture,
        })
        .returning();

      user = inserted;

      // Asignar rol básico 'USER'
      await tx.insert(schema.userRoles).values({
        userId: user.id,
        roleId: "USER",
      }).onConflictDoNothing();
    }

    // Si el usuario es uno de los Super Administradores designados, asegurar sus roles
    if (isAuthorizedSuperAdmin(email)) {
      await tx.insert(schema.userRoles).values({
        userId: user.id,
        roleId: "ADMIN",
      }).onConflictDoNothing();

      await tx.insert(schema.userRoles).values({
        userId: user.id,
        roleId: "SUPER_ADMIN",
      }).onConflictDoNothing();
    }

    // Obtener roles actuales del usuario
    const userRolesData = await tx
      .select({ roleId: schema.userRoles.roleId })
      .from(schema.userRoles)
      .where(eq(schema.userRoles.userId, user.id));

    return {
      ...user,
      roles: userRolesData.map((ur) => ur.roleId),
    };
  });
}

/**
 * Obtiene los roles de un usuario dado su ID.
 */
export async function getUserRoles(userId) {
  const userRolesData = await db
    .select({ roleId: schema.userRoles.roleId })
    .from(schema.userRoles)
    .where(eq(schema.userRoles.userId, userId));

  return userRolesData.map((ur) => ur.roleId);
}

/**
 * Obtiene todos los usuarios y sus roles asignados (para Super Admin).
 */
export async function getAllUsersWithRoles() {
  const allUsers = await db.select().from(schema.users);
  const allUserRoles = await db.select().from(schema.userRoles);

  return allUsers.map((u) => ({
    ...u,
    isSuperAdminAuthorized: isAuthorizedSuperAdmin(u.email),
    roles: allUserRoles
      .filter((ur) => ur.userId === u.id)
      .map((ur) => ur.roleId),
  }));
}

/**
 * Asigna un rol a un usuario dentro de una transacción auditada.
 * Restricción de seguridad: Sólo los dos correos autorizados pueden tener SUPER_ADMIN.
 */
export async function assignUserRole(userId, roleId, assignedById = null) {
  if (roleId === "SUPER_ADMIN") {
    // Verificar correo del usuario
    const target = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    if (!target.length || !isAuthorizedSuperAdmin(target[0].email)) {
      throw new Error(`El rol SUPER_ADMIN está estrictamente reservado para los correos autorizados (${SUPER_ADMIN_EMAILS.join(", ")}).`);
    }
  }

  return await withAuditTransaction(assignedById, async (tx) => {
    const dbAssignedBy = await resolveDbUserId(assignedById, tx);

    await tx
      .insert(schema.userRoles)
      .values({
        userId,
        roleId,
        assignedBy: dbAssignedBy,
      })
      .onConflictDoNothing();
  });
}

/**
 * Revoca un rol a un usuario dentro de una transacción auditada.
 */
export async function removeUserRole(userId, roleId, removedById = null) {
  return await withAuditTransaction(removedById, async (tx) => {
    await tx
      .delete(schema.userRoles)
      .where(and(eq(schema.userRoles.userId, userId), eq(schema.userRoles.roleId, roleId)));
  });
}
