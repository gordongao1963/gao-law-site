"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Save, Loader2 } from "lucide-react"

interface Case {
  id: string
  case_name: string
  case_type: string | null
  court: string | null
  case_number: string | null
  decision_date: string | null
  summary: string | null
  key_holdings: string | null
  full_analysis: string | null
  practice_tips: string | null
  status: "draft" | "published"
  client_name: string | null
  video_url: string | null
}

interface CaseEditorProps {
  caseItem: Case
  onSave: () => void
  onClose: () => void
}

export function CaseEditor({ caseItem, onSave, onClose }: CaseEditorProps) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    case_name: caseItem.case_name || "",
    case_type: caseItem.case_type || "other",
    court: caseItem.court || "",
    case_number: caseItem.case_number || "",
    decision_date: caseItem.decision_date || "",
    summary: caseItem.summary || "",
    key_holdings: caseItem.key_holdings || "",
    full_analysis: caseItem.full_analysis || "",
    practice_tips: caseItem.practice_tips || "",
    client_name: caseItem.client_name || "",
    video_url: caseItem.video_url || "",
  })

  async function handleSave() {
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/cases/${caseItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(`Failed to save: ${error.error || "Unknown error"}`)
        return
      }

      onSave()
    } catch (error) {
      alert("Failed to save case")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-serif text-xl font-semibold">Edit Case</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Case Name *</label>
              <Input
                value={formData.case_name}
                onChange={(e) => setFormData({ ...formData, case_name: e.target.value })}
                placeholder="e.g., Apple v. Qualcomm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Client Name</label>
              <Input
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder="e.g., Apple Inc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Video URL</label>
              <Input
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="e.g., https://youtu.be/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Case Type *</label>
              <select
                value={formData.case_type}
                onChange={(e) => setFormData({ ...formData, case_type: e.target.value })}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="patent">Patent</option>
                <option value="trademark">Trademark</option>
                <option value="trade_secret">Trade Secret</option>
                <option value="copyright">Copyright</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Court</label>
              <Input
                value={formData.court}
                onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                placeholder="e.g., Supreme People's Court"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Case Number</label>
              <Input
                value={formData.case_number}
                onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                placeholder="e.g., (2023) Civil Final No. 123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Decision Date</label>
              <Input
                type="date"
                value={formData.decision_date}
                onChange={(e) => setFormData({ ...formData, decision_date: e.target.value })}
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium mb-2">Summary</label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Brief overview of the case..."
              rows={4}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background resize-none"
            />
          </div>

          {/* Key Holdings */}
          <div>
            <label className="block text-sm font-medium mb-2">Key Holdings</label>
            <textarea
              value={formData.key_holdings}
              onChange={(e) => setFormData({ ...formData, key_holdings: e.target.value })}
              placeholder="Important decisions and outcomes..."
              rows={4}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background resize-none"
            />
          </div>

          {/* Full Analysis */}
          <div>
            <label className="block text-sm font-medium mb-2">Full Analysis</label>
            <textarea
              value={formData.full_analysis}
              onChange={(e) => setFormData({ ...formData, full_analysis: e.target.value })}
              placeholder="Detailed analysis of the case..."
              rows={6}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background resize-none"
            />
          </div>

          {/* Practice Tips */}
          <div>
            <label className="block text-sm font-medium mb-2">Practice Tips</label>
            <textarea
              value={formData.practice_tips}
              onChange={(e) => setFormData({ ...formData, practice_tips: e.target.value })}
              placeholder="Practical advice for practitioners..."
              rows={4}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background resize-none"
            />
          </div>


        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !formData.case_name}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
