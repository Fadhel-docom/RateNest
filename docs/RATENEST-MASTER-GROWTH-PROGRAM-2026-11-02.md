# RateNest — master product, search and distribution growth programme

- **Approved scope:** owner request, 2026-11-02.
- **Primary URL:** https://ratenest.pages.dev/
- **Repository:** https://github.com/Fadhel-docom/RateNest
- **Operating model:** ChatGPT + Claude as equal partners, divided by strengths.
- **Purpose:** build a genuinely useful, internationally accessible pricing toolkit that earns discovery, repeat use, references and embeds through product value—not through promises of rankings or virality.
- **Evidence limits:** no universal global top-20 ranking exists; the current 20-product benchmark is curated, not a verified ranking. No search volume, conversion, AI citation, traffic or revenue claims are made without data.

## 1. North-star product promise

**RateNest helps people who sell, buy, or manage freelance work understand a fair and sustainable price, estimate project costs, and explain a quote clearly.**

Primary audiences:
1. Freelancers and independent professionals setting hourly, day, project or retainer prices.
2. Small agencies and service businesses estimating delivery costs and margins.
3. Clients comparing and understanding a freelance quote.
4. Creators, consultants and specialists pricing services or deliverables.
5. Publishers and site owners who want a useful pricing calculator for their readers.
6. Developers who may integrate a calculator or link to a documented tool.

Do not broaden the product into a full CRM, invoicing suite, time tracker, tax engine or financial-advice service. Expand only where a specific user decision is underserved and the value gate is passed.

## 2. Product architecture: six connected capability areas

### A. Sustainable personal pricing
- Hourly and day-rate planning.
- Billable versus non-billable capacity and time off.
- Income, expense and working-capacity assumptions.
- Clear formula, scenarios and reusable explanations.

### B. Project pricing and client communication
- Fixed-price project estimate.
- Optional breakdown of planning, production, meetings, revisions/QA and administration.
- Actual-hours comparison.
- Client-facing printable quote.
- Optional user-entered payment/payout deductions after the fee model is approved.

### C. Retainer and recurring work
- Monthly reserved hours, rate, optional discount and contract duration.
- Expected actual usage, effective rate and break-even/overage interpretation.
- Future scenario comparison only if it adds a distinct, evidenced decision.

### D. Costs and commercial sustainability
- User-entered direct expenses and fee assumptions.
- Clearly distinguished quote, deductions, estimated remainder, effective rate and profit (never conflate them).
- No default provider fees, invented tax rates, or live FX claims.

### E. International usability
- Separate currency formatting from currency conversion.
- Add locales only with reviewed translations, correct number/date formats and tests.
- Any market or regional benchmark requires transparent sources, sample, date, geography, method and uncertainty.
- No automatic market-rate recommendation without defensible data.

### F. Distribution products for other sites
- First: lightweight, privacy-preserving embeddable calculators, only after the product and embed use case are validated.
- Second: shareable calculations/quote summaries that disclose only what the user chooses.
- Third: developer documentation and a stable, limited integration interface if real integration demand is demonstrated.
- No backend, accounts, analytics, tracking, external paid service or data collection without owner approval and a privacy review.

## 3. Search and discovery system

### Traditional search (Google and Bing)
- Maintain one canonical URL per distinct visitor task; improve existing pages before creating near-duplicates.
- Map each query intent to the best existing destination: homepage/hourly and day rate; project calculator and project guide; retainer calculator.
- Strengthen contextual internal links and answer-first explanations where they solve an actual gap.
- Maintain accurate titles, descriptions, canonical/OG, sitemap, robots, structured data and extensionless Cloudflare canonical URLs.
- Treat source correctness, successful CI, preview deployment, production deployment, crawl, indexing, impressions and clicks as separate states.
- Use Search Console and Bing query/page data when available; do not repeatedly submit indexing requests or infer indexing from deployment.

### AI answer engines
- Make important answers directly readable in visible page text: answer, definition, formula, worked example, assumptions, limitations and relevant calculator link.
- Cite authoritative primary sources for changing facts and date-stamp them.
- Use semantic HTML, descriptive headings, accurate structured data only where it matches the visible page, and crawlable links.
- Keep OAI-SearchBot allowed; do not confuse it with GPTBot or claim that permission guarantees citation.
- Maintain a small fixed citation test set across ChatGPT Search, Google AI features, Bing/Copilot and Perplexity when accessible. Record prompt, engine, date, cited URL and correctness. A test sample is not a ranking metric.
- No mass-generated FAQs, thin pages, fabricated experts, fake citations or keyword-stuffed content.

