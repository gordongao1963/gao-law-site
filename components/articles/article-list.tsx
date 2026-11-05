"use client"

import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Calendar, User } from "lucide-react"

interface Article {
  id: string
  title: string
  description: string
  excerpt?: string
  author?: string
  authors?: Array<{ name: string; title?: string; firm?: string }>
  published_at: string
  published_date?: string
  category?: string
  slug: string
}

interface ArticleListProps {
  articles: Article[]
}

export function ArticleList({ articles }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No articles available yet.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {articles.map((article) => (
        <Link key={article.id} href={`/articles/${article.slug}`}>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-start justify-between gap-4 mb-3">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {article.category}
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {new Date(article.published_at || article.published_date || new Date()).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                )}
              </div>
            </div>

            <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
              {article.title}
            </h2>

            <p className="text-muted-foreground mb-4 line-clamp-2">
              {article.description || article.excerpt}
            </p>

            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <span className="text-xs font-medium">By</span>
              {Array.isArray(article.authors) && article.authors.length > 0 ? (
                <div className="space-y-1">
                  {article.authors.map((author, idx) => (
                    <div key={idx}>
                      <p className="font-medium text-foreground">{author.name}</p>
                      {(author.title || author.firm) && (
                        <p className="text-xs text-muted-foreground">
                          {author.title && author.firm
                            ? `${author.title}, ${author.firm}`
                            : author.title || author.firm}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : article.author ? (
                <p className="font-medium text-foreground">{article.author}</p>
              ) : null}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
