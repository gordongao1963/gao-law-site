import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdminApi } from "@/lib/admin-auth"

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("[v0] Database error fetching messages:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Fetched messages count:", data?.length || 0)
    return NextResponse.json({ messages: data })
  } catch (error) {
    console.error("[v0] Failed to fetch messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
