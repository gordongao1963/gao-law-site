-- Add authors column to articles table for storing multiple authors with title and firm
ALTER TABLE articles ADD COLUMN authors JSONB DEFAULT '[]'::jsonb;

-- Create index for better query performance
CREATE INDEX idx_articles_authors ON articles USING GIN (authors);

-- Add comment
COMMENT ON COLUMN articles.authors IS 'JSON array of author objects: [{name, title, firm}]';
