import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowRight, Scale, FileText, Shield, Lock } from "lucide-react"

export const dynamic = "force-dynamic"

const categoryIcons: Record<string, React.ReactNode> = {
  patent: <FileText className="w-5 h-5" />,
  trademark: <Scale className="w-5 h-5" />,
  trade_secret: <Lock className="w-5 h-5" />,
  copyright: <Shield className="w-5 h-5" />,
  other: <FileText className="w-5 h-5" />,
}

const categoryColors: Record<string, string> = {
  patent: "bg-blue-50 text-blue-700 border-blue-200",
  trademark: "bg-green-50 text-green-700 border-green-200",
  trade_secret: "bg-amber-50 text-amber-700 border-amber-200",
  copyright: "bg-purple-50 text-purple-700 border-purple-200",
  other: "bg-gray-50 text-gray-700 border-gray-200",
}

const caseTypeLabels: Record<string, string> = {
  patent: "Patent",
  trademark: "Trademark",
  trade_secret: "Trade Secret",
  copyright: "Copyright",
  other: "Other",
}

type Props = { searchParams: Promise<{ type?: string }> }

export default async function CasesPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { type } = await searchParams
  const activeType = type || null

  let query = supabase
    .from("cases")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })

  if (activeType) {
    query = query.eq("case_type", activeType)
  }

  const { data: cases } = await query

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="max-w-3xl">
              <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
                Case Digests
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                In-depth analysis of landmark IP litigation cases in China. Our AI-powered digests 
                provide key holdings, strategic implications, and practical insights for 
                intellectual property practitioners.
              </p>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="border-b border-border sticky top-0 bg-background z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
              <Link
                href="/cases"
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
                  !activeType
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                }`}
              >
                All Cases
              </Link>
              {Object.entries(caseTypeLabels).map(([value, label]) => (
                <Link
                  key={value}
                  href={`/cases?type=${value}`}
                  className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
                    activeType === value
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Cases Grid */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {cases && cases.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cases.map((caseItem) => (
                  <Link
                    key={caseItem.id}
                    href={`/cases/${caseItem.id}`}
                    className="group bg-background border border-border rounded-lg p-6 hover:border-muted-foreground transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border ${
                          categoryColors[caseItem.case_type] || categoryColors.other
                        }`}
                      >
                        {categoryIcons[caseItem.case_type]}
                        {(caseItem.case_type || "other").replace("_", " ").toUpperCase()}
                      </span>
                      {caseItem.litigated_by_firm && (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-foreground text-background">
                          ★ Gao.Law
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2 group-hover:text-muted-foreground transition-colors line-clamp-2">
                      {caseItem.case_name}
                    </h3>

                    {caseItem.court && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {caseItem.court}
                        {caseItem.decision_date && ` • ${new Date(caseItem.decision_date).toLocaleDateString()}`}
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {caseItem.summary}
                    </p>

                    <div className="flex items-center text-sm font-medium text-foreground group-hover:text-muted-foreground transition-colors">
                      Read Analysis
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">No Cases Published Yet</h3>
                <p className="text-muted-foreground">
                  Check back soon for in-depth case analysis and digests.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
