import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { page, user_agent, referrer, device_type, browser, os, language, screen_resolution, timezone, ip_address, country, city, region } = await request.json()

    const supabase = await createClient()

    // Detect if visitor is an AI crawler
    const crawlerPatterns = [
      /googlebot/i,
      /bingbot/i,
      /slurp/i,
      /duckduckbot/i,
      /baiduspider/i,
      /yandexbot/i,
      /facebookexternalhit/i,
      /twitterbot/i,
      /linkedinbot/i,
      /whatsapp/i,
      /slackbot/i,
      /applebot/i,
      /perplexitybot/i,
      /claudebot/i,
      /gptbot/i,
      /chatgpt/i,
      /anthropic/i,
      /openai/i,
    ]

    const is_crawler = crawlerPatterns.some((pattern) =>
      pattern.test(user_agent || "")
    )

    // Extract crawler name
    let visitor_name = "Human"
    if (is_crawler) {
      const match = user_agent?.match(/googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|slackbot|applebot|perplexitybot|claudebot|gptbot|chatgpt|anthropic|openai/i)
      visitor_name = match ? match[0] : "Unknown Crawler"
    }

    // Use correct column names matching the database schema
    const { error } = await supabase.from("visitor_logs").insert({
      path: page,
      user_agent,
      referer: referrer,
      visitor_type: is_crawler ? "crawler" : "human",
      visitor_name,
      ip_address: ip_address || null,
      country: country || "unknown",
      city: city || null,
      region: region || null,
      device_type: device_type || null,
      browser: browser || null,
      os: os || null,
      language: language || null,
      screen_resolution: screen_resolution || null,
      timezone: timezone || null,
    })

    if (error) {
      console.error("[v0] Visitor log error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Visitor tracking error:", error)
    return NextResponse.json({ error: "Failed to log visitor" }, { status: 500 })
  }
}
