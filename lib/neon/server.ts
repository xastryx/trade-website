import { Pool, neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { neon } from "@neondatabase/serverless"

neonConfig.webSocketConstructor = ws

let pool: Pool | null = null
let _sql: ReturnType<typeof neon> | null = null

function getDatabaseURL() {
  const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
  if (!dbUrl) {
    throw new Error("DATABASE_URL or NEON_DATABASE_URL environment variable is not set")
  }
  return dbUrl
}

function getSQL() {
  if (!_sql) {
    _sql = neon(getDatabaseURL())
  }
  return _sql
}

export const sql = new Proxy({} as ReturnType<typeof neon>, {
  apply(_target, _thisArg, args) {
    return getSQL()(...args)
  },
  get(_target, prop) {
    return (getSQL() as any)[prop]
  },
})

export function getServerPool() {
  if (!pool) {
    pool = new Pool({ connectionString: getDatabaseURL() })
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
