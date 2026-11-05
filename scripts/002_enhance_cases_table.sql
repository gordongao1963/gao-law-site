-- Update cases table to add categories and enhanced fields
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS case_type TEXT DEFAULT 'Patent',
ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT 'Electronics',
ADD COLUMN IF NOT EXISTS opposing_party TEXT,
ADD COLUMN IF NOT EXISTS jurisdiction TEXT,
ADD COLUMN IF NOT EXISTS year_filed INTEGER,
ADD COLUMN IF NOT EXISTS key_holding TEXT,
ADD COLUMN IF NOT EXISTS damages_awarded TEXT,
ADD COLUMN IF NOT EXISTS significance_level TEXT DEFAULT 'landmark';

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_case_type ON cases(case_type);
CREATE INDEX IF NOT EXISTS idx_industry ON cases(industry);
