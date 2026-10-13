import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

const connectionString = 
  process.env.DATABASE_URL || 
  "postgresql://neondb_owner:placeholder@ep-placeholder.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
export { schema };
