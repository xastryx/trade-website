import { neon } from "@neondatabase/serverless"
import dotenv from "dotenv"

dotenv.config()

const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL

if (!databaseUrl) {
  console.error("❌ NEON_DATABASE_URL or DATABASE_URL environment variable is not set")
  console.error("Please ensure you have a .env file in the discord-bot directory with:")
  console.error("NEON_DATABASE_URL=your_neon_connection_string")
  throw new Error("NEON_DATABASE_URL environment variable is not set")
}

export const sql = neon(databaseUrl)

// Helper function to test connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`
    console.log("✅ Database connected successfully")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}
