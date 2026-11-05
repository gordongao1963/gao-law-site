import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")
  
  console.log("[v0] Admin check - token:", token?.value ? "present" : "missing")

  if (token?.value !== "authenticated") {
    console.log("[v0] Not authenticated, redirecting to login")
    redirect("/admin/login")
  }
  console.log("[v0] Admin authenticated, proceeding")
}

export async function isAuthenticated() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")
  return token?.value === "authenticated"
}
