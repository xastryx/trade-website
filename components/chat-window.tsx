"use client"

import type React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft, Send, Loader2, Check, CheckCheck, WifiOff, Wifi, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { MessageActionsMenu } from "@/components/message-actions-menu"
import { EmojiPicker } from "@/components/emoji-picker"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Reaction = {
  emoji: string
  users: string[]
}

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
  edited_at?: string | null
  deleted_at?: string | null
  reply_to?: string | null
  reactions?: Reaction[]
  status?: "sending" | "sent" | "delivered" | "read" | "failed"
  tempId?: string
}

type Conversation = {
  id: string
  otherUser: {
    discord_id: string
    username: string | null
    global_name: string | null
    avatar_url: string | null
  }
}

export function ChatWindow({
  conversation,
  currentUserId,
  onBack,
}: {
  conversation: Conversation
  currentUserId: string
  onBack: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const lastTypingTimeRef = useRef<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null)
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)
  const fetchingRef = useRef(false)
  const markingReadRef = useRef(false)
  const pollingRef = useRef<NodeJS.Timeout>()

  const displayName = conversation.otherUser.global_name || conversation.otherUser.username || "Unknown User"
  const avatarUrl = conversation.otherUser.avatar_url || "/placeholder.svg?height=40&width=40"

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3")
    audioRef.current.volume = 0.5
  }, [])

  useEffect(() => {
    fetchMessages()
    markMessagesAsRead()

    pollingRef.current = setInterval(() => {
      fetchMessages(true)
    }, 2000)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      fetchingRef.current = false
      markingReadRef.current = false
    }
  }, [conversation.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container || loadingMore || !hasMore) return

    if (container.scrollTop === 0) {
      loadMoreMessages()
    }
  }, [loadingMore, hasMore])

  async function fetchMessages(silent = false) {
    if (fetchingRef.current) return
    fetchingRef.current = true

    if (!silent) setLoading(true)

    try {
      const response = await fetch(`/api/messages/${conversation.id}?limit=50`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      const messagesWithStatus = (data.messages || []).map((msg: any) => ({
        ...msg,
        status: msg.is_read ? "read" : msg.sender_id === currentUserId ? "delivered" : undefined,
      }))

      if (silent && messagesWithStatus.length > messages.length) {
        const newMsgs = messagesWithStatus.filter((msg: Message) => !messages.find((m) => m.id === msg.id))
        if (newMsgs.some((msg: Message) => msg.sender_id !== currentUserId)) {
          audioRef.current?.play().catch(() => {})
          markMessagesAsRead()
        }
      }

      setMessages(messagesWithStatus)
      setHasMore(data.hasMore)
    } catch (error) {
      console.error("Error fetching messages:", error)
      setIsConnected(false)
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }

  async function loadMoreMessages() {
    if (messages.length === 0 || loadingMore) return

    setLoadingMore(true)
    try {
      const oldestMessage = messages[0]
      const response = await fetch(`/api/messages/${conversation.id}?limit=50&before=${oldestMessage.created_at}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      if (data.messages && data.messages.length > 0) {
        const messagesWithStatus = data.messages.map((msg: any) => ({
          ...msg,
          status: msg.is_read ? "read" : msg.sender_id === currentUserId ? "delivered" : undefined,
        }))
        setMessages((prev) => [...messagesWithStatus, ...prev])
        setHasMore(data.hasMore)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error loading more messages:", error)
    } finally {
      setLoadingMore(false)
    }
  }

  async function markMessagesAsRead() {
    if (markingReadRef.current) return
    markingReadRef.current = true

    try {
      await fetch(`/api/messages/${conversation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", user_id: currentUserId }),
      })
    } catch (error) {
      console.error("Error marking messages as read:", error)
    } finally {
      markingReadRef.current = false
    }
  }

  function handleTyping() {}

  const handleEditMessage = async (messageId: string) => {
    if (!editContent.trim() || sending) return

    setSending(true)

    try {
      const response = await fetch(`/api/messages/${conversation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message_id: messageId,
          action: "edit",
          content: editContent.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setMessages((prev) => prev.map((m) => (m.id === messageId ? data.message : m)))
      setEditingMessageId(null)
      setEditContent("")
    } catch (error: any) {
      console.error("Error editing message:", error)
      alert(error.message || "Failed to edit message")
    } finally {
      setSending(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (sending) return
    setSending(true)

    try {
      const response = await fetch(`/api/messages/${conversation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message_id: messageId,
          action: "delete",
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setMessages((prev) => prev.map((m) => (m.id === messageId ? data.message : m)))
      setDeleteMessageId(null)
    } catch (error) {
      console.error("Error deleting message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    if (sending) return
    setSending(true)

    try {
      const response = await fetch(`/api/messages/${conversation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message_id: messageId,
          action: "reaction",
          emoji,
          user_id: currentUserId,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setMessages((prev) => prev.map((m) => (m.id === messageId ? data.message : m)))
      setShowEmojiPicker(null)
    } catch (error) {
      console.error("Error adding reaction:", error)
      alert("Failed to add reaction")
    } finally {
      setSending(false)
    }
  }

  const startEdit = (message: Message) => {
    setEditingMessageId(message.id)
    setEditContent(message.content)
  }

  const cancelEdit = () => {
    setEditingMessageId(null)
    setEditContent("")
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)

    const tempId = `temp-${Date.now()}`
    const messageContent = newMessage.trim()

    const optimisticMessage: Message = {
      id: tempId,
      tempId,
      conversation_id: conversation.id,
      sender_id: currentUserId,
      content: messageContent,
      created_at: new Date().toISOString(),
      is_read: false,
      status: "sending",
      reply_to: replyToMessage?.id || null,
    }

    setMessages((prev) => [...prev, optimisticMessage])
    setNewMessage("")
    setReplyToMessage(null)

    try {
      const response = await fetch(`/api/messages/${conversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: currentUserId,
          content: messageContent,
          reply_to: replyToMessage?.id || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setMessages((prev) => prev.map((m) => (m.tempId === tempId ? { ...data.message, status: "sent" } : m)))
    } catch (error: any) {
      console.error("Error sending message:", error)
      alert(error.message || "Failed to send message")
      setMessages((prev) => prev.map((m) => (m.tempId === tempId ? { ...m, status: "failed" } : m)))
    } finally {
      setSending(false)
    }
  }

  const retryMessage = async (message: Message) => {
    if (!message.tempId) return

    setMessages((prev) => prev.map((m) => (m.tempId === message.tempId ? { ...m, status: "sending" } : m)))

    try {
      const response = await fetch(`/api/messages/${conversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: currentUserId,
          content: message.content,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setMessages((prev) => prev.map((m) => (m.tempId === message.tempId ? { ...data.message, status: "sent" } : m)))
    } catch (error) {
      console.error("Error retrying message:", error)
      setMessages((prev) => prev.map((m) => (m.tempId === message.tempId ? { ...m, status: "failed" } : m)))
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  function renderMessageStatus(message: Message) {
    if (message.sender_id !== currentUserId) return null

    switch (message.status) {
      case "sending":
        return <Loader2 className="h-3 w-3 animate-spin" />
      case "sent":
        return <Check className="h-3 w-3" />
      case "delivered":
        return <CheckCheck className="h-3 w-3" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      case "failed":
        return (
          <button onClick={() => retryMessage(message)} className="text-red-500 text-xs underline">
            Retry
          </button>
        )
      default:
        return <Check className="h-3 w-3" />
    }
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="px-4 py-3 md:px-6 md:py-4 border-b border-border/50 bg-zinc-950/70 backdrop-blur-sm flex items-center gap-3 shadow-sm">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden -ml-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="relative">
          <Image
            src={avatarUrl || "/placeholder.svg?height=40&width=40"}
            alt={displayName}
            width={44}
            height={44}
            className="rounded-full object-cover ring-2 ring-border/50"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-base md:text-lg truncate">{displayName}</h2>
          <p className="text-xs md:text-sm text-muted-foreground truncate">
            {isTyping ? (
              <span className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1">typing</span>
              </span>
            ) : (
              `@${conversation.otherUser.username || "unknown"}`
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-500" title="Connected" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" title="Disconnected" />
          )}
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4 bg-zinc-950"
      >
        {loadingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Send className="h-8 w-8 opacity-50" />
              </div>
              <p className="text-sm md:text-base">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId
            const isDeleted = !!message.deleted_at
            const isEditing = editingMessageId === message.id
            const replyToMsg = message.reply_to ? messages.find((m) => m.id === message.reply_to) : null

            return (
              <div
                key={message.id || message.tempId}
                className={cn("flex group", isOwn ? "justify-end" : "justify-start")}
              >
                <div className="flex flex-col max-w-[85%] md:max-w-[70%]">
                  {showEmojiPicker === message.id && (
                    <div className="relative mt-2">
                      <EmojiPicker
                        onSelect={(emoji) => {
                          handleReaction(message.id, emoji)
                        }}
                        onClose={() => {
                          setShowEmojiPicker(null)
                        }}
                      />
                    </div>
                  )}

                  {replyToMsg && (
                    <div
                      className={cn(
                        "text-xs px-3 py-1.5 mb-1 rounded-t-lg border-l-2 backdrop-blur-sm",
                        isOwn ? "bg-primary/10 border-primary/50" : "bg-card border border-border/50 rounded-bl-lg",
                      )}
                    >
                      <p className="text-muted-foreground text-[10px] md:text-xs font-medium mb-0.5">Replying to</p>
                      <p className="truncate text-xs">{replyToMsg.content}</p>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <div
                      className={cn(
                        "flex-1 rounded-3xl px-3 py-2 md:px-4 md:py-2.5 shadow-md transition-all",
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-lg"
                          : "bg-card border border-border/50 rounded-bl-lg",
                        message.status === "failed" && "opacity-50",
                        isDeleted && "italic opacity-60",
                        !isDeleted && "hover:shadow-lg",
                      )}
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEditMessage(message.id)}>
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm md:text-base break-words leading-relaxed">{message.content}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <p
                              className={cn(
                                "text-[10px] md:text-xs",
                                isOwn ? "text-primary-foreground/60" : "text-muted-foreground",
                              )}
                            >
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                              {message.edited_at && !isDeleted && " (edited)"}
                            </p>
                            {isOwn && (
                              <span
                                className={cn(
                                  "text-xs flex items-center",
                                  isOwn ? "text-primary-foreground/60" : "text-muted-foreground",
                                )}
                              >
                                {renderMessageStatus(message)}
                              </span>
                            )}
                          </div>
                        </>
                      )}

                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {message.reactions.map((reaction) => (
                            <button
                              key={reaction.emoji}
                              onClick={() => handleReaction(message.id, reaction.emoji)}
                              className={cn(
                                "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs transition-all hover:scale-110",
                                reaction.users.includes(currentUserId)
                                  ? "bg-primary/20 border border-primary/50 shadow-md"
                                  : "bg-muted/50 hover:bg-muted border border-transparent",
                              )}
                            >
                              <span className="text-base">{reaction.emoji}</span>
                              <span className="text-xs font-medium">{reaction.users.length}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {!isDeleted && !isEditing && (
                      <MessageActionsMenu
                        messageId={message.id}
                        content={message.content}
                        isOwnMessage={isOwn}
                        onEdit={() => startEdit(message)}
                        onDelete={() => setDeleteMessageId(message.id)}
                        onReply={() => setReplyToMessage(message)}
                        onReact={() => setShowEmojiPicker(message.id)}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 md:p-4 border-t border-border/50 bg-zinc-900/70 backdrop-blur-sm">
        {replyToMessage && (
          <div className="flex items-center gap-2 mb-2 p-2 md:p-3 bg-muted/50 rounded-lg border border-border/50">
            <div className="flex-1 text-sm min-w-0">
              <p className="text-muted-foreground text-xs font-medium mb-0.5">Replying to:</p>
              <p className="truncate text-sm">{replyToMessage.content}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setReplyToMessage(null)}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
            }}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-background border-border/50 focus-visible:ring-primary/50 text-sm md:text-base"
            disabled={sending || !isConnected}
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !newMessage.trim() || !isConnected}
            className="rounded-full h-10 w-10 md:h-11 md:w-11 shrink-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
            ) : (
              <Send className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </Button>
        </div>
      </form>

      <AlertDialog open={!!deleteMessageId} onOpenChange={() => setDeleteMessageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMessageId && handleDeleteMessage(deleteMessageId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
