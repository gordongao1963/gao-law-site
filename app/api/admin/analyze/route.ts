import { generateText, Output } from "ai"
import { NextResponse } from "next/server"
import { z } from "zod"

const CaseAnalysisSchema = z.object({
  title: z.string().describe("A concise, compelling title for the case"),
  caseNumber: z.string().nullable().describe("Official case number if mentioned"),
  court: z.string().nullable().describe("Court where the case was heard"),
  date: z.string().nullable().describe("Date of the ruling or key decision"),
  parties: z.object({
    plaintiff: z.string().nullable(),
    defendant: z.string().nullable(),
  }),
  summary: z.string().describe("A 2-3 paragraph executive summary of the case"),
  keyHoldings: z.array(z.string()).describe("List of 3-5 key legal holdings or rulings"),
  implications: z.string().describe("Analysis of broader implications for IP practice"),
  practiceTips: z.array(z.string()).describe("3-5 practical tips for practitioners based on this case"),
  category: z.enum(["patent", "trademark", "trade_secret", "copyright", "other"]),
  tags: z.array(z.string()).describe("Relevant tags for categorization"),
})

export async function POST(request: Request) {
  try {
    const { caseText, filename } = await request.json()

    console.log("[v0] Analyze API called, filename:", filename, "text length:", caseText?.length)

    if (!caseText) {
      return NextResponse.json({ error: "No case text provided" }, { status: 400 })
    }

    console.log("[v0] Starting AI analysis...")
    
    const result = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      system: `You are an expert intellectual property litigation analyst specializing in cross-border IP cases between the US and China. 

Your task is to analyze legal case documents and produce comprehensive case digests that are:
1. Accurate and legally precise
2. Accessible to both legal professionals and business executives
3. Focused on practical implications and strategic insights
4. Highlighting precedent-setting elements

Analyze the provided case document thoroughly and extract all relevant information.`,
      prompt: `Please analyze this IP litigation case document and provide a comprehensive digest:

Filename: ${filename || "Unknown"}

Case Document:
${caseText}

Provide a complete analysis following the required structure.`,
      output: Output.object({
        schema: CaseAnalysisSchema,
      }),
    })

    console.log("[v0] Analysis complete, title:", result.output?.title)
    
    return NextResponse.json({ 
      analysis: result.output,
      success: true 
    })
  } catch (error) {
    console.error("[v0] Analysis error:", error)
    return NextResponse.json({ 
      error: "Analysis failed. Please try again.",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
