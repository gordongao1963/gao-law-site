'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, AlertCircle, CheckCircle2, Sparkles } from "lucide-react"
import { bulkImportCases, processImportWithAI } from "@/app/actions/bulk-import"

type Step = "upload" | "processing" | "results"

export function BulkImportForm() {
  const [casesText, setCasesText] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiProcessing, setAiProcessing] = useState(false)
  const [uploadedCaseId, setUploadedCaseId] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState("")
  const [step, setStep] = useState<Step>("upload")

  async function handleUpload() {
    if (!casesText.trim()) {
      setError("Please paste your case list")
      return
    }

    setLoading(true)
    setError("")

    const result = await bulkImportCases(casesText)

    if (result.error) {
      setError(result.error)
    } else if (result.caseId) {
      setUploadedCaseId(result.caseId)
      setStep("processing")
    }

    setLoading(false)
  }

  async function handleAIProcess() {
    if (!uploadedCaseId) return

    setAiProcessing(true)
    setError("")

    const result = await processImportWithAI(uploadedCaseId)

    if (result.error) {
      setError(result.error)
    } else {
      setResults(result.results)
      setStep("results")
      setCasesText("")
      setUploadedCaseId(null)
    }

    setAiProcessing(false)
  }

  function handleReset() {
    setStep("upload")
    setResults(null)
    setUploadedCaseId(null)
    setError("")
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-serif mb-2">Bulk Import Cases</h2>
        <p className="text-muted-foreground">
          Step 1: Paste your entire case list. Step 2: AI will extract and categorize each case automatically.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Step 1: Upload text */}
      {step === "upload" && (
        <>
          <textarea
            value={casesText}
            onChange={(e) => setCasesText(e.target.value)}
            placeholder="Paste your entire case list here..."
            className="w-full h-96 p-4 border border-border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-foreground"
          />

          <Button
            onClick={handleUpload}
            disabled={loading || !casesText.trim()}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Case List
              </>
            )}
          </Button>
        </>
      )}

      {/* Step 2: Process with AI */}
      {step === "processing" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-blue-600 mx-auto" />
          <div>
            <p className="font-medium text-blue-900 text-lg">Text Uploaded Successfully</p>
            <p className="text-blue-700 text-sm mt-1">
              Click below to have AI extract and categorize each case from your text.
            </p>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleAIProcess}
              disabled={aiProcessing}
              size="lg"
            >
              {aiProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Process with AI
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Start Over
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === "results" && results && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">
                Successfully imported {results.filter((r: any) => r.status === "success").length} of {results.length} cases
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((result: any, idx: number) => (
              <div key={idx} className="text-sm p-2 bg-white rounded border border-green-100">
                <div className="flex items-start gap-2">
                  {result.status === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-gray-900">{result.case}</p>
                    {result.error && <p className="text-red-600 text-xs mt-1">{result.error}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleReset} variant="outline" className="w-full">
            Import More Cases
          </Button>
        </div>
      )}
    </div>
  )
}
