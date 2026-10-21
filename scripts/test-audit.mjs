import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { withAuditTransaction } from "../lib/db/audit.js";
import { db } from "../lib/db/index.js";
import * as schema from "../lib/db/schema.js";
import { eq, desc } from "drizzle-orm";

async function testAudit() {
  console.log("🧪 Probando Sistema de Auditoría con Drizzle y Triggers...");

  const testUserId = "auth0|test-auditor-12345";

  // 1. Tomar un documento existente para hacer un update auditado
  const existingDocs = await db.select().from(schema.documents).limit(1);
  if (!existingDocs.length) {
    console.log("No hay documentos para probar, prueba omitida.");
    return;
  }

  const doc = existingDocs[0];
  console.log(`Documento a actualizar temporalmente: "${doc.title}" (ID: ${doc.id})`);

  // 2. Ejecutar actualización auditada con withAuditTransaction
  await withAuditTransaction(testUserId, async (tx) => {
    await tx
      .update(schema.documents)
      .set({ updatedAt: new Date() })
      .where(eq(schema.documents.id, doc.id));
  });

  console.log("✓ Transacción completada con éxito.");

  // 3. Consultar la tabla audit_logs para verificar el registro
  const latestLogs = await db
    .select()
    .from(schema.auditLogs)
    .where(eq(schema.auditLogs.tableName, "documents"))
    .orderBy(desc(schema.auditLogs.changedAt))
    .limit(1);

  if (latestLogs.length > 0) {
    const log = latestLogs[0];
    console.log("🎉 Log de auditoría capturado en base de datos:");
    console.log(`   - ID: ${log.id}`);
    console.log(`   - Tabla: ${log.tableName}`);
    console.log(`   - Registro ID: ${log.recordId}`);
    console.log(`   - Acción: ${log.action}`);
    console.log(`   - Usuario responsable (changed_by): ${log.changedBy}`);
    console.log(`   - Fecha: ${log.changedAt}`);

    if (log.changedBy === testUserId) {
      console.log("✅ VERIFICACIÓN EXITOSA: El trigger capturó exactamente el ID del usuario inyectado.");
    } else {
      console.warn(`⚠️ Advertencia: changedBy fue '${log.changedBy}' pero se esperaba '${testUserId}'.`);
    }
  } else {
    console.error("❌ No se encontró ningún log en audit_logs.");
  }
}

testAudit().catch(console.error);
