import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { hashPassword, sha256 } from "@/lib/admin-password"
import { isMissingTableError } from "@/lib/admin-auth"

// Complete a password reset: verify the one-time token, then store the new
// scrypt-hashed password. The token is single-use and all existing login
// sessions are revoked, so anyone logged in with the old password is
// signed out.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const token = body?.token
  const password = body?.password

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 })
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })
  }

  try {
    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from("admin_password_resets")
      .select("id, expires_at, used_at")
      .eq("token_hash", sha256(token))
      .maybeSingle()

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json({ error: "setup_required" }, { status: 503 })
      }
      throw error
    }
    if (!data || data.used_at || new Date(data.expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    const { error: upsertError } = await supabase.from("admin_credentials").upsert({
      id: "default",
      password_hash: passwordHash,
      updated_at: new Date().toISOString(),
    })
    if (upsertError) throw upsertError

    await supabase
      .from("admin_password_resets")
      .update({ used_at: new Date().toISOString() })
      .eq("id", data.id)

    // Log everyone out: the old password must stop working everywhere.
    await supabase.from("admin_sessions").delete().gte("created_at", "1970-01-01T00:00:00Z")

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] Reset-password error:", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
