'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, Trash2, Archive, Loader2 } from 'lucide-react'

interface Message {
  id: string
  name: string
  email: string
  company: string | null
  message: string
  read: boolean
  created_at: string
}

export function AdminInbox() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  async function fetchMessages() {
    try {
      const res = await fetch('/api/admin/messages')
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('[v0] Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteMessage(id: string) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMessages(messages.filter((m) => m.id !== id))
        setSelectedId(null)
      }
    } catch (error) {
      console.error('[v0] Failed to delete message:', error)
    } finally {
      setActionLoading(null)
    }
  }

  async function markAsRead(id: string) {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })
      if (res.ok) {
        setMessages(messages.map((m) => (m.id === id ? { ...m, read: true } : m)))
      }
    } catch (error) {
      console.error('[v0] Failed to mark as read:', error)
    }
  }

  const unreadCount = messages.filter((m) => !m.read).length
  const selectedMessage = messages.find((m) => m.id === selectedId)

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-serif mb-2">Contact Form Inbox</h2>
        <p className="text-muted-foreground">
          {messages.length} message{messages.length !== 1 ? 's' : ''} 
          {unreadCount > 0 && ` • ${unreadCount} unread`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No messages yet</p>
            </div>
          ) : (
            <div className="space-y-2 border border-border rounded-lg overflow-hidden">
              {messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    setSelectedId(msg.id)
                    if (!msg.read) markAsRead(msg.id)
                  }}
                  className={`w-full text-left p-4 border-b border-border hover:bg-muted/50 transition-colors ${
                    selectedId === msg.id ? 'bg-muted' : ''
                  } ${!msg.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${!msg.read ? 'text-blue-700 dark:text-blue-400' : ''}`}>
                        {msg.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {msg.message}
                      </p>
                    </div>
                    {!msg.read && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="border border-border rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-2xl font-serif mb-1">{selectedMessage.name}</h3>
                <p className="text-sm text-muted-foreground">
                  <a href={`mailto:${selectedMessage.email}`} className="hover:underline text-blue-600">
                    {selectedMessage.email}
                  </a>
                </p>
                {selectedMessage.company && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Company:</strong> {selectedMessage.company}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  {new Date(selectedMessage.created_at).toLocaleString()}
                </p>
              </div>

              <div className="border-t border-border pt-4">
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMessage(selectedMessage.id)}
                  disabled={actionLoading === selectedMessage.id}
                >
                  {actionLoading === selectedMessage.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${selectedMessage.email}?subject=Re: Your Message`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Reply
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-border rounded-lg p-12 text-center text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
