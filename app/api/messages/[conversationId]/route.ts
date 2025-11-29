import { NextResponse } from "next/server"
import { sql } from "@/lib/neon/server"

export async function GET(request: Request, { params }: { params: { conversationId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const before = searchParams.get("before")

    let query
    if (before) {
      query = await sql`
        SELECT * FROM messages
        WHERE conversation_id = ${params.conversationId}
        AND created_at < ${before}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    } else {
      query = await sql`
        SELECT * FROM messages
        WHERE conversation_id = ${params.conversationId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    }

    const messages = query.rows.reverse()
    return NextResponse.json({ messages, hasMore: messages.length === limit })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { conversationId: string } }) {
  try {
    const body = await request.json()
    const { sender_id, content, reply_to } = body

    const moderationResponse = await fetch(`${request.url.split("/api")[0]}/api/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: content }),
    })

    if (!moderationResponse.ok) {
      const error = await moderationResponse.json()
      return NextResponse.json({ error: error.reason || "Inappropriate content" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO messages (conversation_id, sender_id, content, reply_to, created_at, is_read)
      VALUES (${params.conversationId}, ${sender_id}, ${content}, ${reply_to || null}, NOW(), false)
      RETURNING *
    `

    await sql`
      UPDATE conversations
      SET last_message_at = NOW()
      WHERE id = ${params.conversationId}
    `

    return NextResponse.json({ message: result.rows[0] })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { conversationId: string } }) {
  try {
    const body = await request.json()
    const { message_id, action, content, emoji, user_id } = body

    if (action === "edit") {
      const moderationResponse = await fetch(`${request.url.split("/api")[0]}/api/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content }),
      })

      if (!moderationResponse.ok) {
        const error = await moderationResponse.json()
        return NextResponse.json({ error: error.reason || "Inappropriate content" }, { status: 400 })
      }

      const result = await sql`
        UPDATE messages
        SET content = ${content}, edited_at = NOW()
        WHERE id = ${message_id}
        RETURNING *
      `
      return NextResponse.json({ message: result.rows[0] })
    }

    if (action === "delete") {
      const result = await sql`
        UPDATE messages
        SET deleted_at = NOW(), content = 'This message was deleted'
        WHERE id = ${message_id}
        RETURNING *
      `
      return NextResponse.json({ message: result.rows[0] })
    }

    if (action === "mark_read") {
      await sql`
        UPDATE messages
        SET is_read = true
        WHERE conversation_id = ${params.conversationId}
        AND is_read = false
        AND sender_id != ${user_id}
      `
      return NextResponse.json({ success: true })
    }

    if (action === "reaction") {
      const messageResult = await sql`SELECT reactions FROM messages WHERE id = ${message_id}`
      const message = messageResult.rows[0]
      const reactions = (message?.reactions as any[]) || []

      const existingReaction = reactions.find((r: any) => r.emoji === emoji)
      let updatedReactions: any[]

      if (existingReaction) {
        if (existingReaction.users.includes(user_id)) {
          updatedReactions = reactions
            .map((r: any) => (r.emoji === emoji ? { ...r, users: r.users.filter((u: string) => u !== user_id) } : r))
            .filter((r: any) => r.users.length > 0)
        } else {
          updatedReactions = reactions.map((r: any) => (r.emoji === emoji ? { ...r, users: [...r.users, user_id] } : r))
        }
      } else {
        updatedReactions = [...reactions, { emoji, users: [user_id] }]
      }

      const result = await sql`
        UPDATE messages
        SET reactions = ${JSON.stringify(updatedReactions)}::jsonb
        WHERE id = ${message_id}
        RETURNING *
      `
      return NextResponse.json({ message: result.rows[0] })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating message:", error)
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 })
  }
}