### Content system
Every content item must be a useful answer or tool, not a word-count target. Before writing, record:
- exact visitor question and audience;
- evidence and date;
- current RateNest destination and gap;
- competitor/alternative patterns and sources;
- unique practical value;
- calculation and assumptions;
- internal link to the tool;
- review date for changing facts;
- verification and measurement.

Initial intent map (hypotheses, not measured query volumes):
- “How much should I charge per hour?” → homepage hourly calculator.
- “How do I calculate a freelance day rate?” → homepage day-rate explanation.
- “How do I account for non-billable hours?” → homepage billable-capacity explanation.
- “How do I price a fixed-price project?” → project calculator + project guide.
- “How do I know my actual hourly rate after a project overruns?” → project calculator actual-hours result.
- “What should I charge for a monthly retainer?” → retainer calculator.
- “How do I account for payment/platform/payout fees in a project quote?” → project calculator after the user-entered-fee feature passes review.
- Do not create a separate page for an intent already answered well by an existing page unless new evidence shows a distinct need.

## 4. Competitive intelligence

The current benchmark in `docs/competitive-benchmark-2026-11-02.md` is a curated 20-product comparison, not a global rank list. Continue it as a living evidence file:
- revisit the most relevant competitors when a specific feature decision is being made;
- capture source URL, access date, exact observed behavior, user value, RateNest gap and implementation trade-off;
- distinguish observed facts from unverified assumptions;
- do not label a competitor weak, inaccurate, inaccessible or privacy-invasive without testing evidence;
- do not copy brand, wording, layout or proprietary assets.

Compete on the combination of transparent calculations, connected pricing workflows, mobile usability, privacy by default, client-ready outputs, honest limitations and useful integration—not raw tool count.

## 5. External adoption and organic distribution

Build a self-reinforcing but non-guaranteed loop:
1. A person discovers a precise answer or calculator.
2. The tool produces a clear, useful result.
3. The visitor can copy, print or share a client-safe result.
4. Relevant publishers may embed or link to the tool.
5. Those referrals introduce new qualified users who may return.

Work in this order:
- Validate which existing calculator is most suitable for embedding and identify the exact publisher use case.
- Define a minimal embed with responsive sizing, accessible labels, no third-party tracking, no hidden data transmission, clear attribution and a way to open RateNest directly.
- Test security boundaries and origin/referrer behavior before public release; no arbitrary HTML/script injection.
- Publish an honest integration guide and examples only after the embed works.
- Consider shareable results and developer interfaces only after privacy, persistence and abuse implications are reviewed.
- Earn references through useful resources and publisher utility; never buy links, spam outreach, generate fake reviews or create link schemes.

## 6. Quality and trust requirements

Every visitor-facing PR must pass `docs/VALUE-BEFORE-PUBLISHING.md` and include:
- visitor need and evidence;
- added practical value and differentiation;
- correct calculations, explicit units and assumptions;
- edge cases and validation;
- mobile/responsive behavior and accessibility;
- metadata, canonical, internal links, sitemap/robots/structured data where relevant;
- tests actually run and limitations not tested;
- a follow-up measurement plan.

Maintain browser-only calculations and privacy by default. Do not add tracking, ads, newsletter capture, user accounts, backend, external paid services or new permissions without owner approval.

## 7. Role split and handoff contract

### ChatGPT — product, evidence, discovery and distribution
- Maintain the audience/problem map and prioritised product roadmap.
- Research competitor workflows and search intent; cite sources and label uncertainty.
- Audit the existing content architecture and identify gaps versus duplication.
- Design AI-answer-ready explanations and question-to-page mapping.
- Research embed use cases, distribution mechanics, attribution and privacy constraints.
- Write value notes, acceptance criteria, test scenarios and review implementation diffs.
- Keep strategy and handoffs in the Operations Room.

### Claude — implementation and technical quality
- Own code architecture, calculator logic, UI implementation, responsive design, accessibility, browser automation, unit tests, static checks and build/deployment diagnosis.
- Review ChatGPT's evidence and acceptance criteria before implementation; challenge unclear assumptions.
- Implement small, isolated PRs with test evidence and preview checks.
- Review ChatGPT's proposed calculations and content for technical accuracy.
- Do not add backend, analytics, tracking, external dependencies, default fee rates or other out-of-scope assumptions.

