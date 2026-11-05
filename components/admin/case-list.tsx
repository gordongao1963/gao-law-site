"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Trash2, ExternalLink, Loader2, Pencil, Star } from "lucide-react"
import Link from "next/link"
import { CaseEditor } from "./case-editor"

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
  created_at: string
  published_at: string | null
  is_landmark: boolean
  client_name: string | null
  video_url: string | null
}

export function CaseList() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>("all")
  const [editingCase, setEditingCase] = useState<Case | null>(null)

  useEffect(() => {
    fetchCases()
  }, [])

  async function fetchCases() {
    try {
      const res = await fetch("/api/admin/cases")
      const data = await res.json()
      setCases(data.cases || [])
    } catch (error) {
      console.error("Failed to fetch cases:", error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleStatus(caseItem: Case) {
    setActionLoading(caseItem.id)
    const newStatus = caseItem.status === "draft" ? "published" : "draft"

    try {
      const res = await fetch(`/api/admin/cases/${caseItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        console.error("[v0] Publish failed:", error)
        alert(`Failed to publish: ${error.error || "Unknown error"}`)
        return
      }
      
      await fetchCases()
    } catch (error) {
      console.error("[v0] Failed to update status:", error)
      alert("Failed to publish case")
    } finally {
      setActionLoading(null)
    }
  }

  async function toggleLandmark(caseItem: Case) {
    setActionLoading(caseItem.id)
    try {
      const res = await fetch(`/api/admin/cases/${caseItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_landmark: !caseItem.is_landmark,
        }),
      })
      if (res.ok) {
        // Update local state
        setCases(cases.map(c => c.id === caseItem.id ? { ...c, is_landmark: !c.is_landmark } : c))
      }
    } catch (error) {
      console.error("Failed to toggle landmark:", error)
    } finally {
      setActionLoading(null)
    }
  }

  async function deleteCase(id: string) {
    if (!confirm("Are you sure you want to delete this case?")) return

    setActionLoading(id)

    try {
      await fetch(`/api/admin/cases/${id}`, { method: "DELETE" })
      await fetchCases()
    } catch (error) {
      console.error("Failed to delete case:", error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (cases.length === 0) {
    return (
      <div className="bg-background border border-border rounded-lg p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <Eye className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-serif text-xl font-semibold mb-2">No Cases Yet</h3>
        <p className="text-muted-foreground mb-6">
          Upload your first case document to get started with AI analysis
        </p>
      </div>
    )
  }

  const drafts = cases
    .filter((c) => c.status === "draft")
    .filter((c) => filterType === "all" || c.case_type === filterType)
  const published = cases
    .filter((c) => c.status === "published")
    .filter((c) => filterType === "all" || c.case_type === filterType)

  const caseTypes = Array.from(new Set(cases.map((c) => c.case_type).filter(Boolean)))

  return (
    <div className="space-y-8">
      {/* Case Editor Modal */}
      {editingCase && (
        <CaseEditor
          caseItem={editingCase}
          onSave={() => {
            setEditingCase(null)
            fetchCases()
          }}
          onClose={() => setEditingCase(null)}
        />
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Case Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-border rounded px-3 py-2 text-sm"
          >
            <option value="all">All Types</option>
            {caseTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Cases</p>
          <p className="text-3xl font-semibold">{cases.length}</p>
        </div>
        <div className="bg-background border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Published</p>
          <p className="text-3xl font-semibold text-green-600">{published.length}</p>
        </div>
        <div className="bg-background border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Drafts</p>
          <p className="text-3xl font-semibold text-amber-600">{drafts.length}</p>
        </div>
      </div>

      {/* Drafts Section */}
      {drafts.length > 0 && (
        <div>
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-4">
            Drafts ({drafts.length})
          </h3>
          <div className="bg-background border border-border rounded-lg divide-y divide-border">
            {drafts.map((caseItem) => (
              <CaseRow
                key={caseItem.id}
                caseItem={caseItem}
                loading={actionLoading === caseItem.id}
                onToggleStatus={() => toggleStatus(caseItem)}
                onDelete={() => deleteCase(caseItem.id)}
                onEdit={() => setEditingCase(caseItem)}
                onToggleLandmark={() => toggleLandmark(caseItem)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Published Section */}
      {published.length > 0 && (
        <div>
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-4">
            Published ({published.length})
          </h3>
          <div className="bg-background border border-border rounded-lg divide-y divide-border">
            {published.map((caseItem) => (
              <CaseRow
                key={caseItem.id}
                caseItem={caseItem}
                loading={actionLoading === caseItem.id}
                onToggleStatus={() => toggleStatus(caseItem)}
                onDelete={() => deleteCase(caseItem.id)}
                onEdit={() => setEditingCase(caseItem)}
                onToggleLandmark={() => toggleLandmark(caseItem)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CaseRow({
  caseItem,
  loading,
  onToggleStatus,
  onDelete,
  onEdit,
  onToggleLandmark,
}: {
  caseItem: Case
  loading: boolean
  onToggleStatus: () => void
  onDelete: () => void
  onEdit: () => void
  onToggleLandmark: () => void
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h4 className="font-medium truncate">{caseItem.case_name}</h4>
          {caseItem.case_type && (
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
              {caseItem.case_type}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
          {caseItem.summary || "No summary"}
          {" • "}
          {new Date(caseItem.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleLandmark}
          disabled={loading}
          title={caseItem.is_landmark ? "Remove from Landmarks" : "Add to Landmarks"}
          className={caseItem.is_landmark ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50" : "text-muted-foreground hover:text-foreground"}
        >
          <Star className="w-4 h-4" fill={caseItem.is_landmark ? "currentColor" : "none"} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          disabled={loading}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        {caseItem.status === "published" && (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/cases/${caseItem.id}`} target="_blank">
              <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleStatus}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : caseItem.status === "draft" ? (
            <>
              <Eye className="w-4 h-4 mr-1" />
              Publish
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 mr-1" />
              Unpublish
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={loading}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
