import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { eq } from "drizzle-orm";

/**
 * Sincroniza un usuario de Auth0 con la base de datos Neon.
 * Asigna el rol "USER" por defecto si es nuevo.
 */
export async function syncAuth0User(sessionUser) {
  if (!sessionUser || !sessionUser.sub) return null;

  const auth0Id = sessionUser.sub;
  const email = sessionUser.email || `${auth0Id}@auth0.placeholder`;
  const name = sessionUser.name || sessionUser.nickname || "Usuario";
  const picture = sessionUser.picture || null;

  // Buscar usuario existente
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.auth0Id, auth0Id))
    .limit(1);

  let user;

  if (existing.length > 0) {
    user = existing[0];
    // Actualizar nombre o foto si cambiaron
    await db
      .update(schema.users)
      .set({ name, picture, updatedAt: new Date() })
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

    // Asignar rol inicial 'USER'
    await db.insert(schema.userRoles).values({
      userId: user.id,
      roleId: "USER",
    });
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
    roles: allUserRoles
      .filter((ur) => ur.userId === u.id)
      .map((ur) => ur.roleId),
  }));
}

/**
 * Asigna un rol a un usuario.
 */
export async function assignUserRole(userId, roleId, assignedById = null) {
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
  // Evitar remover si es el único rol básico
  await db
    .delete(schema.userRoles)
    .where(eq(schema.userRoles.userId, userId) && eq(schema.userRoles.roleId, roleId));
}
