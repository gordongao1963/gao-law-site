"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, Loader2, Plus, X, Pencil, Trash2, Eye, ChevronLeft } from "lucide-react"

interface Author {
  name: string
  title?: string
  firm?: string
}

interface Article {
  id: string
  title: string
  description: string
  content: string
  slug: string
  status: string
  authors?: Author[]
  author?: string
  published_at: string
}

type View = "list" | "create" | "edit"

export function ArticleManager() {
  const [view, setView] = useState<View>("list")
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    slug: "",
    authors: [] as (Author & { id: string })[],
  })
  const [newAuthor, setNewAuthor] = useState({ name: "", title: "", firm: "" })

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("published_at", { ascending: false })

      if (error) throw error
      setArticles(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load articles")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "title" && view === "create" && { 
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "") // Remove special chars (keep letters, numbers, spaces, hyphens)
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .replace(/-+/g, "-") // Replace multiple hyphens with single
          .trim()
      }),
    }))
  }

  const addAuthor = () => {
    if (!newAuthor.name.trim()) return
    setFormData((prev) => ({
      ...prev,
      authors: [
        ...prev.authors,
        { id: Math.random().toString(), ...newAuthor },
      ],
    }))
    setNewAuthor({ name: "", title: "", firm: "" })
  }

  const removeAuthor = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      authors: prev.authors.filter((a) => a.id !== id),
    }))
  }

  const startCreate = () => {
    setFormData({ title: "", description: "", content: "", slug: "", authors: [] })
    setEditingArticle(null)
    setView("create")
    setError("")
    setSuccess("")
  }

  const startEdit = (article: Article) => {
    setEditingArticle(article)
    setFormData({
      title: article.title,
      description: article.description || "",
      content: article.content || "",
      slug: article.slug,
      authors: (article.authors || []).map((a, i) => ({ ...a, id: i.toString() })),
    })
    setView("edit")
    setError("")
    setSuccess("")
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      if (!formData.title.trim()) throw new Error("Title is required")
      if (!formData.slug.trim()) throw new Error("Slug is required")
      if (formData.authors.length === 0) throw new Error("At least one author is required")

      const supabase = await createClient()
      const authorsData = formData.authors.map(({ id, ...rest }) => rest)

      if (view === "create") {
        const { error: insertError } = await supabase.from("articles").insert({
          title: formData.title,
          description: formData.description,
          content: formData.content,
          slug: formData.slug,
          authors: authorsData,
          status: "published",
          published_at: new Date().toISOString(),
        })
        if (insertError) throw insertError
        setSuccess("Article created successfully!")
      } else if (editingArticle) {
        const { error: updateError } = await supabase
          .from("articles")
          .update({
            title: formData.title,
            description: formData.description,
            content: formData.content,
            slug: formData.slug,
            authors: authorsData,
          })
          .eq("id", editingArticle.id)
        if (updateError) throw updateError
        setSuccess("Article updated successfully!")
      }

      await fetchArticles()
      setTimeout(() => {
        setView("list")
        setSuccess("")
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save article")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (article: Article) => {
    if (!confirm(`Delete "${article.title}"? This cannot be undone.`)) return

    try {
      const supabase = await createClient()
      const { error } = await supabase.from("articles").delete().eq("id", article.id)
      if (error) throw error
      await fetchArticles()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete article")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // List View
  if (view === "list") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Articles ({articles.length})</h2>
          <Button onClick={startCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            New Article
          </Button>
        </div>

        {error && (
          <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {articles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No articles yet. Create your first article.
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="font-medium truncate">{article.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    /{article.slug} • {new Date(article.published_at).toLocaleDateString()}
                  </p>
                  {!article.slug && (
                    <p className="text-xs text-red-500 mt-1">Missing slug - edit to fix</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/articles/${article.slug}`, "_blank")}
                    disabled={!article.slug}
                    className="gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(article)}
                    className="gap-1"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(article)}
                    className="gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Create/Edit Form View
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setView("list")} className="gap-1">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <h2 className="text-xl font-semibold">
          {view === "create" ? "New Article" : "Edit Article"}
        </h2>
      </div>

      {success && (
        <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title *</label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Article title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Slug *</label>
          <Input
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            placeholder="article-slug"
          />
          <p className="text-xs text-muted-foreground mt-1">
            URL path: /articles/{formData.slug || "..."}
          </p>
        </div>

        {/* Authors Section */}
        <div className="border border-border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">Authors *</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              placeholder="Name"
              value={newAuthor.name}
              onChange={(e) => setNewAuthor((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Title (e.g., Partner)"
              value={newAuthor.title}
              onChange={(e) => setNewAuthor((prev) => ({ ...prev, title: e.target.value }))}
            />
            <Input
              placeholder="Firm"
              value={newAuthor.firm}
              onChange={(e) => setNewAuthor((prev) => ({ ...prev, firm: e.target.value }))}
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addAuthor} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Author
          </Button>

          {formData.authors.length > 0 && (
            <div className="space-y-2">
              {formData.authors.map((author) => (
                <div
                  key={author.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{author.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {author.title && author.firm
                        ? `${author.title}, ${author.firm}`
                        : author.title || author.firm || "No title/firm"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAuthor(author.id)}
                    className="p-1 hover:bg-destructive/20 rounded"
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description / Excerpt *</label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Brief summary of the article"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content *</label>
          <Textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Full article content"
            rows={12}
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : view === "create" ? (
              "Publish Article"
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button variant="outline" onClick={() => setView("list")}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
