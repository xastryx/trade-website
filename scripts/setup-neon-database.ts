import { getServerPool } from "../lib/neon/server"
import fs from "fs"
import path from "path"

async function setupNeonDatabase() {
  console.log("Setting up Neon database...")

  try {
    const pool = getServerPool()

    const sqlFile = path.join(process.cwd(), "scripts/neon/001_complete_schema.sql")
    const sql = fs.readFileSync(sqlFile, "utf-8")

    console.log("Running schema migration...")
    await pool.query(sql)

    console.log("Database setup complete!")
    console.log("You can now use your Neon database.")

    process.exit(0)
  } catch (error) {
    console.error("Error setting up database:", error)
    process.exit(1)
  }
}

setupNeonDatabase()
