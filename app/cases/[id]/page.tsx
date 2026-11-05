import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, Scale, Calendar, Building, Users, Lightbulb, CheckCircle } from "lucide-react"

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: caseItem } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .single()

  if (!caseItem) {
    notFound()
  }

  const categoryLabel = (caseItem.case_type || "other").replace("_", " ").toUpperCase()

  const ctaCopy: Record<string, { heading: string; body: string }> = {
    patent: {
      heading: "Need Expert Patent Litigation Support in China?",
      body: "We have represented global technology and pharmaceutical leaders in China's most complex patent disputes — from district courts to the Supreme People's Court.",
    },
    trademark: {
      heading: "Need Expert Trademark Protection in China?",
      body: "From cross-border brand enforcement to Supreme Court retrial petitions, we have secured victories for the world's most recognised brands in China.",
    },
    trade_secret: {
      heading: "Need Expert Trade Secret Litigation in China?",
      body: "We have handled some of the largest trade secret cases in Chinese legal history, protecting proprietary technology and securing landmark settlements for global clients.",
    },
    copyright: {
      heading: "Need Expert Copyright Litigation Support in China?",
      body: "We defend original works and digital content against infringement, pursuing aggressive enforcement strategies across Chinese courts and regulatory bodies.",
    },
    other: {
      heading: "Need Expert IP Litigation Support in China?",
      body: "Our team has handled hundreds of landmark intellectual property cases across China's courts, from local IP tribunals to the Supreme People's Court.",
    },
  }

  const cta = ctaCopy[caseItem.case_type || "other"] || ctaCopy.other

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Back Link */}
        <div className="border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/cases"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Cases
            </Link>
          </div>
        </div>

        {/* Case Header */}
        <section className="border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 text-xs font-medium rounded ${
                caseItem.case_type === "patent" ? "bg-blue-100 text-blue-800" :
                caseItem.case_type === "trademark" ? "bg-green-100 text-green-800" :
                caseItem.case_type === "trade_secret" ? "bg-amber-100 text-amber-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {categoryLabel}
              </span>
              {caseItem.case_number && (
                <span className="text-sm text-muted-foreground">
                  {caseItem.case_number}
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-6">
              {caseItem.case_name}
            </h1>

            {/* Case Meta */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {caseItem.court && (
                <div className="flex items-start gap-2">
                  <Building className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Court</p>
                    <p className="font-medium">{caseItem.court}</p>
                  </div>
                </div>
              )}
              {caseItem.decision_date && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Decision Date</p>
                    <p className="font-medium">{new Date(caseItem.decision_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {caseItem.plaintiff && (
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Plaintiff</p>
                    <p className="font-medium">{caseItem.plaintiff}</p>
                  </div>
                </div>
              )}
              {caseItem.defendant && (
                <div className="flex items-start gap-2">
                  <Scale className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Defendant</p>
                    <p className="font-medium">{caseItem.defendant}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Case Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Summary */}
          <section className="mb-12">
            <h2 className="font-serif text-2xl font-semibold mb-4">Summary</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {caseItem.summary}
              </p>
            </div>
          </section>

          {/* Key Holdings */}
          {caseItem.key_holdings && caseItem.key_holdings.length > 0 && (
            <section className="mb-12">
              <h2 className="font-serif text-2xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Key Holdings
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line p-4 bg-muted/50 rounded-lg">
                {caseItem.key_holdings}
              </p>
            </section>
          )}

          {/* Full Analysis */}
          {caseItem.full_analysis && (
            <section className="mb-12">
              <h2 className="font-serif text-2xl font-semibold mb-4">Detailed Analysis</h2>
              <div className="p-6 bg-muted/30 border-l-4 border-foreground rounded-r-lg">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {caseItem.full_analysis}
                </p>
              </div>
            </section>
          )}
        </article>

        {/* CTA */}
        <section className="border-t border-border bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h3 className="font-serif text-2xl font-semibold mb-3 text-balance">
              {cta.heading}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed text-pretty">
              {cta.body}
            </p>
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-background font-medium rounded hover:bg-foreground/90 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
