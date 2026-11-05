import { createClient } from "@/lib/supabase/server"
import { ArticleList } from "@/components/articles/article-list"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Articles - Gao.Law",
  description: "Read our latest articles and insights on IP litigation and international law",
}

export default async function ArticlesPage() {
  let articles = []
  let error = null

  try {
    const supabase = await createClient()

    const { data, error: fetchError } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })

    if (fetchError) {
      console.error("[v0] Articles fetch error:", fetchError)
      error = fetchError.message
    } else {
      articles = data || []
    }
  } catch (err) {
    console.error("[v0] Articles page error:", err)
    error = err instanceof Error ? err.message : "Failed to load articles"
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Articles</h1>
          <p className="text-lg text-muted-foreground">
            Insights and perspectives on IP litigation, international law, and our practice areas
          </p>
        </div>

        {error && (
          <div className="p-4 mb-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">Error loading articles: {error}</p>
          </div>
        )}

        <ArticleList articles={articles} />
      </div>
    </div>
  )
}
