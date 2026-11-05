"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock } from "lucide-react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setDone(true)
      } else {
        setError(data?.error || "Something went wrong. Please try again.")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  if (!token) {
    return (
      <p className="text-sm text-destructive text-center">
        This page needs a reset link from your email. Request a new one from the sign-in page.
      </p>
    )
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-foreground">
          Your admin password has been changed. Anybody signed in with the old password has been signed out.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          <a href="/admin/login" className="hover:text-foreground transition-colors">
            Sign in with your new password
          </a>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="password"
          placeholder="New password (at least 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12"
          required
          autoFocus
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="h-12"
          required
        />
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <Button type="submit" className="w-full h-12" disabled={loading}>
        {loading ? "Saving..." : "Set new password"}
      </Button>
    </form>
  )
}

export default function AdminResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-foreground text-background rounded mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Choose a new password</h1>
          <p className="text-muted-foreground mt-2">This link works once and expires 30 minutes after it was sent.</p>
        </div>

        <Suspense>
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <a href="/admin/login" className="hover:text-foreground transition-colors">
            Back to sign in
          </a>
        </p>
      </div>
    </div>
  )
}
