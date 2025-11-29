import { sql } from "@/lib/neon/server"

export async function getActivitiesByDiscordId(discordId: string, limit = 20) {
  const results = await sql`
    SELECT * FROM activities
    WHERE discord_id = ${discordId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return results
}

export async function createActivity(discordId: string | null, type: string, meta: any = null) {
  const results = await sql`
    INSERT INTO activities (discord_id, type, meta, created_at)
    VALUES (${discordId}, ${type}, ${meta ? JSON.stringify(meta) : null}, NOW())
    RETURNING *
  `
  return results[0]
}

export async function getRecentActivities(limit = 100) {
  const results = await sql`
    SELECT * FROM activities
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return results
}
