import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Known bot/crawler user agent patterns
const BOT_PATTERNS = [
  // Search engines
  "googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider", "yandexbot",
  "sogou", "exabot", "facebot", "ia_archiver",
  // AI crawlers
  "manus", "manus.im", // Manus AI agent
  "gptbot", "chatgpt-user", "ccbot", "anthropic-ai", "claudebot", "claude-web",
  "perplexitybot", "bard", "google-extended", "applebot", "cohere-ai",
  "ai2bot", "omgilibot", "petalbot", "semanticscholarbot", "diffbot",
  "amazonbot", "bytespider", "semrushbot", "ahrefsbot", "mj12bot",
  // Generic bot signals
  "bot", "crawler", "spider", "scraper", "headless", "python-requests",
  "axios", "curl", "wget", "libwww", "httpunit", "nutch", "go-http-client",
]

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase()
  return BOT_PATTERNS.some((pattern) => ua.includes(pattern))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get("user-agent") || ""
  const isBotVisitor = isBot(userAgent)
  const isHuman = !isBotVisitor
  
  // Check if user has admin session (authenticated)
  const adminSession = request.cookies.get("admin_session")
  const isAuthenticated = adminSession?.value === "authenticated"

  // Protect admin routes from all bots
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (isBotVisitor) {
      // Return a plain 404 — don't reveal that admin exists
      return new NextResponse(null, { status: 404 })
    }
  }

  // Redirect humans from home page to contact page (unless admin)
  if (pathname === "/" && isHuman && !isAuthenticated) {
    return NextResponse.redirect(new URL("/contact", request.url))
  }

  // For bots: set a cookie to bypass password gate
  if (isBotVisitor) {
    const response = NextResponse.next()
    response.cookies.set('bot_access', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