### Shared
- Equal partners; neither assumes the other's work is correct without review.
- Do not edit the same files concurrently. A task has one implementation owner and one reviewer.
- Answer the other partner's explicit open requests first.
- Branch + PR only; never write directly to main. No merge merely because CI is green; review the diff.
- Log meaningful work, evidence, limitations, requests and advice in the Operations Room and STATUS.

## 8. Prioritised execution sequence (refreshed 2026-11-03)

### Completed — project payout-fee model
- The optional user-entered payout-fee feature was implemented and merged in PR #77.
- Model: one user-entered percentage applied to the client-paid gross quote plus one fixed payout deduction. Both inputs are blank by default; no provider presets, taxes or live FX.
- The rounding rule and tests are recorded in PR #77 and STATUS. The gross amount is rounded upward in integer cents so the remaining amount does not fall below the target and can exceed it by at most one cent.
- Follow-up: measure relevant query/page data when available; do not infer demand or impact from deployment.

### Current gated task — one hourly-calculator embed pilot
- Publisher-fit research is recorded in docs/embed-publisher-target-research-2026-11-02.md: nine relevant publisher pages assessed; no acceptance, traffic, search-volume or backlink benefit is claimed.
- PR #81 merged a deny-by-default framing policy for all pages. A fixed-height hourly embed is technically feasible, but Cloudflare response headers have not yet been verified.
- First action: verify Content-Security-Policy frame-ancestors 'none' and X-Frame-Options DENY on a Cloudflare preview for an ordinary page. A successful deploy or local emulation is not enough.
- Only after that evidence, create /embed/hourly and a narrowly scoped framing exception together in one PR. Keep all ordinary pages denied. Test from a separate origin, and prove formula parity, privacy, keyboard/accessibility and mobile behavior.
- Do not contact publishers or publish an integration guide until the prototype passes the acceptance gate. No mass outreach or SEO promises.

### Next — evidence-led content audit
- Map existing pages to actual Google/Bing query and page data when reports become available. Until then, audit only clear answer gaps in current pages; do not create near-duplicate pages or mass FAQs.
- For AI answer visibility, maintain a small fixed prompt sample and record only observed citations with engine/date/URL; allow OAI-SearchBot but do not claim permission guarantees citations.

### Then — international readiness
- Start with a locale/currency requirements audit, not automatic translation or FX conversion.
- Add one well-reviewed locale only when the complete journey, formulas, formats and tests can be maintained.

### Continuous — search and quality monitoring
- Recheck GSC/Bing when fresh reports become available; do not repeat indexing submissions just to create activity.
- Keep deployment, crawl, indexing, impressions, clicks and AI citations as separate evidence states.
- Fix user-impacting bugs and accessibility/performance regressions before adding more tools.

## 9. Success measures (no invented targets)

Report observed values, dates and source:
- Product: successful calculation scenarios, validation errors, calculation defects, task completion checks.
- Search: indexed canonical pages, impressions, clicks, CTR, query-to-page fit and crawl/index status from Google/Bing.
- AI discovery: fixed prompts, answer engine, date, cited RateNest URL and citation correctness.
- Distribution: verified referring domains, active embeds, embed loads where measurable without tracking individuals, and referral visits only if privacy-approved aggregate analytics become available.
- Quality: unit/browser/static checks, accessibility issues, mobile overflow, page performance where actually measured.
- Business: revenue only if a real revenue mechanism is introduced and actual payments are recorded. Do not forecast earnings from rankings or traffic guesses.

## 10. Current baseline and constraints (refreshed 2026-11-03)

- Existing core: hourly/day-rate, fixed-project quote, retainer pricing, project guide, billable/non-billable explanations, actual project hours, retainer actual-use/break-even, optional project-hours categories (PR #73), printable client-facing project quote (PR #74), optional payout-fee gross-up (PR #77), and a verified complete project quote worked example (PR #93). Do not rebuild existing features. The custom task-level estimate list is in progress on a separate feature branch.
- Search baseline recorded 2026-11-01: four canonical URLs; Google reported unknown/pending in available evidence; Bing sitemap acceptance was later confirmed by Claude on 2026-11-02. No claim of indexing, rankings, traffic or AI citations.
- PR #77 merged the user-entered payout-fee feature; PR #81 merged deny-by-default framing headers. Local checks passed as documented, but live Cloudflare header delivery remains unverified.
- PR #82 carries refreshed publisher-fit research and the corrected embed security sequence. The older PR #76 branch is stale; this refreshed growth programme is being rebased onto current main.
- Primary site: `https://ratenest.pages.dev/`; old GitHub Pages is backup only.
