-- Create site_content table for editable page sections
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key VARCHAR(100) UNIQUE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by VARCHAR(255)
);

-- Add RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view site content"
  ON site_content FOR SELECT
  USING (true);

-- Authenticated users can update
CREATE POLICY "Authenticated users can update site content"
  ON site_content FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default landmark victories content
INSERT INTO site_content (section_key, content) VALUES (
  'landmark_victories',
  '{
    "subtitle": "Case Studies",
    "title": "Landmark and Significant Victories",
    "cases": [
      {
        "title": "Boehringer Ingelheim v. DYG",
        "client": "Boehringer Ingelheim",
        "outcome": "The first and only National Major Patent Infringement Case in China. The judgment was successfully enforced against the defendant across 28 provinces in just 18 months following the initial filing.",
        "year": "2023",
        "category": "Patent",
        "video": null
      },
      {
        "title": "Michael Jordan v. Qiaodan Sports",
        "client": "Michael Jordan",
        "outcome": "Secured 77 victories across numerous cases filed across China with a retrial petition to the Supreme People''s Court. Selected as a Supreme Court Model IP case on International IP Day, April 26, 2016. Reported by CCTV.",
        "year": "2016",
        "category": "Trademark",
        "video": "https://youtu.be/fCMHLvC7A0w?si=fjgrs8GHmEwlb_-f"
      },
      {
        "title": "INEOS v. Sinopec",
        "client": "INEOS",
        "outcome": "One of the largest trade secret cases in Chinese history. The settlement resulted in US $7 billion dollars of business for our client over the last decade—one of the most successful settlements in China.",
        "year": "2010",
        "category": "Trade Secret",
        "video": null
      },
      {
        "title": "Apple v. Qualcomm",
        "client": "Apple Inc.",
        "outcome": "The largest SEP case in China at the time involving standard essential patent licensing disputes. Damages claimed exceed RMB 1.6 billion across more than 30 patent infringement cases before 11 IP Courts and the Supreme People''s Court.",
        "year": "2019",
        "category": "Patent",
        "video": null
      }
    ]
  }'::jsonb
) ON CONFLICT (section_key) DO NOTHING;
