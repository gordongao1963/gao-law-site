-- Create knowledge_base table for chat training material
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- e.g., "About Firm", "Practice Areas", "Patents", etc.
  type TEXT NOT NULL CHECK (type IN ('qa', 'snippet')), -- "qa" for Q&A pairs, "snippet" for text snippets
  question TEXT, -- For Q&A format (nullable for snippets)
  answer TEXT NOT NULL, -- Content/answer for both formats
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[], -- Tags for search
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searching
CREATE INDEX IF NOT EXISTS knowledge_base_category_idx ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS knowledge_base_keywords_idx ON knowledge_base USING GIN (keywords);

-- Add comment
COMMENT ON TABLE knowledge_base IS 'Training material for the chat system - includes Q&A pairs and text snippets';
