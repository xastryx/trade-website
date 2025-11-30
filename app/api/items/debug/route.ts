export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { queryDatabase } from "@/lib/neon/server"

export async function GET() {
  try {
    console.log("[v0] Testing Neon connection...")
    console.log("[v0] DATABASE_URL exists:", !!process.env.DATABASE_URL)

    const itemsResult = await queryDatabase<{ count: string }>(`SELECT COUNT(*) as count FROM items`)
    const itemCount = itemsResult[0]?.count ? Number.parseInt(itemsResult[0].count) : 0

    console.log(`[v0] Found ${itemCount} items in database`)

    // Get sample items
    const sampleItems = await queryDatabase(`SELECT * FROM items LIMIT 10`)

    return NextResponse.json({
      success: true,
      databaseConnected: true,
      databaseType: "Neon/PostgreSQL",
      databaseUrlExists: !!process.env.DATABASE_URL,
      itemsCount: itemCount,
      sampleItems: sampleItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        game: item.game,
        image_url: item.image_url,
        rap_value: item.rap_value,
        allFields: Object.keys(item),
      })),
    })
  } catch (error: any) {
    console.error("[v0] Database debug error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        databaseConnected: false,
        databaseUrlExists: !!process.env.DATABASE_URL,
      },
      { status: 500 },
    )
  }
}
