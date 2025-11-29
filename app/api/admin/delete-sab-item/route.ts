import { NextResponse } from "next/server"
import { query } from "@/lib/db/postgres"

export async function POST(request: Request) {
  try {
    const { itemName } = await request.json()

    if (!itemName) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 })
    }

    console.log(`[v0] Connecting to Supabase...`)

    const findResult = await query(
      `SELECT * FROM items 
       WHERE game = $1 AND name = $2
       LIMIT 1`,
      ['SAB', itemName]
    )

    if (findResult.rows.length === 0) {
      return NextResponse.json({ error: `No item named '${itemName}' found in SAB game` }, { status: 404 })
    }

    const item = findResult.rows[0]
    console.log(`[v0] Found item:`, {
      id: item.id,
      name: item.name,
      value: item.rap_value,
      section: item.section,
    })

    const deleteResult = await query(
      `DELETE FROM items 
       WHERE id = $1
       RETURNING id`,
      [item.id]
    )

    if (deleteResult.rows.length > 0) {
      console.log(`[v0] Successfully deleted item!`)
      return NextResponse.json({
        success: true,
        message: `Successfully deleted '${itemName}' from SAB game`,
        deletedItem: {
          id: item.id,
          name: item.name,
          value: item.rap_value,
        },
      })
    } else {
      return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Error deleting item:", error)
    return NextResponse.json(
      { error: "Failed to delete item", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
