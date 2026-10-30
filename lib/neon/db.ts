import "server-only";
import { neon } from "@neondatabase/serverless";

export function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing. Set your Neon Postgres connection string in .env.local.");
  return neon(url);
}
export function isDatabaseConfigured() { return Boolean(process.env.DATABASE_URL); }
