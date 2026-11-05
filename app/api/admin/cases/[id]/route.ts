import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
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

    const updateData: Record<string, unknown> = {}
    
    // Handle all editable fields
    if (body.status !== undefined) updateData.status = body.status
    if (body.status === "published") updateData.published_at = new Date().toISOString()
    if (body.case_name !== undefined) updateData.case_name = body.case_name
    if (body.case_type !== undefined) updateData.case_type = body.case_type
    if (body.court !== undefined) updateData.court = body.court || null
    if (body.case_number !== undefined) updateData.case_number = body.case_number || null
    if (body.decision_date !== undefined) updateData.decision_date = body.decision_date || null
    if (body.summary !== undefined) updateData.summary = body.summary
    if (body.key_holdings !== undefined) updateData.key_holdings = body.key_holdings
    if (body.full_analysis !== undefined) updateData.full_analysis = body.full_analysis
    if (body.practice_tips !== undefined) updateData.practice_tips = body.practice_tips
    
    // Landmark fields
    if (body.is_landmark !== undefined) updateData.is_landmark = body.is_landmark
    if (body.client_name !== undefined) updateData.client_name = body.client_name
    if (body.video_url !== undefined) updateData.video_url = body.video_url
    
    // Legacy field support (for backward compatibility)
    if (body.title !== undefined) updateData.case_name = body.title
    if (body.keyHoldings !== undefined) updateData.key_holdings = body.keyHoldings
    if (body.implications !== undefined) updateData.full_analysis = body.implications
    if (body.practiceTips !== undefined) updateData.practice_tips = body.practiceTips

    const { data, error } = await supabase
      .from("cases")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ case: data })
  } catch (error) {
    console.error("[v0] Update case error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update case" }, { status: 500 })
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

    const { error } = await supabase
      .from("cases")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete case error:", error)
    return NextResponse.json({ error: "Failed to delete case" }, { status: 500 })
  }
}
