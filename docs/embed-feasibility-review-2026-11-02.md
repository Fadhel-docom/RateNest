# Embeddable calculator — technical feasibility and security review

- **Date:** 2026-11-02
- **Reviewer:** Claude (feasibility, security, testing). Value, publisher fit and distribution remain ChatGPT's gate.
- **Reviews:** `docs/EMBED-CALCULATOR-RESEARCH-2026-11-02.md` (ChatGPT's research note; PR #76 at the time of writing).
- **Status:** Recommendation and checklist only. **No embed code, route, header or snippet is approved or written by this review.**
- **Evidence base:** the repository as of `main` after PR #75 (files read: `_headers`, `robots.txt`, `calculator.mjs`, `app.mjs`, the other two calculators, `.github/workflows/pages.yml`, `scripts/check-site.mjs`). Not verified: the live domain and Cloudflare's response headers (the shell and fetch tools cannot reach `ratenest.pages.dev` from these sessions).

## 1. Verdict

**Feasible for one calculator, with conditions; not ready to code.** The calculation modules are DOM-free, so formula parity is achievable by importing the same modules. The risks are in what surrounds the widget: framing policy, indexing of a second URL for the same tool, and the honest value of the attribution link. Proceed to a prototype only after ChatGPT's value gate answers the question in section 5 (backlink value), and after a small security-headers change is reviewed on a Cloudflare preview.

## 2. What the current setup makes easy or hard

| Fact (from the repo) | Consequence for an embed |
|---|---|
| `calculator.mjs`, `project-pricing-calculator.mjs`, `retainer-pricing-calculator.mjs` contain no `document` access. | An embed page can import the exact same logic: no forked formulas. Parity can be tested in Node and in Chromium. |
| UI wiring (`app.mjs` etc.) is bound to the full page's element ids, formula steps, adjustments and copy buttons. | A compact embed needs its own small wiring file. That is a second UI over the same logic, so a parity test (same inputs, same outputs) is mandatory. Do not try to reuse `app.mjs` with the full page's DOM. |
| `_headers` exists and only sets `X-Robots-Tag: noindex, nofollow` for `/docs/*`, `/scripts/*`, `/tools/*`, `/.github/*`, `CLAUDE.md`, `README.md`, `*.test.mjs`. It sets **no** `Content-Security-Policy` and **no** `X-Frame-Options`. | Today every page, not just a future embed page, can be framed by any site. An embed route must not widen that by accident; the policy should become deny-by-default with one deliberate exception. |
| The comment in `_headers` says Cloudflare Pages serves the repository root. | `docs/`, `tools/`, `scripts/` are publicly fetchable (noindexed, not secret). Operations-room notes are therefore public. This is existing behaviour, unrelated to embedding, but the owner should know it. Nothing sensitive belongs in those files. |
| `.github/workflows/pages.yml` stages an explicit file list; `scripts/check-site.mjs` guards that list. | Any new public embed file must be added to both or the GitHub Pages backup will not carry it. Cloudflare serves the whole root, so it would be live there regardless. |
| `robots.txt` allows everything; `sitemap.xml` lists four canonical pages. | An embed URL would be crawlable. It must carry its own `noindex` and stay out of the sitemap. |

## 3. Recommendations (in order of importance)

1. **One calculator first, and the hourly-rate calculator is a reasonable choice** (self-contained inputs, no print/fee/breakdown surface). Build it as a separate stripped-down page under `/embed/` (no site navigation, no FAQ, no copy button), importing `calculator.mjs` unchanged. Do not add the project quote first: it now has more surface (hours breakdown, fees, print) and more places for divergence.
2. **Framing policy before any embed page.** Make framing deny-by-default in `_headers` (`Content-Security-Policy: frame-ancestors 'none'` and `X-Frame-Options: DENY` on `/*`) and allow it only for `/embed/*`. Cloudflare's `_headers` merges matching rules, so the exception has to detach the inherited header (Cloudflare documents a `! Header-Name` detach syntax); **this must be confirmed on a preview deployment before it is relied on**, because a mistake either leaves the whole site frameable or breaks the embed. The GitHub Pages backup cannot send custom headers, so it stays frameable; it is a non-canonical backup and should not be used as an embed source.
3. **Fixed-height MVP, no `postMessage`.** A resize script adds a cross-origin message channel for a cosmetic gain. Use responsive width, a generous fixed height, and a plain "Open the full calculator" link as the failure state. If auto-resize is ever added: the host-side script must check `event.origin === "https://ratenest.pages.dev"`, `event.source === iframe.contentWindow`, an allowlisted message type, a numeric height clamped to a sane range, and a rate limit; the embed must send only a height, never any entered value.
4. **No parameters in the MVP.** No theme, currency or prefill query string. Each parameter is an input the host controls, and entered values must never be placed in a URL. If customisation is added later, accept allowlisted enumerated values only and ignore everything else.
5. **Indexing hygiene.** The embed page gets `<meta name="robots" content="noindex">`, an `X-Robots-Tag: noindex` header rule for `/embed/*`, a `rel="canonical"` to the full calculator, and no sitemap entry. Do **not** block `/embed/` in `robots.txt`: a blocked URL cannot be crawled, so its noindex would never be seen.
6. **Iframe attributes in the published snippet:** `loading="lazy"`, a descriptive `title`, `referrerpolicy="origin"` (the host's origin reaches RateNest, not its full URL path; this also allows the manual placement counting the research note proposes without tracking), and a `sandbox` that grants only what is needed. Sandbox and module scripts interact (a sandboxed frame without `allow-same-origin` has an opaque origin, so its module scripts need CORS-enabled responses), so test the exact attribute combination from an unrelated origin; do not assume.
7. **Privacy wording.** "Calculations stay in your browser" is true for the entered values, but the host's visitors still send request metadata (IP address, user agent, referrer origin) to Cloudflare when the frame loads. The usage page must say so in one plain sentence. No cookies, no local persistence, no third-party scripts, no analytics.

## 4. Threat and compatibility checklist (to run against a prototype)

| Check | How |
|---|---|
| Framing allowed only for `/embed/*` | Serve a test page from a different origin containing an iframe of `/embed/…` (must render) and of `/index.html` (must be refused). The local `python3 -m http.server` ignores `_headers`, so use a small local server that applies `_headers`, and repeat on the Cloudflare preview URL. |
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

1. Value gate (ChatGPT): confirm that publishers have a reason to embed given section 5; decide the first placement types.
2. Small security PR (Claude): deny-by-default framing headers with the `/embed/*` exception, verified on a Cloudflare preview. This is useful on its own, since it also protects the existing pages from being framed.
3. Prototype PR (Claude): the hourly-rate embed page, parity and privacy tests, the `check-site.mjs` guards, and the usage/attribution page. No public invitation until the acceptance list in the research note (section 7) is met.
4. Manual placement review only; no analytics without owner approval.

If step 2's header exception cannot be verified, keep the idea on hold: a share link or the printable quote output (already shipped) gives similar reach with none of the framing risk.
