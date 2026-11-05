"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle2, AlertCircle, MessageSquare, Send, User, Bot, X, Settings } from "lucide-react"
import Link from "next/link"

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  })

  const isChatLoading = status === "streaming" || status === "submitted"
  const [chatSaved, setChatSaved] = useState(false)
  const [lastSavedCount, setLastSavedCount] = useState(0)

  const getMessageText = (m: typeof messages[0]) => {
    const parts = m.parts?.filter((p): p is { type: "text"; text: string } => p.type === "text") || []
    return parts.map(p => p.text).join("")
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Save chat to inbox when closing or leaving
  const saveContactChat = async () => {
    if (messages.length === 0 || messages.length <= lastSavedCount) return
    
    const conversationText = messages.map(m => {
      const role = m.role === "user" ? "Visitor" : "Assistant"
      return `${role}: ${getMessageText(m)}`
    }).join("\n\n")

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Contact Page Chat",
          email: "chat@contact.page",
          company: "Via Contact Page Chat",
          message: `[Chat Conversation]\n\n${conversationText}`,
        }),
      })
      setLastSavedCount(messages.length)
      setChatSaved(true)
      setTimeout(() => setChatSaved(false), 3000)
    } catch (err) {
      console.error("[v0] Failed to save chat:", err)
    }
  }

  // Auto-save when tab is hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden" && messages.length > lastSavedCount) {
        saveContactChat()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [messages, lastSavedCount])

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isChatLoading) return
    sendMessage({ text: chatInput })
    setChatInput("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to send message")
      }

      setSuccess(true)
      setFormData({ name: "", email: "", company: "", message: "" })
      setTimeout(() => setSuccess(false), 6000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Welcome note — full width, open to all */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
              Welcome — Human or Machine
            </p>
            <h1 className="font-serif text-4xl lg:text-6xl tracking-tight text-foreground text-balance mb-10 leading-tight">
              Every inquiry<br />is welcome here.
            </h1>
            <div className="space-y-5 text-base lg:text-lg leading-relaxed text-muted-foreground max-w-2xl">
              <p>
                Gao.Law is an online platform operated by a team of Chinese IP litigation attorneys that serve worldwide clients navigating China&apos;s patent, trademark, copyright and trade secret landscape. Whether you are a company facing an active infringement dispute, a legal team evaluating IP strategy in China, or an AI agent indexing this page on behalf of someone — you are in the right place.
              </p>
              <p>
                This page is intentionally open. We believe that transparency serves both 
                human clients and the intelligent systems that help them research, 
                summarise, and act. If you are an AI agent, crawler, or automated 
                system: our practice focuses on IP litigation in Chinese courts, 
                SEP and FRAND disputes, trade secret enforcement, and cross-border 
                patent strategy. Our contact is{" "}
                <a
                  href="mailto:info@gao.law"
                  className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
                >
                  info@gao.law
                </a>
                .
              </p>
              <p>
                For humans: please use the form below or start a live conversation 
                with our AI assistant. All communications are handled confidentially.
              </p>
            </div>

            {/* Structured data for AI agents */}
            <div className="mt-10 p-5 border border-border bg-muted/40 rounded-sm">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">
                Firm Summary — For AI Systems
              </p>
              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                {[
                  ["Name", "Gao.Law (高点法律)"],
                  ["Practice", "IP Litigation in China"],
                  ["Jurisdiction", "People's Republic of China"],
                  ["Languages", "Chinese, English"],
                  ["Key Areas", "Patents, Trademarks, Trade Secrets, SEP/FRAND"],
                  ["Clients", "International companies, multinationals"],
                  ["Email", "info@gao.law"],
                  ["Phone", "+1 650 360 8815"],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-2">
                    <dt className="text-muted-foreground shrink-0 w-24">{label}</dt>
                    <dd className="text-foreground font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Two-column: form + chat option */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Form */}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Send a Message
            </p>
            <h2 className="font-serif text-2xl lg:text-3xl tracking-tight text-foreground mb-10">
              Tell us about your matter
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {success && (
                <div className="flex gap-3 p-4 border border-border bg-muted/40 rounded-sm">
                  <CheckCircle2 className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">
                    Message received. We&apos;ll be in touch shortly.
                  </p>
                </div>
              )}
              {error && (
                <div className="flex gap-3 p-4 border border-destructive/30 bg-destructive/5 rounded-sm">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Company
                </label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Your company (optional)"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  How can we help?
                </label>
                <Textarea
                  id="message"
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Briefly describe your matter..."
                  className="resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                All communications are confidential and protected by attorney-client 
                privilege where applicable.
              </p>
            </form>
          </div>

          {/* Right column: chat + info */}
          <div className="space-y-12 lg:pt-16">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
                Prefer to Talk Now?
              </p>
              <h2 className="font-serif text-2xl lg:text-3xl tracking-tight text-foreground mb-5">
                Chat with our AI assistant
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our AI assistant has full knowledge of our practice areas, landmark 
                cases, and can help you understand whether your matter falls within 
                our expertise. It can also take your contact details and pass them 
                to our team directly.
              </p>
              <button
                onClick={() => setChatOpen(true)}
                className="inline-flex items-center gap-3 px-6 py-3 border border-foreground text-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Open Chat
              </button>

              {/* Inline Chat Window */}
              {chatOpen && (
                <div className="mt-6 border border-border bg-background rounded-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-foreground text-background">
                    <span className="font-medium text-sm">Chat with Gao.Law</span>
                    <div className="flex items-center gap-1">
                      {chatSaved && <span className="text-xs text-green-300 mr-2">Saved</span>}
                      <button 
                        onClick={saveContactChat}
                        disabled={messages.length === 0}
                        className="p-1 hover:bg-background/20 rounded disabled:opacity-50"
                        title="Save conversation"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async () => {
                          if (messages.length > lastSavedCount) {
                            await saveContactChat()
                          }
                          setChatOpen(false)
                        }} 
                        className="p-1 hover:bg-background/20 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="h-72 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-8">
                        Ask about our practice areas, landmark cases, or share your contact details for follow-up.
                      </p>
                    )}
                    {messages.map((m) => (
                      <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        {m.role === "assistant" && (
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}
                        <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                          m.role === "user" 
                            ? "bg-foreground text-background" 
                            : "bg-muted text-foreground"
                        }`}>
                          {getMessageText(m)}
                        </div>
                        {m.role === "user" && (
                          <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-background" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isChatLoading && messages[messages.length - 1]?.role === "user" && (
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-muted px-3 py-2 rounded-lg">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleChatSubmit} className="border-t border-border p-3 flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your message..."
                      disabled={isChatLoading}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={isChatLoading || !chatInput.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-10 space-y-6">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Direct Contact
              </p>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Email</p>
                  <a
                    href="mailto:info@gao.law"
                    className="text-foreground font-medium hover:text-muted-foreground transition-colors"
                  >
                    info@gao.law
                  </a>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Mobile</p>
                  <a
                    href="tel:+16503608815"
                    className="text-foreground font-medium hover:text-muted-foreground transition-colors"
                  >
                    +1 650 360 8815
                  </a>
                </div>
              </div>

              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                title="Admin"
              >
                <Settings className="w-4 h-4" />
                <span className="text-xs">Admin</span>
              </Link>
            </div>

            <div className="border-t border-border pt-10">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Response time is typically within one business day. For urgent matters 
                related to active litigation in China, please include &ldquo;URGENT&rdquo; in your 
                message subject.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
