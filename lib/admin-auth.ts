import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { sha256 } from "./admin-password"

export const SESSION_COOKIE = "admin_token"
const LEGACY_VALUE = "authenticated"
const SESSION_TTL_MS = 60 * 60 * 24 * 1000 // 24 hours

// Supabase/PostgREST error when a table does not exist yet (migration 014
// not run). We treat that as "pre-migration" and fall back to the old
// behaviour instead of locking everyone out.
export function isMissingTableError(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code
  const message = (error as { message?: string } | null)?.message || ""
  return code === "PGRST205" || message.includes("42P01") || message.includes("Could not find the table")
}

async function tableExists(table: string): Promise<boolean> {
  try {
    const supabase = createServiceRoleClient()
    const { error } = await supabase.from(table).select("id").limit(1)
    if (error) return !isMissingTableError(error)
    return true
  } catch {
    return false
  }
}

// Create a login session. Returns the raw token to put in the cookie, or
// null when the sessions table does not exist yet (pre-migration) — the
// caller then falls back to the legacy static cookie.
export async function createAdminSession(): Promise<string | null> {
  const token = randomBytes(32).toString("hex")
  try {
    const supabase = createServiceRoleClient()
    const { error } = await supabase.from("admin_sessions").insert({
      token_hash: sha256(token),
      expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    })
    if (error) return null
    return token
  } catch {
    return null
  }
}

// Best-effort: delete the session row matching the current cookie.
export async function destroyAdminSession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token || token === LEGACY_VALUE) return
    const supabase = createServiceRoleClient()
    await supabase.from("admin_sessions").delete().eq("token_hash", sha256(token))
  } catch {
    // Logout must not fail because the session row is already gone.
  }
}

// Is the current request from a logged-in admin?
export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return false

  if (token === LEGACY_VALUE) {
    // Pre-migration fallback: the old static cookie is accepted only while
    // the sessions table does not exist yet. Once migration 014 is run,
    // the static cookie stops working.
    return !(await tableExists("admin_sessions"))
  }

  try {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from("admin_sessions")
      .select("expires_at")
      .eq("token_hash", sha256(token))
      .maybeSingle()
    if (error || !data) return false
    return new Date(data.expires_at).getTime() > Date.now()
  } catch {
    return false
  }
}

// For server components / layouts: redirect to the login page when not admin.
export async function requireAdmin() {
  if (!(await verifyAdminSession())) {
    redirect("/admin/login")
  }
}

// For API routes: returns a 401 response when not admin, null when OK.
export async function requireAdminApi(): Promise<NextResponse | null> {
  if (await verifyAdminSession()) return null
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export async function isAuthenticated() {
  return verifyAdminSession()
}
