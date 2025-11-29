export const revalidate = 3600 // Cache for 1 hour

import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: "This endpoint is deprecated. Use /api/items with game=Adopt Me filter instead.",
      message: "Please use /api/items?game=Adopt%20Me to fetch Adopt Me items"
    }, 
    { status: 410 }
  )
}
