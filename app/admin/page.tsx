"use client"

import { useState, useEffect } from "react"
import { AdminDashboard } from "@/components/admin/dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock } from "lucide-react"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("admin_authenticated")
    if (token === "true") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        localStorage.setItem("admin_authenticated", "true")
        setIsAuthenticated(true)
      } else {
        setError("Invalid password")
      }
    } catch {
      setError("An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem("admin_authenticated")
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-background rounded-lg border border-border p-8 shadow-sm">
            <div className="flex justify-center mb-6">
              <div className="h-12 w-12 rounded-full bg-foreground flex items-center justify-center">
                <Lock className="h-6 w-6 text-background" />
              </div>
            </div>
            
            <h1 className="text-xl font-serif text-center mb-2">Admin Access</h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Enter your password to continue
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
              
              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Verifying..." : "Login"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              <a href="/admin/forgot-password" className="hover:text-foreground transition-colors">
                Forgot password?
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <AdminDashboard onLogout={handleLogout} />
}
