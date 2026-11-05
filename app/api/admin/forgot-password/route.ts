import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { sha256, newResetToken } from "@/lib/admin-password"
import { isMissingTableError } from "@/lib/admin-auth"

const RESET_TTL_MS = 30 * 60 * 1000 // 30 minutes
const MAX_REQUESTS_PER_HOUR = 5

// Request a password-reset email. The recipient is fixed (the site owner's
// admin address) so there is nothing to enumerate, and the response is
// always a generic success.
export async function POST(request: Request) {
  try {
    const supabase = createServiceRoleClient()

    // Rate limit: at most 5 reset emails per hour.
    const { count, error: countError } = await supabase
      .from("admin_password_resets")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())

    if (countError) {
      if (isMissingTableError(countError)) {
        return NextResponse.json({ error: "setup_required" }, { status: 503 })
      }
      throw countError
    }
    if ((count ?? 0) >= MAX_REQUESTS_PER_HOUR) {
      return NextResponse.json({ success: true })
    }

    const token = newResetToken()
    const { error: insertError } = await supabase.from("admin_password_resets").insert({
      token_hash: sha256(token),
      expires_at: new Date(Date.now() + RESET_TTL_MS).toISOString(),
    })
    if (insertError) throw insertError

    const resendKey = process.env.RESEND_API_KEY
    const toEmail = process.env.ADMIN_RESET_EMAIL || "gao@gao.law"
    const fromEmail = process.env.CONTACT_EMAIL_FROM || "noreply@gao.law"
    const origin = new URL(request.url).origin
    const resetUrl = `${origin}/admin/reset-password?token=${token}`

    if (resendKey) {
      try {
        const { Resend } = await import("resend")
        const resend = new Resend(resendKey)
        const { error } = await resend.emails.send({
          from: fromEmail,
          to: toEmail,
          subject: "Reset your gao.law admin password",
          html: `
            <h2>Reset your gao.law admin password</h2>
            <p>Someone asked to reset the admin password for gao.law. If that was you, use the link below. It expires in 30 minutes and works once.</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>If you did not ask for this, you can ignore this email — your password has not changed.</p>
          `,
        })
        if (error) console.error("[v0] Reset email failed:", error)
        else console.log("[v0] Password reset email sent")
      } catch (err) {
        console.error("[v0] Reset email failed:", err)
      }
    } else {
      console.error("[v0] RESEND_API_KEY not set, cannot send reset email")
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] Forgot-password error:", err)
    return NextResponse.json({ error: "setup_required" }, { status: 503 })
  }
}
