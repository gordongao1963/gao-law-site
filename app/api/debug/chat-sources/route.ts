import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const userMessage = "Can I ask for damages in a National Major Patent Infringement case in China?"

  // 1. Fetch KB
  const { data: kbEntries } = await supabase
    .from("knowledge_base")
    .select("*")
    .limit(100)

  console.log("[v0 DEBUG] KB entries found:", kbEntries?.length)

  // 2. Score and sort KB
  let knowledgeBaseResults = ""
  if (kbEntries && kbEntries.length > 0) {
    const scoredKB = kbEntries.map(entry => {
      const searchText = ((entry.question || "") + " " + (entry.answer || "") + " " + (entry.keywords || []).join(" ")).toLowerCase()
      const matchCount = userMessage.toLowerCase()
        .split(/\s+/)
        .filter((w: string) => w.length > 2)
        .filter((word: string) => searchText.includes(word)).length
      
      return { entry, score: matchCount }
    })
    
    const sortedKB = scoredKB.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return (b.entry.answer?.length || 0) - (a.entry.answer?.length || 0)
    })

    console.log("[v0 DEBUG] Top 5 KB matches:")
    sortedKB.slice(0, 5).forEach((s, i) => {
      console.log(`  ${i+1}. Score: ${s.score}, Question: "${s.entry.question?.substring(0, 50)}", Answer len: ${s.entry.answer?.length}`)
      console.log(`     Answer preview: "${s.entry.answer?.substring(0, 80)}..."`)
    })

    knowledgeBaseResults = sortedKB.map(({ entry }) => {
      if (entry.type === "qa") {
        return `Q: ${entry.question}\nA: ${entry.answer}`
      } else {
        return `Topic: ${entry.question || "General"}\nContent: ${entry.answer}`
      }
    }).join("\n\n---\n\n")
  }

  // 3. Fetch articles
  const { data: articles } = await supabase
    .from("articles")
    .select("title, description, content, authors")
    .eq("status", "published")
    .limit(20)

  let articlesContext = ""
  if (articles && articles.length > 0) {
    articlesContext = articles.map(a => {
      const authorNames = Array.isArray(a.authors) 
        ? a.authors.map((auth: any) => auth.name).join(", ")
        : "Gao.Law"
      return `Article: ${a.title}\nBy: ${authorNames}\nSummary: ${a.description}\nContent: ${a.content || ""}`
    }).join("\n\n---\n\n")
  }

  // 4. Fetch cases
  const { data: cases } = await supabase
    .from("cases")
    .select("case_name, case_number, court, case_type, summary, key_holdings, full_analysis, practice_tips, litigated_by_firm")
    .eq("status", "published")
    .order("decision_date", { ascending: false })
    .limit(30)

  let caseContext = cases?.map(c => `
Case: ${c.case_name}${c.litigated_by_firm ? " [Gao.Law Represented]" : ""}
Case Number: ${c.case_number || "N/A"}
Court: ${c.court || "N/A"}
Type: ${c.case_type}
Summary: ${c.summary}
Key Holdings: ${c.key_holdings || "N/A"}
Analysis: ${c.full_analysis || "N/A"}
Practice Tips: ${c.practice_tips || "N/A"}
`).join("\n---\n") || ""

  const systemPrompt = `You are an AI legal assistant for Gao.Law.

PRIORITY: Use KB first, then articles, then cases, then general knowledge.

KB (${knowledgeBaseResults.length} chars):
${knowledgeBaseResults}

ARTICLES (${articlesContext.length} chars):
${articlesContext}

CASES (${caseContext.length} chars):
${caseContext}
`

  return Response.json({
    user_message: userMessage,
    kb_entries_found: kbEntries?.length,
    kb_context_length: knowledgeBaseResults.length,
    articles_context_length: articlesContext.length,
    cases_context_length: caseContext.length,
    total_prompt_length: systemPrompt.length,
    kb_content_preview: knowledgeBaseResults.substring(0, 500),
    system_prompt_preview: systemPrompt.substring(0, 1000),
  })
}
