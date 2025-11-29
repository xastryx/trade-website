import { sql } from "@/lib/neon/server"

export async function getActiveTrades(userId?: string) {
  if (userId) {
    return await sql`
      SELECT * FROM trades
      WHERE status = 'active' AND discord_id = ${userId}
      ORDER BY created_at DESC
    `
  }

  return await sql`
    SELECT * FROM trades
    WHERE status = 'active'
    ORDER BY created_at DESC
  `
}

export async function getTradeById(id: string) {
  const results = await sql`
    SELECT * FROM trades WHERE id = ${id}
  `
  return results[0]
}

export async function createTrade(
  discordId: string,
  game: string,
  offering: string[],
  requesting: string[],
  notes = "",
) {
  const results = await sql`
    INSERT INTO trades (discord_id, game, offering, requesting, notes, status, created_at, updated_at)
    VALUES (${discordId}, ${game}, ${JSON.stringify(offering)}, ${JSON.stringify(requesting)}, ${notes}, 'active', NOW(), NOW())
    RETURNING *
  `
  return results[0]
}

export async function updateTradeStatus(id: string, status: string) {
  const results = await sql`
    UPDATE trades
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return results[0]
}
