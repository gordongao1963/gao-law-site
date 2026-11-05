import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdminApi } from "@/lib/admin-auth"

export async function GET(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const supabase = await createClient()

    // Fetch latest 200 visitor logs, sorted by most recent first
    const { data, error } = await supabase
      .from("visitor_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ logs: data })
  } catch (error) {
    console.error("[v0] Fetch visitor logs error:", error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}
