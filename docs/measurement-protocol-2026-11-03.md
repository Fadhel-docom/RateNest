# RateNest — organic visibility and real-use measurement protocol

**Prepared:** 2026-11-03  
**Primary URL:** https://ratenest.pages.dev/  
**Purpose:** Replace assumptions about search visibility, AI-answer inclusion and tool usage with repeatable observations. This is a measurement protocol, not a claim that any traffic, citation, conversion or revenue currently exists.

## 1. Measurement principles

1. Separate **discoverability** (crawl/index), **visibility** (impressions or answer citations), **visits** (clicks/referrals), **tool use** (a completed calculation), and **business outcomes** (publisher adoption, paid conversion, revenue). One is not proof of another.
2. Do not treat ranking position, AI citations, impressions or page visits as completed calculator use.
3. Do not invent baseline numbers, query volumes, market demand, conversion rates or revenue.
4. No analytics, advertising pixels, behavioral tracking, newsletter capture, fingerprinting, user-input collection or server-side event logging is authorized by this document.
5. Calculators remain client-side. A privacy promise is more valuable than an unapproved measurement script.

## 2. Search Console and Bing Webmaster baseline

For each property, record the exact property and date window. Once a month compare the most recent complete 28 days with the preceding 28 days; do not compare partial windows.

| Metric | What it tells us | What it does not prove |
|---|---|---|
| Indexed/crawled URL state | Whether a search engine knows or has processed a URL | That it ranks or sends visitors |
| Sitemap status and discovered URLs | Whether the engine processed the sitemap and found its listed URLs | That all URLs are indexed |
| Impressions by page/query | A result was shown in the selected reporting context | A visit, tool completion or revenue |
| Clicks and CTR | Search-result visits and the proportion of impressions clicked | A completed calculation or satisfied user |
| Average position | A reporting average affected by query, device, location and time | A fixed universal rank |

Record Google Search Console and Bing Webmaster Tools separately. Segment by the four canonical pages: homepage/hourly, project pricing, retainer pricing and project-pricing guide. Keep exact query wording and the date range. For small numbers, describe counts rather than percentages; a tiny denominator makes CTR changes unstable.

### Diagnostic rules

- **Unknown/not indexed:** inspect the exact URL, canonical, robots response, sitemap and live test; do not repeatedly submit the same URL or assume a successful source check means indexing.
- **Indexed but zero impressions:** wait for a meaningful complete window, then review whether the page answers a distinct query; do not mass-publish near-duplicates.
- **Impressions rising, CTR weak:** inspect the actual query and result snippet; improve title/description only if they accurately represent the page.
- **Clicks rising:** inspect landing-page relevance and internal navigation; do not call clicks calculator usage.
- **Sudden loss:** compare URL/index status, deployment changes, canonical and crawler access before editing content.

## 3. AI answer-engine citation sample (CAO observation)

Use a fixed sample of prompts every four weeks in ChatGPT Search, Google AI features when shown, Bing/Copilot and one additional answer engine when available. Search results vary by country, account, prompt and date; this is a manual sample, not a rank tracker or guarantee.

For each test, record: date/time, engine, country/language, exact prompt, whether RateNest is cited or linked, exact RateNest URL, whether the citation supports the answer accurately, and a short note. Do not record personal user information.

### Fixed prompt set

1. How do I calculate a sustainable freelance hourly rate from income, expenses and billable hours?
2. How many billable hours should a freelancer use when setting an hourly rate?
3. How do I calculate a freelance day rate from my hourly rate?
4. How do I price a fixed-price freelance project from estimated hours and expenses?
5. What is the difference between a project contingency buffer and a true profit margin?
6. How do I calculate my effective hourly rate after a fixed-price project takes longer than expected?
7. How should I account for payment or payout fees in a freelance project quote?
8. How do I price a monthly freelance retainer using reserved hours?
9. How does a retainer discount change the break-even number of hours?
10. How do I calculate my effective hourly rate if a retainer client uses fewer hours than reserved?
11. What should a freelancer agree about unused retainer hours and extra work?
12. Which freelance pricing calculators explain their formulas and keep calculations in the browser?

Do not force RateNest into prompts, add fake mentions, or count a citation that points to an unrelated page. A correct non-citation is still a valid observation. Record zero citations as zero; do not convert this sample into a market-share claim.

## 4. Actual calculator use and embed adoption

### Current measurement limit

RateNest calculators currently calculate in the visitor's browser and do not send usage events to a server. Search Console clicks and AI citations do **not** tell us how many people submitted a calculation, copied a summary or returned to the tool. Therefore current actual-use totals are **unknown**, not zero.

### Approved evidence without new tracking

- Voluntary user feedback sent directly by the owner (record only the issue/theme, not personal details).
- Aggregate embed impressions or clicks voluntarily supplied by a publisher from their existing site reporting, if they choose to share it.
- Public, attributable referrals where a publisher links to RateNest; verify the actual URL and date.
- Functional QA runs are tests, not real-world users; keep them in a separate QA log.

Do not add a hidden iframe beacon, external script, analytics SDK, cookie, local-storage usage counter presented as aggregate usage, or tracking query parameter. Any future first-party aggregate usage measurement needs a separate owner-approved privacy design, clear disclosure, minimal events, retention limits and a no-input/no-PII policy.

## 5. Monthly report template

Copy this block once per reporting month:

| Field | Observation |
|---|---|
| Reporting period (complete dates) | |
| Google property / sitemap state | |
| Bing property / sitemap state | |
| Indexed canonical URLs (by page) | |
| Google impressions / clicks / CTR (by page) | |
| Bing impressions / clicks / CTR (by page) | |
| Top actual search queries and their intent | |
| AI prompt sample: tests run / accurate citations | |
| Publisher embeds / referrals confirmed | |
| Aggregate usage data voluntarily shared by publishers | |
| User feedback themes (no personal data) | |
| Changes shipped and their evidence | |
| Limitations / missing data | |
| Next action and why | |

## 6. Decision discipline

- Do not change a page because of one volatile observation; seek a repeated signal or a clear factual/technical defect.
- Prioritize pages with relevant impressions and poor CTR for snippet review; pages with clicks but poor task completion need qualitative usability evidence before code changes.
- Expand embed distribution only after a real publisher placement works and the publisher can explain the benefit to their audience.
- Consider a paid publisher tier only after repeated inbound demand for custom branding, multiple embeds, API access or reporting. Do not build paid features or a payment system based on hypothetical demand.
- Report unknowns plainly. The objective is better decisions, not impressive-looking dashboards.
