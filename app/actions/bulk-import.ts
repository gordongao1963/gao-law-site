'use server'

import { createClient } from "@/lib/supabase/server"

// Step 1: Just store the raw text as a single draft case
export async function bulkImportCases(casesText: string) {
  try {
    const supabase = await createClient()
    
    if (!casesText.trim()) {
      return { error: "Please provide case text to import." }
    }

    // Store the entire raw text as a single case entry for AI to process later
    const { data, error } = await supabase
      .from("cases")
      .insert({
        case_name: "Bulk Import - Pending AI Processing",
        case_type: "other",
        summary: "",
        document_text: casesText,
        key_holdings: "",
        status: "draft",
      })
      .select()

    if (error) {
      return { error: error.message }
    }

    return { 
      success: true, 
      caseId: data?.[0]?.id,
      message: "Text uploaded successfully. Click 'Process with AI' to extract and categorize cases."
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Import failed" }
  }
}

// Step 2: AI processes the raw text and creates individual case entries
export async function processImportWithAI(caseId: string) {
  try {
    const supabase = await createClient()
    
    // Get the raw text
    const { data: rawCase, error: fetchError } = await supabase
      .from("cases")
      .select("document_text")
      .eq("id", caseId)
      .single()

    if (fetchError || !rawCase?.document_text) {
      return { error: "Could not find the uploaded text" }
    }

    const { generateObject } = await import("ai")
    const { z } = await import("zod")

    // Use AI to extract cases from the raw text
    const result = await generateObject({
      model: "anthropic/claude-sonnet-4",
      schema: z.object({
        cases: z.array(z.object({
          case_name: z.string().describe("Short case name, e.g. 'Boehringer v. DYG' or 'Apple v. Qualcomm'"),
          case_type: z.enum(["patent", "trademark", "trade_secret", "copyright", "other"]).describe("Type of IP case"),
          summary: z.string().describe("Full description of the case and representation"),
          key_holdings: z.string().describe("Key outcomes or holdings if mentioned, or empty string if none"),
        }))
      }),
      prompt: `Extract all the legal cases from this text. Each case typically starts with "Represented" or "Advised". 
      
For each case, identify:
- case_name: A short title like "Client v. Opponent" or the matter name
- case_type: patent, trademark, trade_secret, copyright, or other
- summary: The full description of the representation
- key_holdings: Any outcomes or results mentioned (use empty string if none)

Text to process:
${rawCase.document_text}`,
    })

    // Insert each extracted case
    const results = []
    for (const caseData of result.object.cases) {
      const { data, error } = await supabase
        .from("cases")
        .insert({
          case_name: caseData.case_name,
          case_type: caseData.case_type,
          summary: caseData.summary,
          key_holdings: caseData.key_holdings || "",
          status: "draft",
        })
        .select()

      if (error) {
        results.push({ case: caseData.case_name, status: "error", error: error.message })
      } else {
        results.push({ case: caseData.case_name, status: "success", id: data?.[0]?.id })
      }
    }

    // Delete the original bulk import placeholder
    await supabase.from("cases").delete().eq("id", caseId)

    return { success: true, results }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "AI processing failed" }
  }
}
