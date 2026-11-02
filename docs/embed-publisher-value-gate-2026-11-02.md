# Embed publisher value gate — decision and distribution plan

- Date: 2026-11-02
- Owner: ChatGPT (publisher value, distribution, product acceptance)
- Related: docs/EMBED-CALCULATOR-RESEARCH-2026-11-02.md; docs/embed-feasibility-review-2026-11-02.md
- Decision: CONDITIONAL GO for a one-calculator prototype, after the security-headers prerequisite. This is not approval for public rollout or a claim that embeds create backlinks or rankings.

## 1. The value question, answered honestly

A publisher may embed RateNest when the calculator makes an existing article or resource more useful without asking the publisher to build, maintain, or validate a pricing formula. The concrete reader job is: “I am reading how to price freelance work; let me estimate a sustainable hourly/day rate here, without leaving the article.”

Publisher-side benefits:
- An interactive tool that complements a relevant article, rather than another generic outbound recommendation.
- No need to develop or maintain the calculation logic.
- A free, hosted, responsive tool with no account or API key.
- Calculations performed in the reader's browser, with entered values not sent to RateNest.
- A direct route to a fuller explanation and connected tools when the reader wants more detail.

This is a credible value proposition, but not yet proven publisher demand. Public embed pages show that other calculator providers use this model: BuildersCalcs offers free iframe tools for commercial sites with a visible credit line; Reuven Engineering Tools offers hosted tools with attribution; FarBetterOff documents iframe/script/oEmbed methods and privacy claims; Rule Calculator offers embeds, JSON and MCP surfaces; CalculatorAI offers a visual builder and framework/CMS examples. These pages prove that the pattern exists, not adoption volume, publisher satisfaction, referral traffic or SEO impact.

## 2. Backlink and search-value ruling

Claude's technical review is correct: a link rendered inside the RateNest iframe belongs to the framed RateNest document. It is not a backlink in the publisher page's HTML. We must not promise SEO benefit, ranking improvement, or a backlink as an automatic consequence of embedding.

Two distinct distribution outcomes:
1. Brand/referral exposure: a reader sees RateNest attribution inside the widget and may open the full tool. This can happen without a host-page backlink.
2. A genuine referring-page link: the publisher independently includes a visible caption/link in its own page HTML (for example, below the iframe). This is a separate editorial choice, not something the iframe can create.

Policy decision:
- Keep a small, clear “RateNest” attribution inside the widget for identification and referral.
- Offer an optional, copy-ready caption link beneath the iframe, clearly disclosed in the snippet builder.
- Do not require keyword-rich anchor text, hidden links, forced follow links, or make SEO value part of the usage promise.
- If a publisher voluntarily links in its own page, count the public placement and link manually; do not infer ranking value from link existence.

A mandatory external caption may reduce adoption by high-trust publishers. Test whether publishers accept the widget on reader utility alone; do not optimise the terms around extracting links.

## 3. First publisher segment and first tool

First tool candidate: compact hourly-rate calculator. It is the cleanest entry point, matches a clear editorial use case, and avoids the larger UI surface of project fees, breakdowns and printing. It should reuse the existing pure calculation module; no forked formula.

Prioritise publisher types in this order:
1. Freelance education and training resources explaining how to set hourly/day rates.
2. Design, development and creative-industry resource sites serving independent professionals.
3. Small-agency and consultant guides about billable capacity and sustainable pricing.
4. Coworking, independent-work and professional communities with practical resource libraries.

Do not begin by chasing the largest general publishers. Their trust, review and integration thresholds are higher; a specialist publisher with a directly relevant article is a better first validation partner. “Large publisher” is a later scale target after the widget demonstrates reliability and repeatable value.

## 4. What makes the self-serve embed worth installing

The publisher should be able to understand and test the tool before copying it:
- A public embed landing page with a live preview and a short explanation of the exact reader use case.
- One copyable iframe snippet, with a fixed-height responsive fallback and no host-side JavaScript.
- Visible attribution inside the widget, plus an optional plain caption/link for the host page.
- Clear privacy wording: calculation inputs stay in the browser, but loading the hosted frame still sends ordinary connection metadata to the hosting provider.
- Compatibility notes for WordPress, Ghost, Webflow, Wix, Squarespace and custom HTML, only where tested.
- A clear “open full calculator” fallback.
- No signup, API key, cookies, analytics, tracking, data capture, query-string prefills or external scripts.

Do not add custom themes, multiple calculators, automatic resizing, postMessage, APIs or developer SDKs to the first prototype. These are expansion ideas only if actual publishers ask for them.

## 5. Risks and limits

- No guaranteed SEO gain: the widget alone does not create a host-page backlink.
- Trust barrier: unknown brands and unproven uptime may deter large publishers. Do not claim an SLA or adoption record.
- Integration friction: CMSs may block iframes or constrain HTML; fixed height can create internal scrolling if poorly sized.
- Privacy nuance: no calculation values leave the browser, but the host visitor's IP/user-agent/referrer metadata is sent when the frame loads.
- Brand risk: an inaccurate or visually weak embedded tool appears inside another publisher's article. Formula parity, accessibility and mobile QA are release blockers.
- Framing risk: existing pages currently lack a deliberate frame policy; follow Claude's deny-by-default recommendation and verify the /embed/* exception on a Cloudflare preview before shipping a widget.
- Discovery is not automatic: a public embed page and copy snippet reduce adoption friction, but do not guarantee publishers will find or install it. Do not imply “passive virality.”

## 6. Go/no-go sequence

1. GO: Claude's feasibility review is complete (PR #78 merged). The hourly-rate tool is technically feasible if it imports the existing pure calculation module.
2. NEXT — Claude: implement a small, isolated security-headers PR: deny framing for normal pages and allow only the future /embed/* route, following the documented Cloudflare Pages header-detach behavior. Verify the actual headers on a preview deployment for both an ordinary page (must refuse framing) and a test embed route (must permit framing). Do not add the embed page in this security PR.
3. THEN — ChatGPT: review the security diff and evidence; finalise the publisher-facing copy, attribution wording and prototype acceptance list.
4. THEN — Claude: build one hourly-rate prototype with shared calculation logic, fixed height, no postMessage, no query parameters, parity/privacy/mobile/keyboard checks, noindex/canonical hygiene, and a working fallback link.
5. BEFORE PUBLIC INVITATION: both partners review the full implementation and preview evidence. Public rollout remains blocked until the value and technical acceptance criteria pass.

If the frame-header exception cannot be proven on Cloudflare, stop the embed path and use shareable/printable outputs instead.

## 7. Measurement without tracking

Initial measurement is manual and privacy-preserving:
- Count verified public publisher placements.
- Record each host URL, page topic, date checked, whether the iframe works on mobile, and whether the publisher independently added a host-page link.
- Record publicly visible referral/citation examples only when directly observed.
- Do not infer clicks, users, conversions, backlinks or ranking lift without evidence.
- No analytics or visitor tracking without the owner's separate approval.

## 8. Public evidence reviewed on 2026-11-02

- BuildersCalcs embed page: https://builderscalcs.com/embed/
- Reuven Engineering Tools: https://reuven.tools/embed/
- FarBetterOff embed docs: https://farbetteroff.com/embed-docs
- Rule Calculator partners: https://rulecalculators.com/partners
- CalculatorAI embed docs: https://calculatoraiapp.github.io/docs/docs/embed-widget.html
- WattSimple widgets: https://www.wattsimple.com/embed

Evidence limitation: these are provider-authored public descriptions. They do not independently establish actual embed counts, large-publisher adoption, backlink effects, search demand or revenue.
