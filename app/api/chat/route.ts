import { streamText, convertToModelMessages } from "ai"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

// Disable caching for this route
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export async function POST(req: Request) {
  console.log("[v0] CHAT API CALLED")
  
  const { messages, email } = await req.json()
  console.log("[v0] Messages received:", messages.length)

  let supabase
  try {
    supabase = createServiceRoleClient()
    console.log("[v0] Supabase client created successfully")
  } catch (e: any) {
    console.error("[v0] SUPABASE CLIENT ERROR:", e.message)
    // Fallback - will continue without KB
  }

  // Get user's latest message for knowledge base search
  const userMessage = messages[messages.length - 1]?.content || ""
  const userMessageText = typeof userMessage === "string" ? userMessage : 
    (Array.isArray(userMessage) ? userMessage.map((p: any) => p.type === "text" ? p.text : "").join(" ") : "")

  console.log("[v0] USER MESSAGE TEXT:", userMessageText?.substring(0, 80))
  console.log("[v0] SUPABASE CLIENT:", supabase ? "✓ exists" : "✗ null")

  // Search all knowledge sources
  let knowledgeBaseResults = ""
  let articlesContext = ""
  // Helper function for keyword matching
  const matchesQuery = (text: string, query: string): boolean => {
    const searchWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    const textLower = text.toLowerCase()
    return searchWords.some(word => textLower.includes(word))
  }

  // Fetch knowledge base directly
  console.log("[v0] === FETCHING KB AND ARTICLES ===")
  
  if (supabase) {
    try {
      // Query knowledge base
      const { data: kbData, error: kbErr } = await supabase
        .from("knowledge_base")
        .select("id, question, answer, type, keywords")
        .limit(100)
      
      console.log("[v0] KB Query result: rows =", kbData?.length, ", error =", kbErr?.message || "none")
      
      if (kbData && kbData.length > 0) {
        knowledgeBaseResults = kbData.map((entry: any) => {
          return `Q: ${entry.question}\nA: ${entry.answer}`
        }).join("\n\n---\n\n")
        console.log("[v0] KB LOADED - total chars:", knowledgeBaseResults.length)
      }
      
      // Query articles
      const { data: articlesData, error: artErr } = await supabase
        .from("articles")
        .select("id, title, content, authors")
        .eq("status", "published")
        .limit(20)
      
      console.log("[v0] Articles Query result: rows =", articlesData?.length, ", error =", artErr?.message || "none")
      
      if (articlesData && articlesData.length > 0) {
        articlesContext = articlesData.map((article: any) => {
          return `Title: ${article.title}\nContent: ${article.content}`
        }).join("\n\n---\n\n")
        console.log("[v0] ARTICLES LOADED - total chars:", articlesContext.length)
      }
    } catch (e: any) {
      console.error("[v0] ERROR fetching KB/articles:", e.message)
    }
  }
  
  console.log("[v0] === KB AND ARTICLES FETCH COMPLETE ===")

  // Read markdown content files for website content (AI-friendly format)
  let websiteContent = ""
  const markdownFiles = [
    { name: "Homepage", path: "/content/index.md" },
    { name: "About", path: "/content/about.md" },
    { name: "Practice Areas", path: "/content/practice-areas.md" },
    { name: "Landmark Cases", path: "/content/landmark-cases.md" },
    { name: "Contact", path: "/content/contact.md" },
    { name: "Case Digests", path: "/content/cases.md" },
  ]
  
  try {
    const fs = await import("fs/promises")
    const path = await import("path")
    
    const contentParts: string[] = []
    for (const file of markdownFiles) {
      try {
        const filePath = path.join(process.cwd(), "public", file.path)
        const content = await fs.readFile(filePath, "utf-8")
        contentParts.push(`=== ${file.name} ===\n${content}`)
      } catch {
        // File doesn't exist, skip
      }
    }
    
    if (contentParts.length > 0) {
      websiteContent = contentParts.join("\n\n")
      console.log("[v0] MARKDOWN CONTENT LOADED - total chars:", websiteContent.length, "files:", contentParts.length)
    }
  } catch (err) {
    console.log("[v0] ERROR reading markdown files:", err)
  }

  // Fetch ALL published case digests for context (full library)
  const { data: cases } = await supabase
    .from("cases")
    .select("case_name, case_number, court, case_type, summary, key_holdings, full_analysis, practice_tips, litigated_by_firm")
    .eq("status", "published")
    .order("decision_date", { ascending: false })
    .limit(30)

  // Helper function to detect contact info from messages
  const detectContactInfo = (text: string) => {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const phonePattern = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g
    const namePattern = /(?:my name is|i'm|i am|this is|call me|i'm called)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi
    
    return {
      emails: text.match(emailPattern) || [],
      phones: text.match(phonePattern) || [],
      names: Array.from(text.matchAll(namePattern)).map(m => m[1]),
    }
  }

  // Check all messages for contact info
  const allText = messages.map((m: any) => {
    if (typeof m.content === "string") return m.content
    if (Array.isArray(m.content)) return m.content.map((c: any) => c.type === "text" ? c.text : "").join(" ")
    return ""
  }).join(" ")

  const contactInfo = detectContactInfo(allText)
  const hasContactInfo = contactInfo.emails.length > 0 || contactInfo.phones.length > 0 || email

  // If contact info detected, save the conversation immediately
  if (hasContactInfo) {
    try {
      const conversationText = messages.map((m: any) => {
        const role = m.role === "user" ? "Visitor" : "Assistant"
        let text = ""
        if (typeof m.content === "string") {
          text = m.content
        } else if (Array.isArray(m.content)) {
          text = m.content.map((c: any) => c.type === "text" ? c.text : "").join(" ")
        }
        return `${role}: ${text}`
      }).join("\n\n")

      const detectedEmail = contactInfo.emails[0] || email || "no-email@chat.visitor"
      const detectedName = contactInfo.names[0] || "Chat Visitor"
      const detectedPhone = contactInfo.phones[0] ? `Phone: ${contactInfo.phones[0]}` : "Via Chat Widget"

      console.log("[v0] Contact info detected, saving conversation:", { detectedEmail, detectedName, phones: contactInfo.phones })

      const { data, error } = await supabase.from("messages").insert({
        name: detectedName,
        email: detectedEmail,
        company: detectedPhone,
        message: `[Chat Conversation - Contact Auto-Detected]\n\n${conversationText}`,
      }).select()

      if (error) {
        console.error("[v0] Failed to save conversation with contact info:", error)
      } else {
        console.log("[v0] Conversation with contact info saved:", data?.[0]?.id)
      }
    } catch (err) {
      console.error("[v0] Error saving contact conversation:", err)
    }
  }

  // Build knowledge context from cases
  const caseContext = cases?.map(c => `
Case: ${c.case_name}${c.litigated_by_firm ? " [Gao.Law Represented]" : ""}
Case Number: ${c.case_number || "N/A"}
Court: ${c.court || "N/A"}
Type: ${c.case_type}
Summary: ${c.summary}
Key Holdings: ${c.key_holdings || "N/A"}
Analysis: ${c.full_analysis || "N/A"}
Practice Tips: ${c.practice_tips || "N/A"}
`).join("\n---\n") || ""

  const systemPrompt = `You are a helpful AI assistant for Gao.Law (高点法律), a leading Chinese intellectual property law firm.

ABOUT GAO.LAW:
- Full name: Gao.Law (高点法律)
- Specialty: Chinese IP litigation - patents, trademarks, trade secrets, copyright
- Unique strength: Bridge between international clients and Chinese IP system
- Contact: info@gao.law | www.gao.law

YOUR APPROACH:
1. FIRST check the internal knowledge sources below for Gao.Law-specific information
2. For firm-specific questions (address, services, team, cases), use ONLY the internal sources
3. For general legal questions or topics not covered internally, use your knowledge to provide helpful, accurate information
4. Always be helpful and conversational - never refuse to answer or say "I cannot help"
5. When using general knowledge, be clear it's general information and recommend consulting Gao.Law for specifics

═══════════════════════════════════════════════════════════════
WEBSITE CONTENT (Use for firm info, contact, services)
═══════════════════════════════════════════════════════════════
${websiteContent || "No website content loaded"}

═══════════════════════════════════════════════════════════════
KNOWLEDGE BASE (Authoritative Q&A - use these answers exactly)
═══════════════════════════════════════════════════════════════
${knowledgeBaseResults || "No KB entries"}

═══════════════════════════════════════════════════════════════
ARTICLES (Published insights and analysis)
═══════════════════════════════════════════════════════════════
${articlesContext || "No articles"}

═══════════════════════════════════════════════════════════════
CASE DIGESTS (Recent IP case summaries)
═══════════════════════════════════════════════════════════════
${caseContext || "No cases"}

RESPONSE STYLE:
- Be conversational and helpful
- Answer the current question directly
- For Gao.Law-specific info, cite the internal sources
- For general legal topics, provide helpful context from your knowledge
- Keep responses concise but complete
- End substantive legal discussions with: "For advice specific to your situation, please contact Gao.Law directly."`

  console.log("[v0] SYSTEM PROMPT SIZE:", systemPrompt.length, "chars")
  console.log("[v0] WEBSITE CONTENT IN PROMPT:", websiteContent ? "Yes (" + websiteContent.length + " chars)" : "EMPTY")
  console.log("[v0] KB CONTENT IN PROMPT:", knowledgeBaseResults ? knowledgeBaseResults.substring(0, 200) + "..." : "EMPTY")
  console.log("[v0] ARTICLES IN PROMPT:", articlesContext ? "Yes (" + articlesContext.length + " chars)" : "EMPTY")
  console.log("[v0] CASES IN PROMPT:", caseContext ? "Yes (" + caseContext.length + " chars)" : "EMPTY")
  
  try {
    // Pass all messages to maintain proper conversation context
    // The AI will answer only the latest question based on system prompt instructions
    const result = streamText({
      model: "anthropic/claude-sonnet-4-20250514",
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      temperature: 0.1, // Low temperature for consistent, factual answers from KB
    })

    const response = result.toUIMessageStreamResponse()
    // Add cache-control headers to prevent caching
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    return response
  } catch (err) {
    console.error("[v0] Chat error:", err)
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
