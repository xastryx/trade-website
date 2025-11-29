import { Pool, neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws

let pool: Pool | null = null

export function getServerPool() {
  if (!pool) {
    if (!process.env.NEON_DATABASE_URL) {
      throw new Error("NEON_DATABASE_URL environment variable is not set")
    }
    pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL })
  }
  return pool
}

export async function queryDatabase<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getServerPool()
  const result = await pool.query(text, params)
  return result.rows as T[]
}

export async function querySingle<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await queryDatabase<T>(text, params)
  return rows[0] || null
}
