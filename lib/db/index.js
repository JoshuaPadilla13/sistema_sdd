import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema.js";

const connectionString = 
  process.env.DATABASE_URL || 
  "postgresql://neondb_owner:placeholder@ep-placeholder.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require";

// Pool de WebSockets con soporte completo para transacciones y variables de sesión (set_config)
export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
export { schema };
