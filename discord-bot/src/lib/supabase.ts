import { sql } from "./database.js"

// Helper function to get items from Neon database
export async function getItemsTable(gameName = "Adopt Me") {
  return await sql`SELECT * FROM items WHERE game = ${gameName}`
}

// Query items by name
export async function getItemByName(name: string, gameName = "Adopt Me") {
  const result = await sql`SELECT * FROM items WHERE LOWER(name) = LOWER(${name}) AND game = ${gameName} LIMIT 1`
  return result[0] || null
}

// Update item in Neon
export async function updateItem(name: string, updates: Record<string, any>, gameName = "Adopt Me") {
  const columns = Object.keys(updates)
  const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(", ")
  const values = Object.values(updates)

  return await sql(
    [
      `UPDATE items SET ${setClause} WHERE LOWER(name) = LOWER($${values.length + 1}) AND game = $${values.length + 2} RETURNING *`,
    ] as any,
    ...values,
    name,
    gameName,
  )
}

export function deprecatedSupabaseWarning() {
  console.warn("⚠️  Supabase is no longer used. Using Neon database instead.")
}
