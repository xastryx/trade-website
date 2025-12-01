import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  console.log("============================================")
  console.log("[v0] DISCORD OAUTH ROUTE HIT!!!")
  console.log("[v0] Timestamp:", new Date().toISOString())
  console.log("[v0] Request URL:", req.url)
  console.log("============================================")

  const cookieStore = await cookies()
  const state = crypto.randomUUID()

  const url = new URL(req.url)
  const isSecure = true

  cookieStore.set("discord_oauth_state", state, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  })

  const redirectUri = "https://rotraders.gg/api/auth/discord/callback"

  console.log("[v0] Discord OAuth - Using redirect URI:", redirectUri)
  console.log("[v0] State generated:", state)

  const clientId = process.env.DISCORD_CLIENT_ID
  console.log("[v0] Client ID exists:", !!clientId)

  if (!clientId) {
    console.error("[v0] ERROR: Missing DISCORD_CLIENT_ID")
    return new Response("Missing DISCORD_CLIENT_ID. Add it in Project Settings > Environment Variables.", {
      status: 500,
    })
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "identify email guilds.join",
    redirect_uri: redirectUri,
    state,
    prompt: "consent",
  })

  const authorizeUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`

  console.log("[v0] Full authorize URL:", authorizeUrl)
  console.log("[v0] About to redirect to Discord...")

  return Response.redirect(authorizeUrl, 302)
}
