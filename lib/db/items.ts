import { sql } from "../neon/server"

export interface Item {
  id?: string
  name: string
  value: number
  game: string
  section: string
  image_url?: string
  rarity?: string
  demand?: string
  pot?: string
  rap_value?: number
  neon_value?: number
  mega_value?: number
  created_at?: Date
  updated_at?: Date
}

export async function getItems(game?: string): Promise<Item[]> {
  try {
    const items = game
      ? await sql`SELECT * FROM items WHERE game = ${game} ORDER BY value DESC`
      : await sql`SELECT * FROM items ORDER BY value DESC`

    return items.map((item: any) => ({
      ...item,
      _id: item.id, // For backward compatibility
    }))
  } catch (error) {
    console.error("Error fetching items:", error)
    return []
  }
}

export async function searchItems(query: string, game?: string): Promise<Item[]> {
  try {
    const searchPattern = `%${query}%`
    const items = game
      ? await sql`
          SELECT * FROM items 
          WHERE name ILIKE ${searchPattern} AND game = ${game}
          ORDER BY value DESC
          LIMIT 20
        `
      : await sql`
          SELECT * FROM items 
          WHERE name ILIKE ${searchPattern}
          ORDER BY value DESC
          LIMIT 20
        `

    return items.map((item: any) => ({
      ...item,
      _id: item.id, // For backward compatibility
      imageUrl: item.image_url,
      rapValue: item.rap_value,
      existCount: item.exist_count,
      changePercent: item.change_percent,
      updatedAt: item.updated_at,
    }))
  } catch (error) {
    console.error("Error searching items:", error)
    return []
  }
}

export async function createItem(item: Omit<Item, "id" | "created_at" | "updated_at">): Promise<Item | null> {
  try {
    const result = await sql`
      INSERT INTO items (
        name, value, game, section, image_url, rarity, demand, pot, 
        rap_value, neon_value, mega_value, created_at, updated_at
      )
      VALUES (
        ${item.name}, ${item.value}, ${item.game}, ${item.section}, 
        ${item.image_url || null}, ${item.rarity || null}, ${item.demand || null}, 
        ${item.pot || null}, ${item.rap_value || 0}, ${item.neon_value || 0}, 
        ${item.mega_value || 0}, NOW(), NOW()
      )
      RETURNING *
    `

    return result[0] || null
  } catch (error) {
    console.error("Error creating item:", error)
    return null
  }
}

export async function updateItem(id: string, updates: Partial<Item>): Promise<boolean> {
  try {
    const setFields = []
    const values: any[] = []
    let paramCount = 1

    for (const [key, value] of Object.entries(updates)) {
      if (key !== "id" && key !== "created_at") {
        setFields.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    }

    if (setFields.length === 0) {
      return false
    }

    setFields.push(`updated_at = $${paramCount}`)
    values.push(new Date())
    paramCount++

    values.push(id)

    const result = await sql.query(`UPDATE items SET ${setFields.join(", ")} WHERE id = $${paramCount}`, values)

    return true
  } catch (error) {
    console.error("Error updating item:", error)
    return false
  }
}

export async function deleteItem(id: string): Promise<boolean> {
  try {
    await sql`DELETE FROM items WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting item:", error)
    return false
  }
}
