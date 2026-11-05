import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { verifyPassword, safeEqual } from "@/lib/admin-password"
import {
  SESSION_COOKIE,
  createAdminSession,
  destroyAdminSession,
  isMissingTableError,
} from "@/lib/admin-auth"

// Login: checks the password stored by the reset flow first (Supabase,
// scrypt-hashed). If no password has ever been set that way, falls back to
// the ADMIN_PASSWORD env var. Once a reset password exists, the env var
// password stops working.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const password = body?.password
  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }

  let passwordOk = false
  try {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from("admin_credentials")
      .select("password_hash")
      .eq("id", "default")
      .maybeSingle()

    if (!error && data?.password_hash) {
      passwordOk = await verifyPassword(password, data.password_hash)
    } else if (error && !isMissingTableError(error)) {
      console.error("[v0] Admin credentials lookup failed:", error.message)
      passwordOk = false
    } else {
      // No stored password yet (or table not migrated): env var fallback.
      const adminPassword = process.env.ADMIN_PASSWORD
      passwordOk = !!adminPassword && safeEqual(password, adminPassword)
    }
  } catch (err) {
    console.error("[v0] Admin login error:", err)
    const adminPassword = process.env.ADMIN_PASSWORD
    passwordOk = !!adminPassword && safeEqual(password, adminPassword)
  }

  if (!passwordOk) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  const sessionToken = await createAdminSession()
  if (sessionToken) {
    // Real session: random token, httpOnly, checked against the database.
    response.cookies.set({
      name: SESSION_COOKIE,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    })
  } else {
    // Pre-migration fallback: the old static cookie. Stops working once
    // the sessions table exists (see lib/admin-auth.ts).
    response.cookies.set({
      name: SESSION_COOKIE,
      value: "authenticated",
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    })
  }
  return response
}

export async function DELETE() {
  await destroyAdminSession()
  const response = NextResponse.json({ success: true })
  response.cookies.delete(SESSION_COOKIE)
  return response
}
