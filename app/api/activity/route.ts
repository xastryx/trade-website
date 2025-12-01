import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getActivitiesByDiscordId, createActivity } from "@/lib/db/activities"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Fetching activities for user:", session.discordId)

    const activities = await getActivitiesByDiscordId(session.discordId, 20)

    return NextResponse.json({ activities: activities || [] })
  } catch (error) {
    console.error("[v0] Error in activity GET:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log("[v0] Activity POST received")
    const body = await request.json()
    const { type, meta } = body

    if (!type) {
      console.log("[v0] Activity POST - missing type")
      return NextResponse.json({ error: "Type is required" }, { status: 400 })
    }

    if (type === "page_view") {
      console.log("[v0] Activity POST - page_view without session")
      try {
        const data = await createActivity(null, type, meta || null)
        return NextResponse.json({ success: true, data })
      } catch (dbError) {
        console.error("[v0] Activity POST - database error:", dbError)
        // Don't fail the request if activity logging fails
        return NextResponse.json({ success: true, data: null })
      }
    }

    const session = await getSession()
    if (!session) {
      console.log("[v0] Activity POST - no session")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Activity POST - creating activity for:", session.discordId)
    try {
      const data = await createActivity(session.discordId, type, meta || null)
      return NextResponse.json({ success: true, data })
    } catch (dbError) {
      console.error("[v0] Activity POST - database error:", dbError)
      // Don't fail the request if activity logging fails
      return NextResponse.json({ success: true, data: null })
    }
  } catch (error) {
    console.error("[v0] Error in activity POST (outer):", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: String(error),
      },
      { status: 500 },
    )
  }
}
