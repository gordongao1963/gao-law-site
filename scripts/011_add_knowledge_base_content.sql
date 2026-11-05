-- Add content column to knowledge_base for text snippets
-- The 'answer' field is used for both Q&A answers and snippet content
-- This migration ensures compatibility

-- Update comment on existing columns
COMMENT ON COLUMN knowledge_base.question IS 'Question for Q&A type, or title/topic for snippet type';
COMMENT ON COLUMN knowledge_base.answer IS 'Answer for Q&A type, or content for snippet type';
