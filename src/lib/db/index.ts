import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = (process.env.DATABASE_URL || "").replace(/^["']|["']$/g, "").trim();

if (!connectionString) {
  console.warn("DATABASE_URL is missing in environment variables.");
}

// Disable prepare statements for Supabase / Neon connection pooler compatibility
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
