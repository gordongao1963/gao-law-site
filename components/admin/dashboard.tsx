"use client"

import { useState, useEffect } from "react"
import { CaseUploader } from "./case-uploader"
import { CaseList } from "./case-list"
import { BulkImportForm } from "./bulk-import"
import { SiteSettings } from "./site-settings"
import { VisitorLogs } from "./visitor-logs"
import { AdminInbox } from "./inbox"
import { KnowledgeBaseManager } from "./knowledge-base-manager"
import { ArticleManager } from "./article-manager"
import { Button } from "@/components/ui/button"
import { LogOut, FileText, Home, Database, Settings, BarChart3, Mail, BookOpen, Brain } from "lucide-react"
import Link from "next/link"

type View = "upload" | "cases" | "bulk" | "settings" | "analytics" | "inbox" | "articles" | "knowledge"

interface AdminDashboardProps {
  onLogout: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [view, setView] = useState<View>("cases")

  // Authenticate admin session on mount
  useEffect(() => {
    fetch("/api/admin/login", { method: "POST" }).catch((err) => {
      console.error("[v0] Failed to authenticate admin session:", err)
    })
  }, [])

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
            <Link href="/" className="font-serif text-xl font-semibold text-foreground">
              Gao.Law <span className="text-sm font-light">高点法</span>
            </Link>
              <span className="text-sm text-muted-foreground">Admin Dashboard</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  View Site
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-4">
            <button
              onClick={() => setView("upload")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                view === "upload"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-4 h-4" />
              Upload Cases
            </button>
            <button
              onClick={() => setView("knowledge")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                view === "knowledge"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Brain className="w-4 h-4" />
              Knowledge Base
            </button>
            <button
              onClick={() => setView("bulk")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                view === "bulk"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Database className="w-4 h-4" />
              Bulk Import
            </button>
            <button
              onClick={() => setView("settings")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                view === "settings"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings className="w-4 h-4" />
              Site Settings
            </button>
            <button
              onClick={() => setView("inbox")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                view === "inbox"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="w-4 h-4" />
              Inbox
            </button>
            <button
              onClick={() => setView("analytics")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                view === "analytics"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
            <button
              onClick={() => setView("articles")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                view === "articles"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Articles
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === "cases" && <CaseList />}
        {view === "bulk" && <BulkImportForm />}
        {view === "upload" && <CaseUploader onComplete={() => setView("cases")} />}
        {view === "settings" && <SiteSettings />}
        {view === "analytics" && <VisitorLogs />}
        {view === "inbox" && <AdminInbox />}
        {view === "articles" && <ArticleManager />}
        {view === "knowledge" && <KnowledgeBaseManager />}
      </main>
    </div>
  )
}
