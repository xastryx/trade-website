import { neon } from "@neondatabase/serverless"

export function createNeonClient() {
  if (!process.env.NEON_DATABASE_URL) {
    throw new Error("NEON_DATABASE_URL environment variable is not set")
  }
  const sql = neon(process.env.NEON_DATABASE_URL)
  return sql
}
