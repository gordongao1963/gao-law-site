# Gao.Law AI Search Submission Checklist

## Completed Setup

- [x] robots.txt - Configured for all major AI crawlers
- [x] llms.txt - AI cheat sheet with firm overview
- [x] llms-full.txt - Comprehensive content file (all cases, KB, articles)
- [x] sitemap.xml - All pages and AI content files listed
- [x] JSON-LD Structured Data - Organization, Website, and Service schemas
- [x] Markdown content mirrors - All pages in /content/*.md format

---

## Manual Submission Steps

### 1. Google Search Console (Bard, Gemini, Google AI Overview)
**URL:** https://search.google.com/search-console

1. Add property: `https://gao.law`
2. Verify ownership (DNS, HTML file, or meta tag)
3. Submit sitemap: `https://gao.law/sitemap.xml`
4. Request indexing for key pages

### 2. Bing Webmaster Tools (Copilot, Microsoft AI)
**URL:** https://www.bing.com/webmasters

1. Add site: `https://gao.law`
2. Verify ownership
3. Submit sitemap: `https://gao.law/sitemap.xml`
4. Use URL submission tool for priority pages

### 3. Yandex Webmaster (International coverage)
**URL:** https://webmaster.yandex.com

1. Add site and verify
2. Submit sitemap
3. Good for Russian/CIS region visibility

---

## Automatic Crawling (No Action Needed)

These AI systems will automatically discover and index your site via robots.txt:

| AI System | Crawler | Status |
|-----------|---------|--------|
| ChatGPT/OpenAI | OAI-SearchBot, GPTBot | Allowed |
| Claude/Anthropic | Claude-SearchBot, ClaudeBot | Allowed |
| Perplexity | PerplexityBot | Allowed |
| Meta AI | Meta-ExternalAgent | Allowed |
| Cohere | cohere-ai | Allowed |
| Mistral | MistralAI-User | Allowed |
| Amazon | Amazonbot | Allowed |

---

## Priority URLs for Manual Submission

Submit these URLs first when using webmaster tools:

1. `https://gao.law/` - Homepage
2. `https://gao.law/llms-full.txt` - Complete AI content file
3. `https://gao.law/cases` - Case digest library
4. `https://gao.law/articles` - Articles and insights
5. `https://gao.law/contact` - Contact information

---

## Content Update Workflow

When you add new cases or articles:

1. Update `llms-full.txt` with new content
2. Update `sitemap.xml` lastmod dates
3. Resubmit sitemap in Google Search Console
4. Use "Request Indexing" for specific new URLs

---

## Verification Checklist

Test these URLs are accessible:

- [ ] https://gao.law/robots.txt
- [ ] https://gao.law/sitemap.xml
- [ ] https://gao.law/llms.txt
- [ ] https://gao.law/llms-full.txt
- [ ] https://gao.law/content/cases.md

---

## Rich Results Testing

Validate JSON-LD structured data:

**URL:** https://search.google.com/test/rich-results

1. Enter `https://gao.law`
2. Verify Organization schema detected
3. Verify LegalService schema detected
4. Fix any errors shown

---

## Notes

- AI crawlers respect robots.txt - your current setup allows all major AI bots
- llms-full.txt is the single source of truth for AI - keep it updated
- JSON-LD helps AI understand your firm's services and credentials
- Most AI systems crawl weekly or more frequently for active sites
