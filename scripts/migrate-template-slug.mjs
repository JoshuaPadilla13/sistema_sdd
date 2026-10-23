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
    console.log("Adding template_slug and template_id to documents table...");
    await sql`
      ALTER TABLE documents 
      ADD COLUMN IF NOT EXISTS template_slug VARCHAR(255);
    `;
    console.log("✓ template_slug column verified/added");

    await sql`
      ALTER TABLE documents 
      ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES documents(id) ON DELETE SET NULL;
    `;
    console.log("✓ template_id column verified/added");

    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    process.exit(0);
  }
}

run();
