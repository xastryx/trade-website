import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("discord_id", session.discordId)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
    }

    return NextResponse.json({ activities: data || [] })
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

    if (type === 'page_view') {
      const supabase = createServiceClient()
      
      const { data, error } = await supabase
        .from("activities")
        .insert({
          discord_id: null,
          type,
          meta: meta || null,
        })
        .select()

      if (error) {
        return NextResponse.json({ 
          error: "Failed to log activity", 
          details: error.message
        }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const discordId = session.discordId

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("activities")
      .insert({
        discord_id: discordId,
        type,
        meta: meta || null,
      })
      .select()

    if (error) {
      return NextResponse.json({ 
        error: "Failed to log activity", 
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ 
      error: "Internal server error"
    }, { status: 500 })
  }
}
