export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { query } from "@/lib/db/postgres"

export async function GET() {
  try {
    console.log("[v0] Testing Supabase connection...")
    console.log("[v0] DATABASE_URL exists:", !!process.env.DATABASE_URL)
    console.log("[v0] POSTGRES_URL exists:", !!process.env.POSTGRES_URL)

    const itemsResult = await query(`SELECT COUNT(*) as count FROM items`)
    const itemCount = itemsResult.rows[0]?.count || 0

    console.log(`[v0] Found ${itemCount} items in Supabase`)

    // Get sample items
    const sampleItems = await query(`SELECT * FROM items LIMIT 10`)

    return NextResponse.json({
      success: true,
      databaseConnected: true,
      databaseType: "Supabase/PostgreSQL",
      postgresUrlExists: !!process.env.POSTGRES_URL,
      databaseUrlExists: !!process.env.DATABASE_URL,
      itemsCount: Number(itemCount),
      sampleItems: sampleItems.rows.map((item: any) => ({
        id: item.id,
        name: item.name,
        game: item.game,
        image_url: item.image_url,
        allFields: Object.keys(item),
      })),
    })
  } catch (error: any) {
    console.error("[v0] Supabase debug error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        databaseConnected: false,
        postgresUrlExists: !!process.env.POSTGRES_URL,
        databaseUrlExists: !!process.env.DATABASE_URL,
      },
      { status: 500 },
    )
  }
}
