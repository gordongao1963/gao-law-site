import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET - Check if password protection is enabled
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_password")
      .single()

    if (error || !data?.value) {
      return NextResponse.json({ password: null })
    }

    return NextResponse.json({ password: true }) // Don't expose actual password
  } catch {
    return NextResponse.json({ password: null })
  }
}

// POST - Verify password
export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_password")
      .single()

    if (error || !data?.value) {
      return NextResponse.json({ success: false, error: "No password set" })
    }

    if (data.value === password) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: "Incorrect password" })
  } catch {
    return NextResponse.json({ success: false, error: "Server error" })
  }
}
