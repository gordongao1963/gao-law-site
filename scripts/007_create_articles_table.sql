-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size INT,
  cover_image_url TEXT,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read of published articles
CREATE POLICY "Allow read published articles" 
  ON articles FOR SELECT 
  USING (status = 'published');

-- Allow admin insert
CREATE POLICY "Allow admin insert articles" 
  ON articles FOR INSERT 
  WITH CHECK (true);

-- Allow admin update
CREATE POLICY "Allow admin update articles" 
  ON articles FOR UPDATE 
  USING (true);

-- Allow admin delete
CREATE POLICY "Allow admin delete articles" 
  ON articles FOR DELETE 
  USING (true);
