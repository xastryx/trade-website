import { sql } from "@/lib/neon/server"

export async function getUserInventory(discordId: string) {
  const results = await sql`
    SELECT ui.*, i.name, i.image_url, i.value, i.game
    FROM user_inventories ui
    JOIN items i ON ui.item_id = i.id
    WHERE ui.discord_id = ${discordId}
    ORDER BY ui.created_at DESC
  `
  return results
}

export async function addToInventory(discordId: string, itemId: string, quantity = 1) {
  const results = await sql`
    INSERT INTO user_inventories (discord_id, item_id, quantity, created_at, updated_at)
    VALUES (${discordId}, ${itemId}, ${quantity}, NOW(), NOW())
    ON CONFLICT (discord_id, item_id)
    DO UPDATE SET quantity = user_inventories.quantity + ${quantity}, updated_at = NOW()
    RETURNING *
  `
  return results[0]
}

export async function removeFromInventory(id: string, discordId: string) {
  const results = await sql`
    DELETE FROM user_inventories
    WHERE id = ${id} AND discord_id = ${discordId}
    RETURNING *
  `
  return results[0]
}
