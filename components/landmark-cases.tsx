"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface LandmarkCase {
  id: string
  case_name: string
  client_name: string | null
  summary: string | null
  decision_date: string | null
  case_type: string | null
  video_url: string | null
}

interface LandmarkContent {
  subtitle: string
  title: string
}

// Default content as fallback
const defaultContent: LandmarkContent = {
  subtitle: "Case Studies",
  title: "Landmark and Significant Victories",
}

export function LandmarkCases() {
  const [expandedVideo, setExpandedVideo] = useState<number | null>(null)
  const [content, setContent] = useState<LandmarkContent>(defaultContent)
  const [cases, setCases] = useState<LandmarkCase[]>([])

  useEffect(() => {
    const fetchContent = async () => {
      const supabase = createClient()
      
      // Fetch section headers from site_content
      const { data: sectionData } = await supabase
        .from("site_content")
        .select("content")
        .eq("section_key", "landmark_victories")
        .single()

      if (sectionData?.content) {
        setContent(sectionData.content as LandmarkContent)
      }

      // Fetch landmark cases from cases table
      const { data: casesData } = await supabase
        .from("cases")
        .select("id, case_name, client_name, summary, decision_date, case_type, video_url")
        .eq("is_landmark", true)
        .eq("status", "published")
        .order("decision_date", { ascending: false })

      if (casesData) {
        setCases(casesData)
      }
    }
    fetchContent()
  }, [])

  return (
    <section id="cases" className="py-24 lg:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
              {content.subtitle}
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl tracking-tight">
              {content.title}
            </h2>
          </div>
          <Link 
            href="/cases" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
          >
            View all cases
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="space-y-0">
          {cases.length === 0 ? (
            <p className="text-muted-foreground py-12">No landmark cases yet.</p>
          ) : (
            cases.map((caseItem, index) => (
              <div 
                key={caseItem.id}
                className={`group py-8 lg:py-12 border-t border-border ${index === cases.length - 1 ? 'border-b' : ''}`}
              >
                <div className="grid lg:grid-cols-11 gap-6 lg:gap-8 items-start">
                  <div className="lg:col-span-4">
                    <h3 className="font-medium text-lg lg:text-xl mb-2 group-hover:text-muted-foreground transition-colors">
                      {caseItem.case_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {caseItem.client_name || "Case"}
                    </p>
                  </div>

                  <div className="lg:col-span-5">
                    <p className="text-muted-foreground leading-relaxed">
                      {caseItem.summary}
                    </p>
                  </div>

                  <div className="lg:col-span-2 flex lg:flex-col lg:items-end gap-4 lg:gap-2">
                    <span className="text-sm text-muted-foreground">
                      {caseItem.decision_date ? new Date(caseItem.decision_date).getFullYear() : ""}
                    </span>
                    {caseItem.case_type && (
                      <Link
                        href={`/cases?type=${caseItem.case_type.toLowerCase().replace(" ", "_")}`}
                        className="text-xs uppercase tracking-wider px-2 py-1 border border-border hover:bg-foreground hover:text-background transition-colors"
                      >
                        {caseItem.case_type}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Video Section */}
                {caseItem.video_url && (
                  <div className="mt-6 lg:mt-8">
                    <button
                      onClick={() => setExpandedVideo(expandedVideo === index ? null : index)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                    >
                      {expandedVideo === index ? "Hide Video" : "Watch Video Coverage"}
                    </button>
                    
                    {expandedVideo === index && (
                      <div className="mt-4 aspect-video w-full bg-muted rounded-lg overflow-hidden">
                        <iframe
                          width="100%"
                          height="100%"
                          src={caseItem.video_url.replace("youtu.be/", "youtube.com/embed/").replace("watch?v=", "embed/")}
                          title={`Video - ${caseItem.case_name}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
