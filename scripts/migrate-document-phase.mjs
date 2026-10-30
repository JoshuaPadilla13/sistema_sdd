import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("No DATABASE_URL found");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function run() {
  try {
    console.log("Adding phase column to documents table...");
    await sql`
      ALTER TABLE documents 
      ADD COLUMN IF NOT EXISTS phase INTEGER;
    `;
    console.log("✓ phase column verified/added");

    // Assign phases for current documents based on slug/category
    console.log("Updating phases for existing documents...");

    // Phase 1: Requerimientos
    await sql`
      UPDATE documents 
      SET phase = 1 
      WHERE slug LIKE 'plantillas/rq-%' 
         OR slug IN ('checklist-discovery', 'cuestionario-cliente---version-completa', 'plantilla---minuta-de-discovery', 'requerimientos/sintaxis-ears', 'agente---planificacion-de-casos-de-uso', 't-tulo--problemas--objetivos-y-l-mites-de-alcance-');
    `;

    // Phase 2: Plan y Diseño
    await sql`
      UPDATE documents 
      SET phase = 2 
      WHERE slug LIKE 'plantillas/pl-%' 
         OR slug LIKE 'diseno/%';
    `;

    console.log("Migration finished successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    process.exit(0);
  }
}

run();
