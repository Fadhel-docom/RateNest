# RateNest search-visibility baseline
**Checked:** 2026-11-01  
**Primary host:** https://ratenest.pages.dev/  
**Scope:** Small public search-result sample and source-level SEO consistency review. This is not a ranking audit, a search-volume study, or proof of indexing status.

## Search-result sample
Queries checked on 2026-11-01:
- `site:ratenest.pages.dev RateNest freelance hourly rate calculator`
- `"RateNest" freelance pricing`
- `"non-billable hours" freelance rate calculator`

Observed:
- The small result sample did not return a page from `ratenest.pages.dev`.
- The exact-brand query surfaced two unrelated sites using the RateNest name: `ratenest.net` (a separate freelance-rate calculator) and `ratenest.app` (a reviews platform). This creates a possible brand-search ambiguity; it does not establish trademark status, ownership, or a legal conflict.
- The non-billable-hours query returned competing calculators/resources including Toggl and Spirelight, but no RateNest page in this sample.
- A `site:` query is an imperfect diagnostic. Absence from these results does **not** prove that Google or Bing has not indexed the site. No Search Console or Bing Webmaster Tools account data was available in this review.

## Source-level technical baseline
Reviewed the current `main` versions of:
- `index.html`
- `project-pricing.html`
- `retainer-pricing.html`
- `how-to-price-a-freelance-project.html`
- `robots.txt`
- `sitemap.xml`
- `scripts/check-site.mjs`

Findings:
- All four public pages have distinct descriptive titles, descriptions, one H1, canonical URLs on `ratenest.pages.dev`, and matching Open Graph URLs.
- The four canonical URLs are represented in the sitemap; the sitemap and robots sitemap directive use the primary host.
- `robots.txt` explicitly allows `OAI-SearchBot` and allows general crawlers.
- The homepage, project calculator, retainer calculator and guide have contextual links between related tools and content.
- The source checks cover key metadata, canonical/OG alignment, internal links, sitemap host, OAI-SearchBot allowance, JSON-LD parsing, and static calculator outputs.

These are repository-source observations only. The web fetch tool could not retrieve the live `ratenest.pages.dev` pages, `robots.txt` or `sitemap.xml` in this session. Therefore live response codes, redirects, rendered metadata, crawler access, production deployment and indexing remain unverified here.

## Decision
1. Do not create another generic article or calculator merely to target the same broad freelance-rate questions. Recent improvements already cover hourly rate, day rate, non-billable time, fixed-project actual hours and retainer usage.
2. Treat the exact-brand ambiguity as a monitoring item, not a reason to rename the project in this PR. A brand change requires a separate strategic decision by the owner.
3. The next evidence-led SEO action is to obtain Google Search Console and Bing Webmaster Tools query/page data and map real impressions/clicks to the four canonical pages. Diagnose the sitemap only from new diagnostic evidence; retain the existing instruction not to repeatedly resubmit or alter hosting without evidence.
4. Continue a small manual AI-answer citation sample separately from ordinary web search. Record exact prompt, engine, date, cited URL and accuracy; do not infer AI citations from general search results.

## Evidence references
- Google search result for a separate site using the RateNest name: https://ratenest.net/
- Google search result for a separate review platform using the RateNest name: https://ratenest.app/
- Toggl billable-hours resource: https://toggl.com/online-tools/billable-hours-calculator
- Spirelight billable-hours resource: https://www.spirelight.ai/billable-hours-calculator

## Limitations
- Search-result sample is small and location/personalization may affect results.
- No search-volume, rank-tracking, live-crawl, Search Console, Bing, production-rendering or AI-citation claims are made.
- No production code, tracking, analytics, external service, hosting setting or indexing setting was changed.
