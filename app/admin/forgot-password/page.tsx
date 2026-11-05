"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { KeyRound } from "lucide-react"

export default function AdminForgotPasswordPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "setup_required" | "error">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("sending")

    try {
      const res = await fetch("/api/admin/forgot-password", { method: "POST" })
      if (res.status === 503) {
        setStatus("setup_required")
      } else if (res.ok) {
        setStatus("sent")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-foreground text-background rounded mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Reset admin password</h1>
          <p className="text-muted-foreground mt-2">
            We will email a reset link to your admin address (gao@gao.law). The link expires in 30 minutes and works once.
          </p>
        </div>

        {status === "sent" ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-foreground">
              If the reset is set up, an email is on its way to gao@gao.law. Check your inbox (and spam folder) for the link.
            </p>
            <p className="text-center text-sm text-muted-foreground">
              <a href="/admin/login" className="hover:text-foreground transition-colors">
                Back to sign in
              </a>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status === "setup_required" && (
              <p className="text-sm text-destructive text-center">
                Password reset is not set up yet — the database setup (scripts/014_create_admin_security.sql) has not been run in Supabase.
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-destructive text-center">
                Something went wrong. Please try again in a moment.
              </p>
            )}

            <Button type="submit" className="w-full h-12" disabled={status === "sending"}>
              {status === "sending" ? "Sending..." : "Email me a reset link"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          <a href="/admin/login" className="hover:text-foreground transition-colors">
            Back to sign in
          </a>
        </p>
      </div>
    </div>
  )
}
