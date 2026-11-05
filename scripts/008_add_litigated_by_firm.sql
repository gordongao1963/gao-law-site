-- Add litigated_by_firm column to cases table
-- This marks cases where Gao.Law was counsel (vs. third-party case digests)
ALTER TABLE cases ADD COLUMN litigated_by_firm BOOLEAN DEFAULT true NOT NULL;

-- Add comment
COMMENT ON COLUMN cases.litigated_by_firm IS 'true if Gao.Law was counsel; false for third-party case digests';
