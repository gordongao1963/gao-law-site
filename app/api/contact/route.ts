import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    // Handle both JSON and FormData
    let data
    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('application/json')) {
      data = await request.json()
    } else {
      // Fallback
      const text = await request.text()
      try {
        data = JSON.parse(text)
      } catch {
        data = { message: text }
      }
    }

    const { name, email, company, message } = data

    if (!message) {
      return NextResponse.json(
        { error: "Missing message field" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const resendKey = process.env.RESEND_API_KEY

    console.log("[v0] Contact/Chat message received:", { name, email, company })

    // Try to send via email first (if it's not auto-saved chat)
    if (resendKey && !message.includes("Auto-saved")) {
      try {
        const { Resend } = await import("resend")
        const resend = new Resend(resendKey)

        const toEmail = process.env.CONTACT_EMAIL_TO || "info@gao.law"
        const fromEmail = process.env.CONTACT_EMAIL_FROM || "noreply@gao.law"

        const result = await resend.emails.send({
          from: fromEmail,
          to: toEmail,
          subject: `New Contact Form Submission from ${name || "Visitor"}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name || "Not provided"}</p>
            <p><strong>Email:</strong> ${email || "Not provided"}</p>
            <p><strong>Company:</strong> ${company || "Not provided"}</p>
            <p><strong>Message:</strong></p>
            <p>${(message || "").replace(/\n/g, "<br>")}</p>
          `,
          replyTo: email || "noreply@example.com",
        })

        if (!result.error) {
          console.log("[v0] Email sent successfully")
          // Email sent successfully
          return NextResponse.json({ success: true, method: "email" })
        }
      } catch (err) {
        console.warn("[v0] Email sending failed, falling back to inbox:", err)
      }
    }

    // Save to inbox (messages table) in database
    console.log("[v0] Saving to inbox/messages table")
    const { data: insertedData, error } = await supabase
      .from("messages")
      .insert({
        name: name || "Chat Visitor",
        email: email || "chat@visitor.local",
        company: company || "Chat Widget",
        message,
      })
      .select()

    if (error) {
      console.error("[v0] Supabase insert error:", error)
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    console.log("[v0] Message saved to inbox with ID:", insertedData?.[0]?.id)
    return NextResponse.json({ success: true, method: "inbox", id: insertedData?.[0]?.id })
  } catch (error) {
    console.error("[v0] Contact form error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
