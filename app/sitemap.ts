import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Fetch all published cases
  const { data: cases } = await supabase
    .from('cases')
    .select('id, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })

  // Fetch all published articles
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })

  // Base URLs
  const baseUrl = 'https://gao.law'

  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cases`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ]

  // Add individual case pages
  if (cases) {
    routes.push(
      ...cases.map((caseItem) => ({
        url: `${baseUrl}/cases/${caseItem.id}`,
        lastModified: new Date(caseItem.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    )
  }

  // Add individual article pages
  if (articles) {
    routes.push(
      ...articles.map((article) => ({
        url: `${baseUrl}/articles/${article.slug}`,
        lastModified: new Date(article.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    )
  }

  return routes
}
