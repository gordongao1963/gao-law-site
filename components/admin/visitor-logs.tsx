'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Bot, Users, Globe, MapPin, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'

interface VisitorLog {
  id: string
  path: string
  user_agent: string
  referer: string | null
  visitor_type: string
  visitor_name: string
  created_at: string
  ip_address: string | null
  country: string | null
}

export function VisitorLogs() {
  const [logs, setLogs] = useState<VisitorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'crawlers' | 'humans'>('all')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/visitor-logs')
      if (!response.ok) throw new Error('Failed to fetch logs')
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error('[v0] Failed to fetch visitor logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLogs, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredLogs = logs.filter((log) => {
    if (filter === 'crawlers') return log.visitor_type === 'crawler'
    if (filter === 'humans') return log.visitor_type === 'human'
    return true
  })

  const crawlerCount = logs.filter((l) => l.visitor_type === 'crawler').length
  const humanCount = logs.filter((l) => l.visitor_type === 'human').length

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-serif mb-2">Visitor Analytics</h2>
        <p className="text-muted-foreground">
          Track AI crawlers and human visitors to your site
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-muted-foreground">AI Crawlers</span>
          </div>
          <p className="text-3xl font-semibold">{crawlerCount}</p>
        </div>
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-600" />
            <span className="font-medium text-muted-foreground">Human Visitors</span>
          </div>
          <p className="text-3xl font-semibold">{humanCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'crawlers', 'humans'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All Visitors' : f === 'crawlers' ? 'Crawlers Only' : 'Humans Only'}
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={fetchLogs}
          disabled={loading}
          className="ml-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium w-8"></th>
                <th className="px-4 py-3 text-left font-medium">Time</th>
                <th className="px-4 py-3 text-left font-medium">Page</th>
                <th className="px-4 py-3 text-left font-medium">Visitor</th>
                <th className="px-4 py-3 text-left font-medium">Location</th>
                <th className="px-4 py-3 text-left font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No visits recorded
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedRows.has(log.id)
                  return (
                    <>
                      <tr 
                        key={log.id} 
                        className="border-b border-border hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleRow(log.id)}
                      >
                        <td className="px-4 py-3">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{log.path}</td>
                        <td className="px-4 py-3">
                          {log.visitor_type === 'crawler' ? (
                            <div className="flex items-center gap-2">
                              <Bot className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-blue-700">{log.visitor_name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-green-600" />
                              <span className="text-green-700">Human</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {log.country ? (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs">{log.country}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Unknown</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {log.ip_address || 'N/A'}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${log.id}-details`} className="border-b border-border bg-muted/30">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">User Agent</p>
                                <p className="font-mono text-xs break-all">{log.user_agent || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Referer</p>
                                {log.referer ? (
                                  <a 
                                    href={log.referer} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="font-mono text-xs text-blue-600 hover:underline flex items-center gap-1 break-all"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {log.referer}
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                  </a>
                                ) : (
                                  <p className="text-xs text-muted-foreground">Direct visit</p>
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Visitor ID</p>
                                <p className="font-mono text-xs">{log.id}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Exact Timestamp</p>
                                <p className="font-mono text-xs">{log.created_at}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
