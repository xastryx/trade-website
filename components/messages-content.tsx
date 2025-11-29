"use client"

import { useEffect, useState, useRef } from "react"
import { ConversationList } from "@/components/conversation-list"
import { ChatWindow } from "@/components/chat-window"
import { MessageSquare, Home, ArrowLeft } from "lucide-react"
import { cn } from "@/utils/cn"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type Conversation = {
  id: string
  participant_1_id: string
  participant_2_id: string
  last_message_at: string | null
  otherUser: {
    discord_id: string
    username: string | null
    global_name: string | null
    avatar_url: string | null
  }
  unreadCount: number
  pinned?: boolean
}

export function MessagesContent({
  currentUserId,
  initialConversationId,
}: {
  currentUserId: string
  initialConversationId?: string
}) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId || null)
  const [loading, setLoading] = useState(true)
  const fetchingRef = useRef(false)
  const pollingRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (fetchingRef.current) return
    fetchingRef.current = true

    fetchConversations().finally(() => {
      fetchingRef.current = false
    })

    pollingRef.current = setInterval(() => {
      fetchConversations()
    }, 3000)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
      fetchingRef.current = false
    }
  }, [currentUserId, selectedConversationId])

  useEffect(() => {
    if (initialConversationId) {
      setSelectedConversationId(initialConversationId)
    }
  }, [initialConversationId])

  useEffect(() => {
    if (selectedConversationId) {
      setConversations((prev) => prev.map((c) => (c.id === selectedConversationId ? { ...c, unreadCount: 0 } : c)))
    }
  }, [selectedConversationId])

  async function fetchConversations() {
    try {
      const response = await fetch(`/api/conversations?userId=${currentUserId}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setConversations(data.conversations)
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm("Are you sure you want to delete this conversation? This cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/conversations?conversationId=${conversationId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      setConversations((prev) => prev.filter((c) => c.id !== conversationId))

      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null)
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
      alert("Failed to delete conversation. Please try again.")
    }
  }

  const handlePinConversation = async (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId)
    if (!conversation) return

    try {
      const response = await fetch("/api/conversations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          pinned: !conversation.pinned,
        }),
      })

      if (!response.ok) throw new Error("Failed to pin")

      setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, pinned: !c.pinned } : c)))
    } catch (error) {
      console.error("Error pinning conversation:", error)
      alert("Failed to pin conversation. Please try again.")
    }
  }

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId)

  return (
    <div className="flex h-screen bg-zinc-950">
      <div
        className={cn(
          "w-full md:w-96 border-r border-border/50 bg-zinc-900/50 backdrop-blur-sm flex flex-col",
          selectedConversationId && "hidden md:flex",
        )}
      >
        <div className="p-4 md:p-6 border-b border-border/50 bg-zinc-900/70 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <span>Messages</span>
          </h1>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-9 gap-2 rounded-lg hover:bg-zinc-800/80 transition-colors"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
        </div>
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
          loading={loading}
          onDelete={handleDeleteConversation}
          onPin={handlePinConversation}
        />
      </div>

      <div className={cn("flex-1 flex flex-col", !selectedConversationId && "hidden md:flex")}>
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            currentUserId={currentUserId}
            onBack={() => setSelectedConversationId(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground bg-zinc-950">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                <MessageSquare className="h-10 w-10 opacity-30" />
              </div>
              <div>
                <p className="text-lg font-medium mb-1">Select a conversation</p>
                <p className="text-sm text-muted-foreground">Choose a conversation from the list to start messaging</p>
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-4 gap-2 rounded-lg hover:bg-zinc-800/80 transition-colors bg-transparent"
              >
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
