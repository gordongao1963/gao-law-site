"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, Loader2, Plus, X } from "lucide-react"

interface Author {
  id: string
  name: string
  title: string
  firm: string
}

export function ArticleUploader() {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "General",
    slug: "",
    authors: [] as Author[],
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [newAuthor, setNewAuthor] = useState({ name: "", title: "", firm: "" })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from title - remove special characters and replace spaces with hyphens
      ...(name === "title" && { 
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
        {
          id: Math.random().toString(),
          name: newAuthor.name,
          title: newAuthor.title,
          firm: newAuthor.firm,
        },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      if (formData.authors.length === 0) {
        throw new Error("Please add at least one author")
      }
      
      if (!formData.slug.trim()) {
        throw new Error("Please enter a slug (or add a title to auto-generate one)")
      }

      const supabase = await createClient()

      const { error: insertError } = await supabase.from("articles").insert({
        title: formData.title,
        description: formData.excerpt,
        content: formData.content,
        authors: formData.authors.map(({ id, ...rest }) => rest),
        slug: formData.slug,
        status: "published",
        published_at: new Date().toISOString(),
      })

      if (insertError) {
        throw insertError
      }

      setSuccess(true)
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        category: "General",
        slug: "",
        authors: [],
      })
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload article")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {success && (
        <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">Article published successfully!</p>
        </div>
      )}

      {error && (
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Title *</label>
        <Input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Article title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Slug (auto-generated from title)</label>
        <Input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleInputChange}
          placeholder="article-slug"
        />
        <p className="text-xs text-muted-foreground mt-1">Automatically generated from your title, but you can edit it</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-border rounded-md bg-background"
        >
          <option>General</option>
          <option>Patent</option>
          <option>Trademark</option>
          <option>Trade Secret</option>
          <option>Litigation</option>
          <option>Regulatory</option>
        </select>
      </div>

      {/* Authors Section */}
      <div className="border border-border rounded-lg p-4 space-y-4">
        <h3 className="font-medium">Authors *</h3>
        
        {/* Add Author Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pb-4 border-b border-border">
          <Input
            type="text"
            placeholder="Name"
            value={newAuthor.name}
            onChange={(e) => setNewAuthor((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            type="text"
            placeholder="Title (e.g., Partner, Senior Associate)"
            value={newAuthor.title}
            onChange={(e) => setNewAuthor((prev) => ({ ...prev, title: e.target.value }))}
          />
          <Input
            type="text"
            placeholder="Firm"
            value={newAuthor.firm}
            onChange={(e) => setNewAuthor((prev) => ({ ...prev, firm: e.target.value }))}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addAuthor}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Author
        </Button>

        {/* Authors List */}
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
                  className="p-1 hover:bg-destructive/20 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Excerpt *</label>
        <Textarea
          name="excerpt"
          value={formData.excerpt}
          onChange={handleInputChange}
          placeholder="Brief summary of the article"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Content *</label>
        <Textarea
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          placeholder="Full article content"
          rows={10}
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Publishing...
          </>
        ) : (
          "Publish Article"
        )}
      </Button>
    </form>
  )
}
