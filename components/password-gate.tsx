"use client"

import { useState, useEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock } from "lucide-react"

interface PasswordGateProps {
  children: ReactNode
}

export function PasswordGate({ children }: PasswordGateProps) {
  const pathname = usePathname()
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [needsPassword, setNeedsPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Public routes that don't require password
  const publicRoutes = ["/articles", "/cases", "/contact"]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Check on mount if password is required
  useEffect(() => {
    // Public routes - don't require password
    if (isPublicRoute) {
      setIsUnlocked(true)
      setNeedsPassword(false)
      return
    }

    // Check for bot_access cookie (set by middleware for AI agents)
    const hasBotAccess = document.cookie.includes('bot_access=true')
    if (hasBotAccess) {
      setIsUnlocked(true)
      setNeedsPassword(false)
      return
    }

    // Check if already unlocked in localStorage
    const unlocked = localStorage.getItem("site_password_unlocked")
    if (unlocked === "true") {
      setIsUnlocked(true)
      setNeedsPassword(false)
      return
    }

    // Check if password protection is enabled
    fetch("/api/site-settings/password")
      .then(res => res.json())
      .then(data => {
        if (data.password) {
          setNeedsPassword(true)
        } else {
          // No password set - allow access
          setIsUnlocked(true)
          setNeedsPassword(false)
        }
      })
      .catch(() => {
        // On error, allow access (fail open)
        setIsUnlocked(true)
        setNeedsPassword(false)
      })
  }, [isPublicRoute, pathname])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/site-settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem("site_password_unlocked", "true")
        setIsUnlocked(true)
        setNeedsPassword(false)
      } else {
        setError("Incorrect password")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  // Show children if unlocked or doesn't need password
  if (isUnlocked || !needsPassword) {
    return <>{children}</>
  }

  // Show password prompt
  return (
    <div className="min-h-screen flex items-center justify-center bg-background z-40 relative">
      <div className="w-full max-w-md px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-serif mb-2">Gao.Law</h1>
          <p className="text-muted-foreground">This site is currently password protected</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-center"
            autoFocus
          />
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Checking..." : "Enter"}
          </Button>
        </form>
      </div>
    </div>
  )
}
