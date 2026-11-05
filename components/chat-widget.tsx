"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Send, User, Bot, Mail, MessageSquare, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

export function ChatWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [showEmailPrompt, setShowEmailPrompt] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [lastSavedCount, setLastSavedCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)
  const [chatId, setChatId] = useState(() => Date.now().toString())

  const { messages, sendMessage, status, setMessages } = useChat({
    id: chatId, // Unique ID forces fresh conversation
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { 
        email: emailSubmitted ? email : undefined,
        chatId: chatId, // Send to server to prevent caching
        timestamp: Date.now() // Unique per request
      },
    }),
  })

  const handleNewChat = () => {
    const newChatId = Date.now().toString()
    setChatId(newChatId) // Generate new chat ID
    setMessages([])
    setLastSavedCount(0)
    setSaved(false)
  }

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Load saved position from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("chatWidgetPosition")
    if (saved) {
      setPosition(JSON.parse(saved))
    }
  }, [])

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - (widgetRef.current?.offsetWidth || 380)
      const maxY = window.innerHeight - (widgetRef.current?.offsetHeight || 600)
      
      const boundedX = Math.max(0, Math.min(newX, maxX))
      const boundedY = Math.max(0, Math.min(newY, maxY))
      
      setPosition({ x: boundedX, y: boundedY })
    }

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        localStorage.setItem("chatWidgetPosition", JSON.stringify(position))
      }
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset, position])

  // Get button position with viewport bounds
  const getButtonPosition = () => {
    // Button is 56px (h-14 w-14)
    const buttonSize = 56
    const margin = 16 // 24px from edge - 8px extra padding
    
    // Guard against SSR - window not available
    if (typeof window === 'undefined') {
      return { right: '24px', bottom: '24px', left: 'auto', top: 'auto' }
    }
    
    const maxX = Math.max(window.innerWidth - buttonSize - margin, 0)
    
    // If position.x is set and within bounds, use it. Otherwise, position bottom-right
    if (position.x > 0 && position.x <= maxX) {
      return {
        left: `${position.x}px`,
        right: 'auto',
        top: `${Math.max(0, position.y)}px`,
        bottom: 'auto',
      }
    }
    
    // Default: bottom-right with safe margin
    return {
      left: 'auto',
      right: `${margin}px`,
      top: 'auto',
      bottom: `${margin}px`,
    }
  }

  const handleDragStart = (e: React.MouseEvent) => {
    if (!widgetRef.current) return
    const rect = widgetRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsDragging(true)
  }

  // Show email prompt after 3 messages from user
  useEffect(() => {
    const userMessages = messages.filter(m => m.role === "user")
    if (userMessages.length >= 3 && !emailSubmitted && !showEmailPrompt) {
      setShowEmailPrompt(true)
    }
  }, [messages, emailSubmitted, showEmailPrompt])

  // Auto-save conversation when visitor leaves page or switches tabs
  useEffect(() => {
    const saveToInbox = async () => {
      if (messages.length > 0 && messages.length > lastSavedCount) {
        console.log("[v0] Auto-save triggered, messages:", messages.length)
        try {
          const conversationText = messages.map(m => {
            const role = m.role === "user" ? "Visitor" : "Assistant"
            const text = getMessageText(m)
            return `${role}: ${text}`
          }).join("\n\n")

          await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: email || "Chat Visitor",
              email: email || "chat@visitor.local",
              company: "Via Chat Widget",
              message: `[Chat Conversation]\n\n${conversationText}`,
            }),
            keepalive: true,
          })
          setLastSavedCount(messages.length)
          console.log("[v0] Auto-save successful")
        } catch (e) {
          console.error("[v0] Auto-save failed:", e)
        }
      }
    }

    // Save when tab becomes hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        console.log("[v0] Tab hidden, auto-saving...")
        saveToInbox()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [messages, email, lastSavedCount])

  // Periodic auto-save every 60 seconds if there are new messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (messages.length > 0 && messages.length > lastSavedCount && !isSaving && !saved) {
        handleSaveConversation(true)
        setLastSavedCount(messages.length)
      }
    }, 60000) // Save every 60 seconds

    return () => clearInterval(interval)
  }, [messages.length, lastSavedCount, isSaving, saved])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    sendMessage({ text: inputValue })
    setInputValue("")
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setEmailSubmitted(true)
      setShowEmailPrompt(false)
    }
  }

  // Helper to extract text from message parts - must be defined before use
  const getMessageText = (message: typeof messages[0]): string => {
    if (!message.parts || !Array.isArray(message.parts)) return ""
    return message.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("")
  }

  const handleSaveConversation = async (silent = false) => {
    console.log("[v0] handleSaveConversation called, messages:", messages.length, "isSaving:", isSaving)
    if (messages.length === 0 || isSaving) return
    
    setIsSaving(true)
    try {
      // Format the conversation
      const conversationText = messages.map(m => {
        const role = m.role === "user" ? "Visitor" : "Assistant"
        const text = getMessageText(m)
        return `${role}: ${text}`
      }).join("\n\n")

      console.log("[v0] Saving conversation to inbox:", conversationText.substring(0, 100))

      // Save to messages table
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: email || "Chat Visitor",
          email: email || "chat@visitor.local",
          company: "Via Chat Widget",
          message: `[Chat Conversation]\n\n${conversationText}`,
        }),
      })

      console.log("[v0] Save response:", res.status, res.ok)

      if (res.ok) {
        setSaved(true)
        if (!silent) {
          setTimeout(() => setSaved(false), 5000)
        }
      }
    } catch (err) {
      console.error("[v0] Failed to save conversation:", err)
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-save when closing chat with messages
  const handleClose = async () => {
    console.log("[v0] handleClose called, messages:", messages.length, "lastSavedCount:", lastSavedCount)
    if (messages.length > 0 && messages.length > lastSavedCount) {
      console.log("[v0] Saving conversation before close...")
      await handleSaveConversation(true)
      setLastSavedCount(messages.length)
    }
    setIsOpen(false)
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        onMouseDown={handleDragStart}
        style={getButtonPosition()}
        className={cn(
          "fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-700",
          isOpen && "hidden"
        )}
        aria-label="Open chat"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      <div
        ref={widgetRef}
        style={{
          left: position.x ? `${position.x}px` : 'auto',
          right: position.x ? 'auto' : '24px',
          top: position.y ? `${position.y}px` : 'auto',
          bottom: position.y ? 'auto' : '24px',
        }}
        className={cn(
          "fixed z-50 flex w-[380px] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl transition-all duration-300",
          isOpen ? "h-[600px] opacity-100" : "h-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between border-b border-border bg-foreground px-4 py-3 text-background cursor-grab active:cursor-grabbing"
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background/20">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-sm">Gao.Law Assistant</p>
              <p className="text-xs opacity-80">IP Law Expertise</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {saved && (
              <div className="mr-2 text-xs text-green-300 font-medium">✓ Saved</div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                console.log("[v0] Manual save button clicked")
                await handleSaveConversation(false)
              }}
              disabled={messages.length === 0 || isSaving}
              title="Save conversation"
              className="h-8 w-8 p-0 text-background hover:bg-background/20"
            >
              <Mail className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 text-background hover:bg-background/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Bot className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">Welcome to Gao.Law</h3>
              <p className="text-sm text-muted-foreground mb-4">
                How can I help you with your IP questions today?
              </p>
              <div className="space-y-2">
                {[
                  "What types of IP cases do you handle?",
                  "How does patent litigation work in China?",
                  "Tell me about your landmark cases",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      sendMessage({ text: suggestion })
                    }}
                    className="block w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  message.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-muted"
                )}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                  message.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-muted"
                )}
              >
                <p className="whitespace-pre-wrap">{getMessageText(message)}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-lg bg-muted px-3 py-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </div>
            </div>
          )}

          {/* Email Prompt */}
          {showEmailPrompt && !emailSubmitted && (
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Stay connected?</p>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Share your email for detailed follow-up from our team.
              </p>
              <form onSubmit={handleEmailSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button type="submit" size="sm" className="h-8 px-3">
                  Save
                </Button>
              </form>
              <button
                onClick={() => setShowEmailPrompt(false)}
                className="text-xs text-muted-foreground mt-2 hover:underline"
              >
                No thanks
              </button>
            </div>
          )}

          {emailSubmitted && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-2 text-center">
              <p className="text-xs text-green-800">
                Thanks! We&apos;ll follow up at {email}
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-border p-3 flex gap-2"
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about IP law..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* Disclaimer */}
        <div className="border-t border-border px-3 py-2 bg-muted/30">
          <p className="text-[10px] text-muted-foreground text-center">
            For informational purposes only. Not legal advice.
          </p>
        </div>
      </div>
    </>
  )
}
