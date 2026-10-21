import { db } from "./index.js";
import { sql } from "drizzle-orm";

/**
 * Ejecuta una operación de base de datos dentro de una transacción con contexto de usuario auditado.
 * Inyecta la variable de sesión 'app.current_user_id' que luego es leída automáticamente
 * por la función del trigger 'log_audit_changes()' en PostgreSQL.
 *
 * @template T
 * @param {string|null} userId - ID o email del usuario autenticado responsable de la acción.
 * @param {(tx: any) => Promise<T>} callback - Función que ejecuta las consultas sobre el cliente de transacción tx.
 * @returns {Promise<T>}
 */
export async function withAuditTransaction(userId, callback) {
  const safeUserId = (userId && typeof userId === "string" && userId.trim()) 
    ? userId.trim() 
    : "SYSTEM_OR_UNTRACKED";

  return await db.transaction(async (tx) => {
    // Setea la variable local en la transacción actual de PostgreSQL (true = solo para la transacción)
    await tx.execute(sql`SELECT set_config('app.current_user_id', ${safeUserId}, true)`);
    return await callback(tx);
  });
}
