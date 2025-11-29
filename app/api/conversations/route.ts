import { NextResponse } from "next/server"
import { sql } from "@/lib/neon/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const conversations = await sql`
      SELECT c.*, 
        p.discord_id as other_discord_id,
        p.username as other_username,
        p.global_name as other_global_name,
        p.avatar_url as other_avatar_url,
        (
          SELECT COUNT(*)::int
          FROM messages m
          WHERE m.conversation_id = c.id
          AND m.is_read = false
          AND m.sender_id != ${userId}
        ) as unread_count
      FROM conversations c
      LEFT JOIN profiles p ON (
        CASE 
          WHEN c.participant1_id = ${userId} THEN c.participant2_id = p.discord_id
          WHEN c.participant2_id = ${userId} THEN c.participant1_id = p.discord_id
        END
      )
      WHERE c.participant1_id = ${userId} OR c.participant2_id = ${userId}
      ORDER BY c.last_message_at DESC NULLS LAST
    `

    const formattedConversations = conversations.rows.map((c: any) => ({
      id: c.id,
      participant1_id: c.participant1_id,
      participant2_id: c.participant2_id,
      last_message_at: c.last_message_at,
      pinned: c.pinned,
      otherUser: {
        discord_id: c.other_discord_id,
        username: c.other_username,
        global_name: c.other_global_name,
        avatar_url: c.other_avatar_url,
      },
      unreadCount: c.unread_count,
    }))

    return NextResponse.json({ conversations: formattedConversations })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 })
    }

    await sql`DELETE FROM messages WHERE conversation_id = ${conversationId}`
    await sql`DELETE FROM conversations WHERE id = ${conversationId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting conversation:", error)
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { conversationId, pinned } = body

    const result = await sql`
      UPDATE conversations
      SET pinned = ${pinned}
      WHERE id = ${conversationId}
      RETURNING *
    `

    return NextResponse.json({ conversation: result.rows[0] })
  } catch (error) {
    console.error("Error updating conversation:", error)
    return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 })
  }
}
