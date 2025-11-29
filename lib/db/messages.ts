import { sql } from "@/lib/neon/server"

export async function getMessagesByConversation(conversationId: string, limit = 50) {
  const results = await sql`
    SELECT * FROM messages
    WHERE conversation_id = ${conversationId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return results.reverse()
}

export async function getMessagesBeforeTimestamp(conversationId: string, timestamp: string, limit = 50) {
  const results = await sql`
    SELECT * FROM messages
    WHERE conversation_id = ${conversationId} AND created_at < ${timestamp}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return results.reverse()
}

export async function createMessage(
  conversationId: string,
  senderId: string,
  content: string,
  replyTo: string | null = null,
) {
  const results = await sql`
    INSERT INTO messages (conversation_id, sender_id, content, reply_to, read, created_at)
    VALUES (${conversationId}, ${senderId}, ${content}, ${replyTo}, false, NOW())
    RETURNING *
  `

  // Update conversation last_message_at
  await sql`
    UPDATE conversations
    SET last_message_at = NOW()
    WHERE id = ${conversationId}
  `

  return results[0]
}

export async function updateMessage(messageId: string, content: string) {
  const results = await sql`
    UPDATE messages
    SET content = ${content}, edited_at = NOW()
    WHERE id = ${messageId}
    RETURNING *
  `
  return results[0]
}

export async function deleteMessage(messageId: string) {
  const results = await sql`
    UPDATE messages
    SET deleted_at = NOW(), content = 'This message was deleted'
    WHERE id = ${messageId}
    RETURNING *
  `
  return results[0]
}

export async function markMessagesAsRead(conversationId: string) {
  await sql`
    UPDATE messages
    SET read = true
    WHERE conversation_id = ${conversationId} AND read = false
  `
}

export async function updateMessageReactions(messageId: string, reactions: any) {
  const results = await sql`
    UPDATE messages
    SET reactions = ${JSON.stringify(reactions)}
    WHERE id = ${messageId}
    RETURNING *
  `
  return results[0]
}
