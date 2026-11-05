"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, GripVertical, Save, RefreshCw } from "lucide-react"

interface LandmarkCase {
  title: string
  client: string
  outcome: string
  year: string
  category: string
  video: string | null
}

interface LandmarkContent {
  subtitle: string
  title: string
  cases: LandmarkCase[]
}

export function LandmarkEditor() {
  const [content, setContent] = useState<LandmarkContent>({
    subtitle: "Case Studies",
    title: "Landmark and Significant Victories",
    cases: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("section_key", "landmark_victories")
      .single()

    if (data?.content) {
      setContent(data.content as LandmarkContent)
    }
    setLoading(false)
  }

  const saveContent = async () => {
    setSaving(true)
    setMessage("")
    const supabase = createClient()
    
    const { error } = await supabase
      .from("site_content")
      .upsert({
        section_key: "landmark_victories",
        content: content,
        updated_at: new Date().toISOString()
      }, { onConflict: "section_key" })

    if (error) {
      setMessage("Error saving: " + error.message)
    } else {
      setMessage("Saved successfully!")
      setTimeout(() => setMessage(""), 3000)
    }
    setSaving(false)
  }

  const updateCase = (index: number, field: keyof LandmarkCase, value: string | null) => {
    const newCases = [...content.cases]
    newCases[index] = { ...newCases[index], [field]: value }
    setContent({ ...content, cases: newCases })
  }

  const addCase = () => {
    setContent({
      ...content,
      cases: [...content.cases, {
        title: "New Case Title",
        client: "Client Name",
        outcome: "Case outcome description...",
        year: new Date().getFullYear().toString(),
        category: "Patent",
        video: null
      }]
    })
  }

  const removeCase = (index: number) => {
    const newCases = content.cases.filter((_, i) => i !== index)
    setContent({ ...content, cases: newCases })
  }

  const moveCase = (index: number, direction: "up" | "down") => {
    const newCases = [...content.cases]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newCases.length) return
    
    [newCases[index], newCases[targetIndex]] = [newCases[targetIndex], newCases[index]]
    setContent({ ...content, cases: newCases })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Landmark Victories Editor</h2>
          <p className="text-sm text-muted-foreground">Edit the featured cases displayed on the homepage</p>
        </div>
        <Button onClick={saveContent} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.includes("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
          {message}
        </div>
      )}

      {/* Section Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Section Header</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Subtitle (small text above title)</label>
            <Input
              value={content.subtitle}
              onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
              placeholder="e.g., Case Studies"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Main Title</label>
            <Input
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              placeholder="e.g., Landmark and Significant Victories"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cases */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Featured Cases ({content.cases.length})</h3>
          <Button variant="outline" size="sm" onClick={addCase}>
            <Plus className="w-4 h-4 mr-2" />
            Add Case
          </Button>
        </div>

        {content.cases.map((caseItem, index) => (
          <Card key={index} className="relative">
            <CardContent className="pt-6">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveCase(index, "up")}
                  disabled={index === 0}
                >
                  <GripVertical className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCase(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Case Title</label>
                  <Input
                    value={caseItem.title}
                    onChange={(e) => updateCase(index, "title", e.target.value)}
                    placeholder="e.g., Apple v. Qualcomm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Client</label>
                  <Input
                    value={caseItem.client}
                    onChange={(e) => updateCase(index, "client", e.target.value)}
                    placeholder="e.g., Apple Inc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Year</label>
                  <Input
                    value={caseItem.year}
                    onChange={(e) => updateCase(index, "year", e.target.value)}
                    placeholder="e.g., 2023"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={caseItem.category}
                    onChange={(e) => updateCase(index, "category", e.target.value)}
                    className="w-full h-10 px-3 border border-border rounded-md bg-background"
                  >
                    <option value="Patent">Patent</option>
                    <option value="Trademark">Trademark</option>
                    <option value="Trade Secret">Trade Secret</option>
                    <option value="Copyright">Copyright</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Outcome / Description</label>
                  <Textarea
                    value={caseItem.outcome}
                    onChange={(e) => updateCase(index, "outcome", e.target.value)}
                    placeholder="Describe the case outcome and significance..."
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Video URL (optional)</label>
                  <Input
                    value={caseItem.video || ""}
                    onChange={(e) => updateCase(index, "video", e.target.value || null)}
                    placeholder="e.g., https://youtu.be/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
