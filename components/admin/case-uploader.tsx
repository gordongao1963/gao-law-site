"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Sparkles, Check, Loader2 } from "lucide-react"
import * as mammoth from "mammoth"

interface CaseAnalysis {
  title: string
  caseNumber: string | null
  court: string | null
  date: string | null
  parties: {
    plaintiff: string | null
    defendant: string | null
  }
  summary: string
  keyHoldings: string[]
  implications: string
  practiceTips: string[]
  category: string
  tags: string[]
  litigated_by_firm?: boolean
}

interface CaseUploaderProps {
  onComplete: () => void
}

type Step = "upload" | "analyzing" | "review" | "saving"

export function CaseUploader({ onComplete }: CaseUploaderProps) {
  const [step, setStep] = useState<Step>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [caseText, setCaseText] = useState("")
  const [documentUrl, setDocumentUrl] = useState("")
  const [analysis, setAnalysis] = useState<CaseAnalysis | null>(null)
  const [error, setError] = useState("")

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError("")

    // Read text content from file
    try {
      if (selectedFile.type === "text/plain") {
        const text = await selectedFile.text()
        setCaseText(text)
      } else if (selectedFile.type === "application/pdf") {
        // PDF parsing would require a library - for now, prompt for text
        setCaseText("")
      } else if (selectedFile.name.endsWith(".docx") || selectedFile.name.endsWith(".doc")) {
        // Parse Word document
        const arrayBuffer = await selectedFile.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        setCaseText(result.value)
      } else {
        setCaseText("")
      }
    } catch (err) {
      setError("Failed to read file: " + (err instanceof Error ? err.message : "Unknown error"))
      setCaseText("")
    }

    // Upload file to blob storage
    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.pathname) {
        setDocumentUrl(data.pathname)
      }
    } catch {
      console.error("Upload failed")
    }
  }, [])

  const handleAnalyze = async () => {
    if (!caseText.trim()) {
      setError("Please provide case text to analyze")
      return
    }

    setStep("analyzing")
    setError("")

    try {
      const res = await fetch("/api/admin/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          caseText, 
          filename: file?.name || "manual-entry" 
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed")
      }

      setAnalysis(data.analysis)
      setStep("review")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
      setStep("upload")
    }
  }

  const handleSave = async () => {
    if (!analysis) return

    setStep("saving")

    try {
      const res = await fetch("/api/admin/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...analysis,
          documentUrl,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save case")
      }

      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
      setStep("review")
    }
  }

  const updateAnalysis = (field: keyof CaseAnalysis, value: unknown) => {
    if (!analysis) return
    setAnalysis({ ...analysis, [field]: value })
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {["Upload", "Analyze", "Review", "Save"].map((label, i) => {
          const stepIndex = ["upload", "analyzing", "review", "saving"].indexOf(step)
          const isActive = i === stepIndex
          const isComplete = i < stepIndex

          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isComplete
                    ? "bg-foreground text-background"
                    : isActive
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isComplete ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm ${isActive ? "font-medium" : "text-muted-foreground"}`}>
                {label}
              </span>
              {i < 3 && <div className="w-12 h-px bg-border" />}
            </div>
          )
        })}
      </div>

      {/* Upload Step */}
      {step === "upload" && (
        <div className="bg-background border border-border rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl font-semibold mb-2">Upload Case Document</h2>
            <p className="text-muted-foreground">
              Upload a case document or paste the text directly for AI analysis
            </p>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-muted-foreground transition-colors cursor-pointer">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-1">
                  {file ? file.name : "Drop file here or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports TXT, PDF, DOC, DOCX files
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Or Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">or paste text directly</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Text Input */}
          <Textarea
            placeholder="Paste the full case text here..."
            value={caseText}
            onChange={(e) => setCaseText(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />

          {error && (
            <p className="text-sm text-destructive mt-4">{error}</p>
          )}

          <div className="flex justify-end mt-6">
            <Button onClick={handleAnalyze} disabled={!caseText.trim()}>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze with AI
            </Button>
          </div>
        </div>
      )}

      {/* Analyzing Step */}
      {step === "analyzing" && (
        <div className="bg-background border border-border rounded-lg p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-muted-foreground mb-4" />
          <h2 className="font-serif text-2xl font-semibold mb-2">Analyzing Case</h2>
          <p className="text-muted-foreground">
            AI is extracting key information and generating insights...
          </p>
        </div>
      )}

      {/* Review Step */}
      {step === "review" && analysis && (
        <div className="bg-background border border-border rounded-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl font-semibold mb-1">Review Analysis</h2>
              <p className="text-muted-foreground text-sm">
                Review and edit the AI-generated digest before saving
              </p>
            </div>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              analysis.category === "patent" ? "bg-blue-100 text-blue-800" :
              analysis.category === "trademark" ? "bg-green-100 text-green-800" :
              analysis.category === "trade_secret" ? "bg-amber-100 text-amber-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {analysis.category.replace("_", " ").toUpperCase()}
            </span>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={analysis.title}
                onChange={(e) => updateAnalysis("title", e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              />
            </div>

            {/* Case Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Case Number</label>
                <input
                  type="text"
                  value={analysis.caseNumber || ""}
                  onChange={(e) => updateAnalysis("caseNumber", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Court</label>
                <input
                  type="text"
                  value={analysis.court || ""}
                  onChange={(e) => updateAnalysis("court", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Plaintiff</label>
                <input
                  type="text"
                  value={analysis.parties.plaintiff || ""}
                  onChange={(e) => updateAnalysis("parties", { ...analysis.parties, plaintiff: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Defendant</label>
                <input
                  type="text"
                  value={analysis.parties.defendant || ""}
                  onChange={(e) => updateAnalysis("parties", { ...analysis.parties, defendant: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium mb-2">Summary</label>
              <Textarea
                value={analysis.summary}
                onChange={(e) => updateAnalysis("summary", e.target.value)}
                className="min-h-[150px]"
              />
            </div>

            {/* Key Holdings */}
            <div>
              <label className="block text-sm font-medium mb-2">Key Holdings</label>
              {analysis.keyHoldings.map((holding, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <span className="text-muted-foreground mt-2">{i + 1}.</span>
                  <input
                    type="text"
                    value={holding}
                    onChange={(e) => {
                      const newHoldings = [...analysis.keyHoldings]
                      newHoldings[i] = e.target.value
                      updateAnalysis("keyHoldings", newHoldings)
                    }}
                    className="flex-1 px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>
              ))}
            </div>

            {/* Implications */}
            <div>
              <label className="block text-sm font-medium mb-2">Implications</label>
              <Textarea
                value={analysis.implications}
                onChange={(e) => updateAnalysis("implications", e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Practice Tips */}
            <div>
              <label className="block text-sm font-medium mb-2">Practice Tips</label>
              {analysis.practiceTips.map((tip, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <span className="text-muted-foreground mt-2">{i + 1}.</span>
                  <input
                    type="text"
                    value={tip}
                    onChange={(e) => {
                      const newTips = [...analysis.practiceTips]
                      newTips[i] = e.target.value
                      updateAnalysis("practiceTips", newTips)
                    }}
                    className="flex-1 px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>
              ))}
            </div>

            {/* Litigated by Firm */}
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <input
                type="checkbox"
                id="litigated_by_firm"
                checked={analysis.litigated_by_firm ?? true}
                onChange={(e) => updateAnalysis("litigated_by_firm", e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="litigated_by_firm" className="text-sm font-medium cursor-pointer">
                ★ Gao.Law Represented — Mark if Gao.Law was counsel on this case
              </label>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive mt-4">{error}</p>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button variant="outline" onClick={() => setStep("upload")}>
              Start Over
            </Button>
            <Button onClick={handleSave}>
              <FileText className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
          </div>
        </div>
      )}

      {/* Saving Step */}
      {step === "saving" && (
        <div className="bg-background border border-border rounded-lg p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-muted-foreground mb-4" />
          <h2 className="font-serif text-2xl font-semibold mb-2">Saving Case</h2>
          <p className="text-muted-foreground">
            Storing your case digest...
          </p>
        </div>
      )}
    </div>
  )
}
