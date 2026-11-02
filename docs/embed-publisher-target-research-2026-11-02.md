# RateNest embed distribution — publisher fit and outreach shortlist

Research date: 2026-11-02
Owner: ChatGPT — publisher research, product value and distribution.
Status: Research/value gate only. No embed implementation, publisher contact, paid placement, backlink agreement or public invitation is approved.
Related technical review: docs/embed-feasibility-review-2026-11-02.md (Claude, PR #78 merged).
Primary site: https://ratenest.pages.dev/

## Decision

A narrow publisher pilot is worth preparing, but an embed is not automatically an SEO strategy.

Claude's review confirms that an attribution link inside an iframe belongs to the iframe document. It is not part of the publisher's HTML and does not create a backlink from the publisher's page to RateNest. Realistic value:
- Publisher gets a free, maintained interactive pricing aid without maintaining calculation logic.
- Reader calculates a personal cost-based minimum rate without leaving the article.
- RateNest may gain brand exposure and referral visits. A normal contextual link exists only if the publisher independently chooses to add one.

Do not promise rankings, link equity, traffic, dwell-time gains or conversions. Do not require dofollow links or keyword-stuffed anchors. For organic discovery, a genuine editorial link or resource listing is more directly relevant than an iframe alone.

## Why the existing hourly calculator may help

The current shared calculation logic uses annual income target plus annual business expenses, weekly working hours, weeks off and billable-time percentage. It shows hourly/day/week equivalents, billable-capacity scenarios and formula steps. Optional fee/buffer adjustments are user-entered; no provider fee is assumed.

This is a personal cost-and-capacity estimate, not a market-rate benchmark, tax calculator, guaranteed income or recommendation of what a profession should charge. It can complement rate-setting content. The full site also connects hourly pricing with project quotes and retainers; the embed should remain useful alone and link to the full tool for deeper workflows.

## Competitive reality

Public embed examples reviewed 2026-11-02:
- Sengi: free effective-hourly-rate iframe with visible attribution.
- Instilus: free commercial-use calculator iframes; its freelance-rate widget explicitly targets communities, job boards and agency resource sites.
- JupiterInvoice: iframe and auto-resizing loader for freelance rate calculators, no tracking pixel.
- Earlier research also reviewed CalculatorAI, DecisionsCalc, CalcHub, ProjectCalc and calculate.at.

“Free iframe + attribution + no signup” is already common. Some competitors also claim browser-only calculation or no tracking. RateNest must compete on calculation usefulness, connected pricing workflow, transparent formulas, privacy and reliability—not on claiming to be first.

## Publisher shortlist

This is a page-level fit assessment, not proof of acceptance. “No comparable calculator observed” means none was visible on the reviewed page; it is not a claim about the publisher's entire site.

| Priority | Publisher and reviewed page | Why it may fit | Caution |
|---|---|---|---|
| A1 | Freelancing.Support — “Setting your pricing” and “Day Rate Benchmarks” | Pricing article directly addresses what to charge; resource directory lists current 2026 rate sources. | Membership/community resource; embed permission and capability unknown. |
| A2 | Freelancers Union — “5 tips for setting your freelance rates” | Covers annual expenses, hours, hourly vs project pricing; page invites community contributions. | Article dates from 2018; check freshness and site-wide tool overlap. |
| A3 | Creators’ Rights Alliance — “Calculating rates and fees” / 2026 Day Rate Guide | Professional creative-freelancer resource; discusses project/day rates, production costs and licensing. | RateNest must not claim to calculate licence value, royalties or collective-agreement minimums. |
| A4 | ScreenSkills — “What’s my rate?” / Freelance Toolkit | Dedicated film/TV freelancer toolkit covers costs, downtime and rate-setting. | Not a replacement for BECTU rate cards, role-specific budgets or UK tax/holiday tools. |
| A5 | Society of Authors — “Rates and fees” | Guidance covers flat fees, rights, expenses, VAT and negotiation. | Rights and royalties can dominate author fees; RateNest does not model them. |
| B1 | ProCopywriters — “What you should expect to pay” / 2026 survey | Current survey and guide discuss day rates, project fees and retainers. | Per-word pricing and copywriting-specific market data are outside the generic calculator. |
| B2 | CIEP — “Suggested minimum rates” / “Working freelance” | Current 2026–27 hourly-rate guidance explains freelancer overheads. | RateNest is a personal baseline, not a replacement or recommendation of editorial rates. |
| B3 | NUJ / London Freelance — “Freelance resources” / “The Rate for the Job” | Freelance resource hub links to fee guides and a rate-reporting resource updated in 2026. | Journalism uses per-word, shift, rights and commission structures not modelled by the tool. |
| B4 | The Work Crowd — 2026 UK/EU/US day-rate guides | Publishes regional day-rate guides for independent consultants. | Its freelancer page already mentions an income calculator and platform service fee; lower priority. |

### Exclusions / low priority
- Upwork already publishes its own freelance rate calculator.
- Editorial Freelancers Association says it has its own rate estimator and rate converter.
- Sengi and Instilus are relevant competitors with embed products, not prospects.
- Keep The Work Crowd low priority unless a specific article has a gap not met by its dashboard calculator.

## Recommended first audience

Start with freelance education/resource pages, not generic blogs or unrelated high-traffic sites. First five research targets:
1. Freelancing.Support pricing guidance.
2. Freelancers Union rate-setting content or a community contribution.
3. Creators’ Rights Alliance rate guidance, framed only as a personal cost baseline.
4. ScreenSkills “What's my rate?”, with a non-replacement disclaimer.
5. Society of Authors' rates/fees guidance, only as a supplementary baseline.

A smaller, highly relevant publisher is more valuable for the first pilot than a large unrelated website. This is a research queue, not evidence that anyone will accept.

## Publisher pack if the value gate passes

- One compact hourly-rate calculator, not the full site inside a frame.
- Copy-ready iframe snippet with descriptive title, lazy loading and documented fixed height.
- Visible link to the full RateNest calculator.
- Optional plain text link below the frame that the publisher may choose to include in its own page. This—not the internal iframe attribution—is the possible host-page link.
- Short WordPress, Squarespace, Webflow and plain-HTML instructions.
- Plain privacy wording: no account/API key, no visitor inputs sent to RateNest, no cookies or analytics; hosting connection metadata is still processed by the host provider.
- No white-label, API, theme controls, auto-resize, prefilled query parameters, analytics, tracking, cookies or backend in the first pilot.

## Sequence and stop conditions

1. Claude's feasibility/security review is complete (PR #78 merged).
2. ChatGPT's publisher-fit research is recorded here.
3. If the value gate is accepted, Claude may make a small deny-by-default framing-header PR with a tested /embed/* exception, then build one fixed-height hourly prototype with formula-parity and privacy tests.
4. Only after the prototype passes the technical checklist, prepare five tailored manual pilot invitations. No mass outreach, paid placements or automated messages.
5. Review actual responses and public placements. If publishers see no clear reader benefit, stop embed work and prefer direct resource links or shareable calculator links.

Stop if the frame-header exception cannot be verified, visitor inputs leave the browser, formula parity fails, mobile/keyboard/accessibility issues remain, the value proposition depends on backlink promises, or a small qualified pilot finds no interest.

## Sources reviewed 2026-11-02

- https://www.freelancing.support/expertview/setting-your-pricing-dave-smyth
- https://www.freelancing.support/resources/day-rates
- https://blog.freelancersunion.org/2018/10/17/5-tips-for-setting-your-freelance-rates/
- https://www.creatorsrightsalliance.org/calculating-rates-and-fees
- https://www.creatorsrightsalliance.org/freelance-day-rate-guide-2026
- https://www.screenskills.com/your-career/freelance-toolkit/whats-my-rate/
- https://www.screenskills.com/your-career/freelance-toolkit/
- https://societyofauthors.org/advice/rates-fees/
- https://www.procopywriters.co.uk/what-you-should-expect-to-pay/
- https://www.procopywriters.co.uk/survey/2026/
- https://www.ciep.uk/knowledge-hub/suggested-minimum-rates.html
- https://www.ciep.uk/resource/working-freelance.html
- https://www.nuj.org.uk/advice/freelance-resources.html
- https://www.londonfreelance.org/rates/index.php/index.html
- https://theworkcrowd.com/resources/2026-day-rate-guide-uk
- https://theworkcrowd.com/freelancers
- https://www.the-efa.org/2026-editorial-rate-chart/
- https://www.upwork.com/tools/freelance-rate-calculator/
- https://sengi.co/calculator/
- https://www.instilus.com/embed
- https://jupiterinvoice.com/tools/freelance-rate-calculator/embed/

Not established: publisher acceptance, traffic, search volume, backlink value, embed conversion rate or live response headers. No messages were sent. No application code or production settings changed.
