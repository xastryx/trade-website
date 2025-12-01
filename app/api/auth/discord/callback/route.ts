export const dynamic = "force-dynamic"
export const revalidate = 0

import { cookies } from "next/headers"
import { upsertProfile } from "@/lib/db/queries/profiles"
import { createSession as createDbSession } from "@/lib/db/queries/sessions"
import { query } from "@/lib/db/postgres"

type TokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  refresh_token?: string
}

type DiscordUser = {
  id: string
  username?: string
  global_name?: string
  avatar?: string | null
  email?: string | null
}

async function addUserToGuild(userId: string, accessToken: string): Promise<boolean> {
  const guildId = process.env.DISCORD_GUILD_ID
  const botToken = process.env.DISCORD_BOT_TOKEN

  if (!guildId || !botToken) {
    console.log("[v0] Skipping guild join - DISCORD_GUILD_ID or DISCORD_BOT_TOKEN not configured")
    return false
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: accessToken,
      }),
    })

    if (response.ok || response.status === 204) {
      console.log("[v0] Successfully added user to guild:", userId)
      return true
    } else if (response.status === 201) {
      console.log("[v0] User was already in guild:", userId)
      return true
    } else {
      const errorText = await response.text()
      console.error("[v0] Failed to add user to guild:", response.status, errorText)
      return false
    }
  } catch (error: any) {
    console.error("[v0] Error adding user to guild:", error.message)
    return false
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const error = url.searchParams.get("error")
  const cookieStore = await cookies()
  const storedState = cookieStore.get("discord_oauth_state")?.value

  const USE_SECURE_COOKIES = true
  const baseUrl = "https://rotraders.gg"

  console.log(
    "[v0] Callback received - code:",
    !!code,
    "state:",
    state,
    "storedState:",
    storedState,
    "match:",
    state === storedState,
  )

  if (error) {
    console.log("[v0] OAuth error from Discord:", error)
    return Response.redirect(`${baseUrl}/login?error=oauth_denied`, 302)
  }

  if (!code || !state || !storedState || state !== storedState) {
    console.log(
      "[v0] State validation failed - code:",
      !!code,
      "state:",
      !!state,
      "storedState:",
      !!storedState,
      "match:",
      state === storedState,
    )
    return Response.redirect(`${baseUrl}/login?error=invalid_state`, 302)
  }

  cookieStore.delete("discord_oauth_state")

  const redirectUri = "https://rotraders.gg/api/auth/discord/callback"

  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error("[v0] Missing Discord credentials - clientId:", !!clientId, "clientSecret:", !!clientSecret)
    return Response.redirect(`${baseUrl}/login?error=config_error`, 302)
  }

  try {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    })

    console.log("[v0] Token exchange attempt - redirect_uri:", redirectUri, "code length:", code.length)

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error("[v0] Discord token exchange FAILED:", {
        status: tokenRes.status,
        statusText: tokenRes.statusText,
        body: errText,
        redirectUri,
        codeLength: code.length,
      })
      return Response.redirect(`${baseUrl}/login?error=token_exchange_failed`, 302)
    }

    console.log("[v0] Token exchange successful!")

    const tokenJson = (await tokenRes.json()) as TokenResponse

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      cache: "no-store",
    })

    if (!userRes.ok) {
      const errText = await userRes.text()
      console.error("Failed to fetch Discord user:", userRes.status, errText)
      return Response.redirect(`${baseUrl}/login?error=user_fetch_failed`, 302)
    }

    const discordUser = (await userRes.json()) as DiscordUser
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`
      : null

    const existingProfileResult = await query<{ discord_id: string }>(
      "SELECT discord_id FROM profiles WHERE discord_id = $1",
      [discordUser.id],
    )
    const isNewUser = existingProfileResult.rows.length === 0

    try {
      await upsertProfile({
        discord_id: discordUser.id,
        username: discordUser.username ?? null,
        global_name: discordUser.global_name ?? null,
        avatar_url: avatarUrl,
        email: discordUser.email ?? null,
      })
    } catch (error: any) {
      console.error("Failed to upsert user profile:", error.message)
      return Response.redirect(`${baseUrl}/login?error=database_error`, 302)
    }

    const expiresAt = new Date(Date.now() + tokenJson.expires_in * 1000)
    const sessionId = await createDbSession({
      discordId: discordUser.id,
      accessToken: tokenJson.access_token,
      refreshToken: tokenJson.refresh_token || null,
      tokenExpiresAt: expiresAt,
    })

    cookieStore.set("trade_session_id", sessionId, {
      httpOnly: true,
      secure: USE_SECURE_COOKIES,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })

    await addUserToGuild(discordUser.id, tokenJson.access_token)

    try {
      await query("INSERT INTO activities (discord_id, type, meta) VALUES ($1, $2, $3)", [
        discordUser.id,
        "login",
        JSON.stringify({ via: "discord" }),
      ])
    } catch (error) {
      console.error("Failed to log activity:", error)
    }

    console.log("[v0] Login successful for user:", discordUser.id, "isNewUser:", isNewUser)

    const redirectPath = isNewUser ? "/?welcome=true" : "/"
    return Response.redirect(`${baseUrl}${redirectPath}`, 302)
  } catch (error: any) {
    console.error("OAuth callback error:", error.message)
    return Response.redirect(`${baseUrl}/login?error=unexpected_error`, 302)
  }
}
