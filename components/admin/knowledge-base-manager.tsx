"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, Loader2, Plus, X, Trash2 } from "lucide-react"

interface KnowledgeEntry {
  id: string
  type: "qa" | "snippet"
  question?: string
  answer: string // stores both Q&A answers and snippet content
  category: string
  keywords: string[]
  created_at: string
}

export function KnowledgeBaseManager() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [entryType, setEntryType] = useState<"qa" | "snippet">("qa")
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("General")
  const [keywords, setKeywords] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch entries
  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const supabase = await createClient()
      const { data, error: fetchError } = await supabase
        .from("knowledge_base")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError
      setEntries(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch entries")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      if (entryType === "qa" && (!question.trim() || !answer.trim())) {
        throw new Error("Question and answer are required")
      }
      if (entryType === "snippet" && !content.trim()) {
        throw new Error("Content is required")
      }

      const supabase = await createClient()

      const keywordArray = keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)

      const { error: insertError } = await supabase.from("knowledge_base").insert({
        type: entryType,
        question: entryType === "qa" ? question : null,
        answer: entryType === "qa" ? answer : content, // 'answer' column stores both Q&A answers and snippet content
        category,
        keywords: keywordArray,
      })

      if (insertError) throw insertError

      setSuccess(`${entryType === "qa" ? "Q&A pair" : "Snippet"} added successfully!`)
      setQuestion("")
      setAnswer("")
      setContent("")
      setKeywords("")
      setCategory("General")
      await fetchEntries()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add entry")
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this entry?")) return

    try {
      const supabase = await createClient()
      const { error: deleteError } = await supabase.from("knowledge_base").delete().eq("id", id)

      if (deleteError) throw deleteError
      setSuccess("Entry deleted")
      await fetchEntries()
      setTimeout(() => setSuccess(""), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entry")
    }
  }

  return (
    <div className="space-y-8">
      {/* Add Entry Form */}
      <div className="bg-muted p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Add Training Material</h3>

        {error && (
          <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="qa"
                  checked={entryType === "qa"}
                  onChange={(e) => setEntryType(e.target.value as "qa" | "snippet")}
                  className="w-4 h-4"
                />
                <span className="text-sm">Q&A Pair</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="snippet"
                  checked={entryType === "snippet"}
                  onChange={(e) => setEntryType(e.target.value as "qa" | "snippet")}
                  className="w-4 h-4"
                />
                <span className="text-sm">Text Snippet</span>
              </label>
            </div>
          </div>

          {entryType === "qa" ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Question *</label>
                <Input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What is your question?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Answer *</label>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Provide the answer"
                  rows={4}
                  required
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Content *</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add relevant information or context"
                rows={5}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option>General</option>
                <option>Patents</option>
                <option>Trademarks</option>
                <option>Trade Secrets</option>
                <option>Litigation</option>
                <option>Process</option>
                <option>Firm Info</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Keywords (comma-separated)</label>
              <Input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., patent, filing, infringement"
              />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Entries List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Knowledge Base ({entries.length})</h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No entries yet. Add one to get started!</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="border border-border rounded-lg p-4 hover:bg-muted/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold px-2 py-1 bg-foreground text-background rounded">
                        {entry.type === "qa" ? "Q&A" : "SNIPPET"}
                      </span>
                      <span className="text-xs text-muted-foreground">{entry.category}</span>
                    </div>

                    {entry.type === "qa" ? (
                      <>
                        <p className="font-medium text-foreground mb-1">{entry.question}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{entry.answer}</p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground line-clamp-2">{entry.answer}</p>
                    )}

                    {entry.keywords.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {entry.keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="text-xs px-2 py-1 bg-muted border border-border rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="p-2 hover:bg-destructive/10 rounded transition-colors text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
