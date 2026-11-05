import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdminApi } from "@/lib/admin-auth"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("messages")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: data })
  } catch (error) {
    console.error("[v0] Failed to update message:", error)
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase.from("messages").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to delete message:", error)
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
  }
}
