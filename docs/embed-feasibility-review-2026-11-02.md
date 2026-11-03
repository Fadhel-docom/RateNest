# Embeddable calculator — technical feasibility and security review

- **Date:** 2026-11-02
- **Reviewer:** Claude (feasibility, security, testing). Value, publisher fit and distribution remain ChatGPT's gate.
- **Reviews:** `docs/EMBED-CALCULATOR-RESEARCH-2026-11-02.md` (ChatGPT's research note; PR #76 at the time of writing).
- **Status (updated 2026-11-03):** PR #81 has merged deny-by-default framing headers for every page. No embed route or framing exception exists. Live Cloudflare response headers remain unverified; no embed code or snippet is approved yet.
- **Evidence base:** the original technical review was based on `main` after PR #75. Updated against current `main` after PR #81 and the publisher-fit/value note in `docs/embed-publisher-target-research-2026-11-02.md`. Not verified: live Cloudflare response headers on the current preview or production domain.

## 1. Verdict

**Feasible for one calculator; conditional GO for a narrow pilot, but not ready to code until the live-header gate passes.** The calculation modules are DOM-free, so formula parity is achievable by importing the same modules. The risks are framing policy, indexing of a second URL for the same tool, and the honest value of attribution. ChatGPT's publisher/value review is now recorded in `docs/embed-publisher-target-research-2026-11-02.md`; it supports one limited pilot, not mass distribution or SEO promises. PR #81 has already added deny-by-default headers; first verify Cloudflare actually serves them, then implement the dedicated route and exact exception together.

## 2. What the current setup makes easy or hard

| Fact (from the repo) | Consequence for an embed |
|---|---|
| `calculator.mjs`, `project-pricing-calculator.mjs`, `retainer-pricing-calculator.mjs` contain no `document` access. | An embed page can import the exact same logic: no forked formulas. Parity can be tested in Node and in Chromium. |
| UI wiring (`app.mjs` etc.) is bound to the full page's element ids, formula steps, adjustments and copy buttons. | A compact embed needs its own small wiring file. That is a second UI over the same logic, so a parity test (same inputs, same outputs) is mandatory. Do not try to reuse `app.mjs` with the full page's DOM. |
| `_headers` now applies `Content-Security-Policy: frame-ancestors 'none'` and `X-Frame-Options: DENY` to `/*` (PR #81). | All pages are denied framing by default. This is the correct current policy; the actual Cloudflare response still needs live verification. A future embed must use only a narrow, route-specific exception. |
| The comment in `_headers` says Cloudflare Pages serves the repository root. | `docs/`, `tools/`, `scripts/` are publicly fetchable (noindexed, not secret). Operations-room notes are therefore public. This is existing behaviour, unrelated to embedding, but the owner should know it. Nothing sensitive belongs in those files. |
| `.github/workflows/pages.yml` stages an explicit file list; `scripts/check-site.mjs` guards that list. | Any new public embed file must be added to both or the GitHub Pages backup will not carry it. Cloudflare serves the whole root, so it would be live there regardless. |
| `robots.txt` allows everything; `sitemap.xml` lists four canonical pages. | An embed URL would be crawlable. It must carry its own `noindex` and stay out of the sitemap. |

## 3. Recommendations (in order of importance)

1. **One calculator first, and the hourly-rate calculator is a reasonable choice** (self-contained inputs, no print/fee/breakdown surface). Build it as a separate stripped-down page under `/embed/` (no site navigation, no FAQ, no copy button), importing `calculator.mjs` unchanged. Do not add the project quote first: it now has more surface (hours breakdown, fees, print) and more places for divergence.
2. **Verify the current deny policy before any embed page.** PR #81 already applies `Content-Security-Policy: frame-ancestors 'none'` and `X-Frame-Options: DENY` to `/*`. Verify both headers on a Cloudflare preview for an ordinary page. Only after that evidence, create `/embed/hourly` and its exact framing exception together in one PR; do not allow the whole `/embed/*` directory by default. Cloudflare's `_headers` merge/detach behavior must be proven on the preview before it is relied on. The GitHub Pages backup cannot send custom headers and must not be used as an embed source.
3. **Fixed-height MVP, no `postMessage`.** A resize script adds a cross-origin message channel for a cosmetic gain. Use responsive width, a generous fixed height, and a plain "Open the full calculator" link as the failure state. If auto-resize is ever added: the host-side script must check `event.origin === "https://ratenest.pages.dev"`, `event.source === iframe.contentWindow`, an allowlisted message type, a numeric height clamped to a sane range, and a rate limit; the embed must send only a height, never any entered value.
4. **No parameters in the MVP.** No theme, currency or prefill query string. Each parameter is an input the host controls, and entered values must never be placed in a URL. If customisation is added later, accept allowlisted enumerated values only and ignore everything else.
5. **Indexing hygiene.** The embed page gets `<meta name="robots" content="noindex">`, an `X-Robots-Tag: noindex` header rule for `/embed/*`, a `rel="canonical"` to the full calculator, and no sitemap entry. Do **not** block `/embed/` in `robots.txt`: a blocked URL cannot be crawled, so its noindex would never be seen.
6. **Iframe attributes in the published snippet:** `loading="lazy"`, a descriptive `title`, `referrerpolicy="origin"` (the host's origin reaches RateNest, not its full URL path; this also allows the manual placement counting the research note proposes without tracking), and a `sandbox` that grants only what is needed. Sandbox and module scripts interact (a sandboxed frame without `allow-same-origin` has an opaque origin, so its module scripts need CORS-enabled responses), so test the exact attribute combination from an unrelated origin; do not assume.
7. **Privacy wording.** "Calculations stay in your browser" is true for the entered values, but the host's visitors still send request metadata (IP address, user agent, referrer origin) to Cloudflare when the frame loads. The usage page must say so in one plain sentence. No cookies, no local persistence, no third-party scripts, no analytics.

## 4. Threat and compatibility checklist (to run against a prototype)

| Check | How |
|---|---|
| Framing allowed only for `/embed/hourly` | On Cloudflare preview, verify an ordinary page is refused in an iframe and `/embed/hourly` renders from a separate origin. Also verify both response headers on an ordinary page and that the exception does not leak to sibling paths. Local emulation is not proof of CDN behavior. |
| Parity | Same inputs, same outputs as the full page: Node unit test on the shared module plus a Chromium test that fills both pages with identical inputs across normal, boundary and invalid cases. |
| No value leaves the browser | Chromium network log during use: only document and static asset requests; no request carries entered values; URL never changes. |
| Mobile and keyboard | 320 and 375 px, 200% text, no inner scrollbar or clipping at the fixed height, tab order, visible focus, visible labels and errors; the existing contrast/name/overflow measurements extended to the embed page. |
| Blocked-iframe behaviour | Fallback link visible and working when the frame is refused. |
| Indexing | Page has `noindex` and a canonical; absent from `sitemap.xml`; not disallowed in `robots.txt`. |
| Snippet safety | Snippet contains no script by default, no inline handlers, no user-supplied HTML. |
| Deployment guard | `check-site.mjs` fails if an embed file is missing from the Pages staging list or if the embed page lacks `noindex`/canonical. |

## 5. Question for ChatGPT's value gate

An attribution link **inside** the iframe is part of RateNest's own document. It does not appear in the host page's HTML, so it gives the host page no outbound link and gives RateNest no backlink from it. Whatever benefit an embed has therefore comes from referral visits and brand exposure, or from a plain link the publisher chooses to place in their own page text (the snippet can offer one as optional text beneath the frame). Please evaluate the value of the idea on that basis and keep any claim about search benefit out of the usage terms.

## 6. Sequencing proposal

1. Value gate (ChatGPT): completed as a conditional GO for one limited hourly pilot; see `docs/embed-publisher-target-research-2026-11-02.md`.
2. Security baseline (Claude, PR #81): merged deny-by-default headers for all pages. The live Cloudflare response has not yet been verified.
3. Required next check: verify both deny headers on a Cloudflare preview for an ordinary page. Do not write an embed exception until this succeeds.
4. Prototype PR: create `/embed/hourly` and its narrowly scoped framing exception together; include formula parity, privacy, keyboard/accessibility, mobile, indexing and deployment guards. No public invitation until all acceptance checks pass.
5. Manual placement review only; no analytics without owner approval.

If the live deny headers cannot be verified, keep the embed idea on hold: share links and the printable quote output (already shipped) provide lower-risk distribution.
