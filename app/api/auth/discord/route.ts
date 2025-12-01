import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
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

  const envRedirectUri = process.env.DISCORD_REDIRECT_URI
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const requestHost = url.host

  console.log("[v0] Discord OAuth Debug:")
  console.log("[v0]   DISCORD_REDIRECT_URI env:", envRedirectUri)
  console.log("[v0]   NEXT_PUBLIC_BASE_URL env:", baseUrl)
  console.log("[v0]   Request host:", requestHost)
  console.log("[v0]   Request origin:", url.origin)

  const redirectUri = envRedirectUri || "https://rotraders.gg/api/auth/discord/callback"

  console.log("[v0]   Final redirectUri being sent to Discord:", redirectUri)

  const clientId = process.env.DISCORD_CLIENT_ID
  if (!clientId) {
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

  console.log("[v0]   Full Discord authorize URL:", authorizeUrl)

  return Response.redirect(authorizeUrl, 302)
}
