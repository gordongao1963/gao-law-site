-- Create site settings table for storing site-wide configuration
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  site_password TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default row (no password set initially)
INSERT INTO site_settings (id, site_password) 
VALUES ('default', NULL)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access (needed for password check)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to site_settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Allow public update to site_settings"
  ON site_settings FOR UPDATE
  USING (true);
