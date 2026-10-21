import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL no encontrada en .env.local");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function runAuditMigration() {
  console.log("🛡️ Configurando Sistema de Auditoría en Neon PostgreSQL...");

  try {
    // 1. Crear tabla de logs de auditoría
    console.log("1. Creando tabla audit_logs...");
    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        action TEXT NOT NULL,
        old_data JSONB,
        new_data JSONB,
        changed_by TEXT,
        changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // 2. Crear índices para consultas rápidas
    console.log("2. Creando índices en audit_logs...");
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs (table_name, record_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON audit_logs (changed_by);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON audit_logs (changed_at DESC);`;

    // 3. Crear función de trigger con lectura segura de variables de sesión
    console.log("3. Creando función de trigger log_audit_changes()...");
    await sql`
      CREATE OR REPLACE FUNCTION log_audit_changes()
      RETURNS TRIGGER AS $$
      DECLARE
          current_user_id TEXT;
          target_record_id TEXT;
          row_data JSONB;
      BEGIN
          -- Rescata la variable de sesión inyectada en la transacción actual
          current_user_id := NULLIF(current_setting('app.current_user_id', true), '');
          IF current_user_id IS NULL THEN
              current_user_id := 'SYSTEM_OR_UNTRACKED';
          END IF;

          IF (TG_OP = 'INSERT') THEN
              row_data := to_jsonb(NEW);
              target_record_id := COALESCE(
                  row_data ->> 'id',
                  CASE 
                      WHEN (row_data ? 'user_id' AND row_data ? 'role_id') THEN (row_data ->> 'user_id') || ':' || (row_data ->> 'role_id')
                      ELSE ''
                  END
              );
              INSERT INTO audit_logs (table_name, record_id, action, new_data, changed_by)
              VALUES (TG_TABLE_NAME, target_record_id, TG_OP, row_data, current_user_id);
              RETURN NEW;
          ELSIF (TG_OP = 'UPDATE') THEN
              row_data := to_jsonb(NEW);
              target_record_id := COALESCE(
                  row_data ->> 'id',
                  to_jsonb(OLD) ->> 'id',
                  CASE 
                      WHEN (row_data ? 'user_id' AND row_data ? 'role_id') THEN (row_data ->> 'user_id') || ':' || (row_data ->> 'role_id')
                      ELSE ''
                  END
              );
              INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
              VALUES (TG_TABLE_NAME, target_record_id, TG_OP, to_jsonb(OLD), row_data, current_user_id);
              RETURN NEW;
          ELSIF (TG_OP = 'DELETE') THEN
              row_data := to_jsonb(OLD);
              target_record_id := COALESCE(
                  row_data ->> 'id',
                  CASE 
                      WHEN (row_data ? 'user_id' AND row_data ? 'role_id') THEN (row_data ->> 'user_id') || ':' || (row_data ->> 'role_id')
                      ELSE ''
                  END
              );
              INSERT INTO audit_logs (table_name, record_id, action, old_data, changed_by)
              VALUES (TG_TABLE_NAME, target_record_id, TG_OP, row_data, current_user_id);
              RETURN OLD;
          END IF;

          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `;

    // 4. Configurar triggers individuales
    console.log("4. Configurando triggers por tabla...");

    // documents
    await sql`DROP TRIGGER IF EXISTS audit_documents_trigger ON documents;`;
    await sql`
      CREATE TRIGGER audit_documents_trigger
      AFTER INSERT OR UPDATE OR DELETE ON documents
      FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
    `;
    console.log("  ✓ Trigger audit_documents_trigger activado en 'documents'");

    // categories
    await sql`DROP TRIGGER IF EXISTS audit_categories_trigger ON categories;`;
    await sql`
      CREATE TRIGGER audit_categories_trigger
      AFTER INSERT OR UPDATE OR DELETE ON categories
      FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
    `;
    console.log("  ✓ Trigger audit_categories_trigger activado en 'categories'");

    // users
    await sql`DROP TRIGGER IF EXISTS audit_users_trigger ON users;`;
    await sql`
      CREATE TRIGGER audit_users_trigger
      AFTER INSERT OR UPDATE OR DELETE ON users
      FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
    `;
    console.log("  ✓ Trigger audit_users_trigger activado en 'users'");

    // user_roles
    await sql`DROP TRIGGER IF EXISTS audit_user_roles_trigger ON user_roles;`;
    await sql`
      CREATE TRIGGER audit_user_roles_trigger
      AFTER INSERT OR UPDATE OR DELETE ON user_roles
      FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
    `;
    console.log("  ✓ Trigger audit_user_roles_trigger activado en 'user_roles'");

    // markdown_files
    await sql`DROP TRIGGER IF EXISTS audit_markdown_files_trigger ON markdown_files;`;
    await sql`
      CREATE TRIGGER audit_markdown_files_trigger
      AFTER INSERT OR UPDATE OR DELETE ON markdown_files
      FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
    `;
    console.log("  ✓ Trigger audit_markdown_files_trigger activado en 'markdown_files'");

    // document_revisions
    await sql`DROP TRIGGER IF EXISTS audit_document_revisions_trigger ON document_revisions;`;
    await sql`
      CREATE TRIGGER audit_document_revisions_trigger
      AFTER INSERT OR UPDATE OR DELETE ON document_revisions
      FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
    `;
    console.log("  ✓ Trigger audit_document_revisions_trigger activado en 'document_revisions'");

    console.log("✅ Sistema de auditoría configurado con éxito en la base de datos.");
  } catch (err) {
    console.error("❌ Error al aplicar migración de auditoría:", err);
    process.exit(1);
  }
}

runAuditMigration();
