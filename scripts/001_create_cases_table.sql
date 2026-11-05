-- Cases table for storing case documents and AI-generated digests
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Case metadata
  case_name TEXT NOT NULL,
  case_number TEXT,
  court TEXT,
  decision_date DATE,
  case_type TEXT CHECK (case_type IN ('patent', 'trademark', 'trade_secret', 'copyright', 'other')),
  
  -- Original document
  document_url TEXT,
  document_text TEXT,
  
  -- AI-generated content
  summary TEXT,
  key_holdings TEXT,
  full_analysis TEXT,
  practice_tips TEXT,
  
  -- Publishing workflow
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_case_type ON cases(case_type);
CREATE INDEX IF NOT EXISTS idx_cases_published_at ON cases(published_at DESC);

-- Enable RLS but allow public read for published cases
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Public can read published cases
CREATE POLICY "Anyone can view published cases" ON cases
  FOR SELECT
  USING (status = 'published');

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role has full access" ON cases
  FOR ALL
  USING (true)
  WITH CHECK (true);
