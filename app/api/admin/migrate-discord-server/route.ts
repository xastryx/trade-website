import type { NextRequest } from "next/server"
import { query } from "@/lib/db/postgres"

export const dynamic = "force-dynamic"

type SessionRow = {
  discord_id: string
  access_token: string
}

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD
  const authHeader = req.headers.get("authorization")

  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { newGuildId } = await req.json()

  if (!newGuildId) {
    return Response.json({ error: "Missing newGuildId" }, { status: 400 })
  }

  const botToken = process.env.DISCORD_BOT_TOKEN
  if (!botToken) {
    return Response.json({ error: "DISCORD_BOT_TOKEN not configured" }, { status: 500 })
  }

  try {
    const result = await query<SessionRow>(
      "SELECT discord_id, access_token FROM sessions WHERE access_token IS NOT NULL AND token_expires_at > NOW()",
    )

    const sessions = result.rows
    const results = {
      total: sessions.length,
      success: 0,
      failed: 0,
      alreadyInServer: 0,
      errors: [] as string[],
    }

    for (const session of sessions) {
      try {
        const response = await fetch(`https://discord.com/api/v10/guilds/${newGuildId}/members/${session.discord_id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bot ${botToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: session.access_token,
          }),
        })

        if (response.ok || response.status === 204) {
          results.success++
        } else if (response.status === 201) {
          results.alreadyInServer++
        } else {
          results.failed++
          const errorText = await response.text()
          results.errors.push(`User ${session.discord_id}: ${response.status} - ${errorText}`)
        }

        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error: any) {
        results.failed++
        results.errors.push(`User ${session.discord_id}: ${error.message}`)
      }
    }

    return Response.json({
      message: "Migration complete",
      results,
    })
  } catch (error: any) {
    console.error("Migration error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
