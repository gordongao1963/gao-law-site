import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { password } = await request.json()
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    console.error("[v0] ADMIN_PASSWORD environment variable not set")
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    )
  }

  console.log("[v0] Auth attempt, password length:", password?.length, "expected:", adminPassword.length)

  if (password === adminPassword) {
    console.log("[v0] Authentication successful")
    
    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: "admin_token",
      value: "authenticated",
      httpOnly: false,
      secure: false, // Allow in development
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    })
    return response
  }

  console.log("[v0] Authentication failed")
  return NextResponse.json({ error: "Invalid password" }, { status: 401 })
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete("admin_token")
  return response
}
