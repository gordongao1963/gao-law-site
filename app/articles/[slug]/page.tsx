import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug
  const supabase = await createClient()

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!article) {
    return {
      title: "Article Not Found",
    }
  }

  return {
    title: `${article.title} - Gao.Law`,
    description: article.description,
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  const slug = (await params).slug
  const supabase = await createClient()

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4 text-balance">
            {article.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-col gap-4 text-muted-foreground mb-8 pb-8 border-b border-border">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm">
                {new Date(article.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              {article.category && (
                <span className="inline-block px-2.5 py-1 text-xs font-medium bg-muted rounded">
                  {article.category}
                </span>
              )}
            </div>

            {/* Authors */}
            {article.authors && Array.isArray(article.authors) && article.authors.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">By</p>
                {article.authors.map((author: any, idx: number) => (
                  <div key={idx}>
                    <p className="font-medium text-foreground">{author.name}</p>
                    {(author.title || author.firm) && (
                      <p className="text-sm text-muted-foreground">
                        {author.title && author.firm
                          ? `${author.title}, ${author.firm}`
                          : author.title || author.firm}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <article className="prose prose-sm dark:prose-invert max-w-none">
          <div className="text-foreground space-y-4 leading-relaxed">
            {article.content.split("\n\n").map((paragraph: string, idx: number) => (
              <p key={idx} className="whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        {/* Back Link */}
        <div className="mt-12 pt-8 border-t border-border">
          <a
            href="/articles"
            className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
          >
            ← Back to Articles
          </a>
        </div>
      </div>
    </div>
  )
}
