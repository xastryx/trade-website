import { neon } from "@neondatabase/serverless"

async function deleteCorruptItem() {
  try {
    const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || "")

    console.log("[v0] Connecting to Neon database...")

    // Find the corrupt item
    const corruptItems = await sql`
      SELECT id, name, value, section 
      FROM items 
      WHERE game = 'SAB' AND name = 'corrupt'
      LIMIT 1
    `

    if (corruptItems.length === 0) {
      console.log("[v0] No item named 'corrupt' found in SAB game")
      return
    }

    const corruptItem = corruptItems[0]
    console.log("[v0] Found corrupt item:", {
      id: corruptItem.id,
      name: corruptItem.name,
      value: corruptItem.value,
      section: corruptItem.section,
    })

    // Delete the item
    const result = await sql`
      DELETE FROM items 
      WHERE id = ${corruptItem.id}
      RETURNING id
    `

    if (result.length > 0) {
      console.log("[v0] ✅ Successfully deleted corrupt item")
    } else {
      console.log("[v0] ❌ Failed to delete item")
    }

    process.exit(0)
  } catch (error) {
    console.error("[v0] Error deleting corrupt item:", error)
    process.exit(1)
  }
}

deleteCorruptItem()
