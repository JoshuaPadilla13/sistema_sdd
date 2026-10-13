import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { eq, and } from "drizzle-orm";

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
 */
export async function syncAuth0User(sessionUser) {
  if (!sessionUser || !sessionUser.sub) return null;

  const auth0Id = sessionUser.sub;
  const email = (sessionUser.email || `${auth0Id}@auth0.placeholder`).toLowerCase().trim();
  const name = sessionUser.name || sessionUser.nickname || "Usuario";
  const picture = sessionUser.picture || null;

  // Buscar usuario existente por auth0Id o por email
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  let user;

  if (existing.length > 0) {
    user = existing[0];
    await db
      .update(schema.users)
      .set({ auth0Id, name, picture, updatedAt: new Date() })
      .where(eq(schema.users.id, user.id));
  } else {
    // Insertar nuevo usuario
    const [inserted] = await db
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
    await db.insert(schema.userRoles).values({
      userId: user.id,
      roleId: "USER",
    }).onConflictDoNothing();
  }

  // Si el usuario es uno de los Super Administradores designados, asegurar sus roles
  if (isAuthorizedSuperAdmin(email)) {
    await db.insert(schema.userRoles).values({
      userId: user.id,
      roleId: "ADMIN",
    }).onConflictDoNothing();

    await db.insert(schema.userRoles).values({
      userId: user.id,
      roleId: "SUPER_ADMIN",
    }).onConflictDoNothing();
  }

  // Obtener roles actuales del usuario
  const roles = await getUserRoles(user.id);

  return {
    ...user,
    roles,
  };
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
 * Asigna un rol a un usuario.
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

  await db
    .insert(schema.userRoles)
    .values({
      userId,
      roleId,
      assignedBy: assignedById,
    })
    .onConflictDoNothing();
}

/**
 * Revoca un rol a un usuario.
 */
export async function removeUserRole(userId, roleId) {
  await db
    .delete(schema.userRoles)
    .where(and(eq(schema.userRoles.userId, userId), eq(schema.userRoles.roleId, roleId)));
}
