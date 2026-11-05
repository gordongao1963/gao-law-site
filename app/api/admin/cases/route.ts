import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { requireAdminApi } from "@/lib/admin-auth"

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const supabase = await createClient()
  const { data: cases, error } = await supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ cases })
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const supabase = await createClient()

    console.log("[v0] Saving case:", JSON.stringify(body).substring(0, 200))

    const { data, error } = await supabase
      .from("cases")
      .insert({
        case_name: body.title || body.caseName,
        case_number: body.caseNumber,
        case_type: body.category || body.caseType,
        court: body.court,
        decision_date: body.date || body.decisionDate,
        summary: body.summary,
        key_holdings: body.keyHoldings,
        full_analysis: body.implications || body.fullAnalysis,
        practice_tips: body.practiceTips,
        document_url: body.documentUrl,
        document_text: body.documentText || body.caseText,
        litigated_by_firm: body.litigatedByFirm || false,
        status: "draft",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Save case error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Case saved successfully:", data.id)
    return NextResponse.json({ case: data })
  } catch (error) {
    console.error("[v0] Create case error:", error)
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 })
  }
}
