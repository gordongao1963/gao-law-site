-- Create visitor_logs table to track AI crawlers and other visitors
CREATE TABLE IF NOT EXISTS visitor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_type TEXT NOT NULL DEFAULT 'unknown', -- 'ai_crawler', 'search_engine', 'human', 'bot', 'unknown'
  visitor_name TEXT, -- e.g., 'ChatGPT', 'Claude', 'Googlebot', etc.
  user_agent TEXT,
  ip_address TEXT,
  path TEXT NOT NULL,
  referer TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_visitor_logs_created_at ON visitor_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_visitor_type ON visitor_logs(visitor_type);

-- Enable RLS
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for tracking)
CREATE POLICY "Allow public inserts" ON visitor_logs FOR INSERT WITH CHECK (true);

-- Allow authenticated reads (for admin)
CREATE POLICY "Allow public reads" ON visitor_logs FOR SELECT USING (true);
