export const dynamic = "force-dynamic"
export const revalidate = 0

import { cookies } from "next/headers"
import { upsertProfile } from "@/lib/db/queries/profiles"
import { createSession as createDbSession } from "@/lib/db/queries/sessions"
import { query } from "@/lib/db/postgres"
import { appendFileSync } from "fs"

function debugLog(message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logMessage = data ? `[${timestamp}] ${message} ${JSON.stringify(data)}\n` : `[${timestamp}] ${message}\n`

  console.log(logMessage.trim())

  try {
    appendFileSync("/tmp/discord-oauth-debug.log", logMessage)
  } catch (e) {
    // Ignore file write errors
  }
}

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
    debugLog("[v0] Skipping guild join - DISCORD_GUILD_ID or DISCORD_BOT_TOKEN not configured")
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
      debugLog("[v0] Successfully added user to guild:", userId)
      return true
    } else if (response.status === 201) {
      debugLog("[v0] User was already in guild:", userId)
      return true
    } else {
      const errorText = await response.text()
      debugLog("[v0] Failed to add user to guild:", response.status, errorText)
      return false
    }
  } catch (error: any) {
    debugLog("[v0] Error adding user to guild:", error.message)
    return false
  }
}

export async function GET(req: Request) {
  debugLog("========== DISCORD CALLBACK STARTED ==========")

  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const error = url.searchParams.get("error")
  const cookieStore = await cookies()
  const storedState = cookieStore.get("discord_oauth_state")?.value

  const USE_SECURE_COOKIES = true
  const baseUrl = "https://rotraders.gg"

  debugLog("Callback params:", {
    hasCode: !!code,
    codeLength: code?.length,
    state,
    storedState,
    stateMatch: state === storedState,
    error,
  })

  if (error) {
    debugLog("OAuth error from Discord:", error)
    return Response.redirect(`${baseUrl}/login?error=oauth_denied`, 302)
  }

  if (!code || !state || !storedState || state !== storedState) {
    debugLog("State validation FAILED")
    return Response.redirect(`${baseUrl}/login?error=invalid_state`, 302)
  }

  cookieStore.delete("discord_oauth_state")

  const redirectUri = "https://rotraders.gg/api/auth/discord/callback"

  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET

  debugLog("Environment check:", {
    hasClientId: !!clientId,
    clientIdLength: clientId?.length,
    hasClientSecret: !!clientSecret,
    clientSecretLength: clientSecret?.length,
  })

  if (!clientId || !clientSecret) {
    debugLog("ERROR: Missing Discord credentials")
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

    debugLog("Attempting token exchange with Discord API...", { redirectUri, codeLength: code.length })

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })

    debugLog("Token exchange response:", {
      status: tokenRes.status,
      statusText: tokenRes.statusText,
      ok: tokenRes.ok,
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      debugLog("TOKEN EXCHANGE FAILED - Discord API Error:", {
        status: tokenRes.status,
        statusText: tokenRes.statusText,
        errorBody: errText,
        redirectUri,
        codeLength: code.length,
      })
      return Response.redirect(`${baseUrl}/login?error=token_exchange_failed`, 302)
    }

    debugLog("Token exchange SUCCESS!")

    const tokenJson = (await tokenRes.json()) as TokenResponse

    debugLog("Fetching Discord user info...")
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      cache: "no-store",
    })

    if (!userRes.ok) {
      const errText = await userRes.text()
      debugLog("User fetch FAILED:", { status: userRes.status, error: errText })
      return Response.redirect(`${baseUrl}/login?error=user_fetch_failed`, 302)
    }

    const discordUser = (await userRes.json()) as DiscordUser
    debugLog("Discord user fetched:", { id: discordUser.id, username: discordUser.username })

    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`
      : null

    const existingProfileResult = await query<{ discord_id: string }>(
      "SELECT discord_id FROM profiles WHERE discord_id = $1",
      [discordUser.id],
    )
    const isNewUser = existingProfileResult.rows.length === 0

    debugLog("Upserting profile...", { isNewUser })

    try {
      await upsertProfile({
        discord_id: discordUser.id,
        username: discordUser.username ?? null,
        global_name: discordUser.global_name ?? null,
        avatar_url: avatarUrl,
        email: discordUser.email ?? null,
      })
    } catch (error: any) {
      debugLog("Profile upsert FAILED:", error.message)
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
      debugLog("Activity log failed (non-critical):", error)
    }

    debugLog("Login complete! Redirecting user...", { isNewUser })

    const redirectPath = isNewUser ? "/?welcome=true" : "/"
    return Response.redirect(`${baseUrl}${redirectPath}`, 302)
  } catch (error: any) {
    debugLog("UNEXPECTED ERROR in callback:", { message: error.message, stack: error.stack })
    return Response.redirect(`${baseUrl}/login?error=unexpected_error`, 302)
  }
}
