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

    const activities = await getActivitiesByDiscordId(session.discordId, 20)

    return NextResponse.json({ activities: activities || [] })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, meta } = body

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 })
    }

    if (type === "page_view") {
      const data = await createActivity(null, type, meta || null)
      return NextResponse.json({ success: true, data })
    }

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await createActivity(session.discordId, type, meta || null)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
