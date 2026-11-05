import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Upload to Blob storage
    const blob = await put(`cases/${Date.now()}-${file.name}`, file, {
      access: "private",
    })

    return NextResponse.json({ 
      pathname: blob.pathname,
      url: blob.url,
      filename: file.name
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
