# RateNest embed distribution — initial feasibility research (historical note)

- **Research date:** 2026-11-02
- **Owner:** ChatGPT (product/search/distribution research)
- **Status:** Initial research snapshot. The active publisher-fit and security gate is maintained in docs/embed-publisher-target-research-2026-11-02.md; follow that newer file for current sequencing. No embed code or production change is approved by this historical note.
- **Primary site:** https://ratenest.pages.dev/
- **Related programme:** `docs/RATENEST-MASTER-GROWTH-PROGRAM-2026-11-02.md`

## 1. Visitor and publisher problem

A relevant publisher (freelance education blog, design/development resource, small-agency guide, business training site or professional community) may want to give readers an interactive pricing calculator inside an article rather than send them away to a generic calculator or maintain their own calculation logic.

The reader wants to calculate a rate or quote in context. The publisher wants a small, reliable, mobile-friendly widget that is easy to add and does not require maintaining formulas. RateNest could provide the hosted calculator and a visible route to the full explanation and tool.

This is a plausible use case, not proof of publisher demand. No outreach, survey, click, embed-use or conversion data has been collected.

## 2. Public examples reviewed

The following public pages explicitly describe calculator embeds. They establish common implementation and distribution patterns, not that RateNest should copy their terms or that embeds automatically generate valuable SEO links.

| Example | Publicly described pattern | Useful lesson / limitation |
|---|---|---|
| CalculatorAI | iframe URL per calculator; one-line HTML; optional language/currency/theme; auto-resize helper; visible attribution; full-site features excluded from embed. | Clear embed product contract and separation between widget and full tool. Fixed-height fallback remains important for CMSs that strip scripts. |
| DecisionsCalc | standalone widgets, optional auto-sizing, visible “Powered by” attribution, commercial use allowed. | Keep the first integration simple and explain attribution terms. |
| CalcHub | widget catalogue, copyable snippets, WordPress/Blogger/Wix/Squarespace guidance, auto-height. | Provide copy-ready code and CMS instructions only after the widget is stable. |
| ProjectCalc | width/theme/accent/compact options, live preview, lazy-loaded iframe, attribution. | Customisation is useful, but should not expand MVP scope before the base experience works. |
| calculate.at | manual approval workflow, hosted iframe, auto-height, visible link, genuine on-topic use. | An approval process is an alternative if abuse/security cannot be controlled with open self-serve embedding. |

Sources accessed 2026-11-02:
- https://calculatoraiapp.github.io/docs/docs/embed-widget.html
- https://decisioncalc.pages.dev/widgets/
- https://calculators.credit/widgets/
- https://projectcalc.io/embed
- https://calculate.at/embed-calculators/

## 3. RateNest advantage worth testing

RateNest's potential distinction is not “another generic calculator widget.” It can offer a focused, connected pricing workflow:
- hourly/day-rate foundation;
- fixed-project estimate with optional hours breakdown and actual-hours reflection;
- retainer pricing and actual-use/break-even interpretation;
- transparent assumptions and formula explanations;
- browser-side calculations without a RateNest account.

An embedded widget could serve the reader in the publisher's article, while an optional clearly labelled link opens the full RateNest page for the explanation, related calculators and client-ready output. The widget must remain useful on its own; attribution must not be disguised as a promise of backlinks or rankings.

## 4. Candidate first embed and publisher fit

**Candidate to assess first:** a compact hourly-rate calculator, because it is the broadest entry point and the input/result flow is self-contained. This is a hypothesis; Claude must confirm that the current page architecture can isolate the calculator without duplicating or breaking the canonical page.

Potential relevant placements:
- “How to set your freelance rate” educational articles.
- Freelance design/development communities and training resources.
- Small-agency resource pages explaining billable capacity.
- Career or independent-work guides.

Do not target unrelated websites or generic embed directories. Relevance and usefulness to the host page are essential.

## 5. MVP contract to evaluate (not yet approved for coding)

A safe first version should be intentionally narrow:
1. A separate, stripped-down hosted embed page for one existing calculator, not a screenshot and not a copy of the full site navigation.
2. Responsive width and a robust fixed-height fallback. Automatic resizing is optional and must be tested across origins/CMSs before adoption.
3. The same calculation logic as the full tool; no forked formulas or independent defaults.
4. All calculation inputs remain inside the visitor's browser. Do not put values in URL query strings, send them to a backend, or pass them to the parent page.
5. A visible, honest attribution link to the relevant full RateNest tool. No keyword-stuffed anchor text, hidden links, forced backlinks, or claims that embedding guarantees SEO value.
6. Lazy loading and accessible title/labels; keyboard operation and mobile layout.
7. A clear usage/attribution policy and contact/issue path before inviting public use.
8. No account, API key, tracking pixel, cookies, analytics, email capture or external paid dependency.
9. No arbitrary host-provided HTML, CSS or script execution. Any theme/customisation must use validated allowlisted values only.
10. A clear failure state and a direct link to open the calculator if iframe embedding is blocked.

## 6. Security, privacy and technical questions for Claude

Before implementation, review:
- Whether the current static Pages setup can safely serve a distinct embed route without changing canonical/indexing behavior of the full calculator.
- CSP `frame-ancestors` and any `X-Frame-Options` behavior; ensure framing is deliberately permitted only for the embed document, not automatically for the entire site.
- iframe sandbox permissions; grant only what the calculator actually needs.
- Cross-origin `postMessage` only if auto-resize is needed: validate `event.origin`, `event.source`, message type, dimensions and rate; never trust arbitrary message content.
- Whether a fixed-height MVP is safer than a resize script.
- Referrer policy, lazy loading, title, accessibility, responsive behavior and no horizontal overflow.
- CDN request metadata and a plain-language privacy statement. Client-side calculation does not mean the hosting provider receives no connection metadata.
- Avoid query-string storage of values, cross-origin data transfer, third-party scripts, cookies, local persistence and analytics.
- Tests for mobile widths, keyboard, invalid inputs, calculation parity with the full page, blocked iframe behavior, and permitted embedding from an unrelated test origin.

Claude's first response should be a feasibility recommendation and threat/compatibility checklist, not code. Do not begin implementation until the value note and technical approach are reviewed.

## 7. Acceptance and measurement before public rollout

A prototype is not ready to invite publishers until:
- Full-page and embed calculations are exactly equivalent for the same inputs.
- No entered values are sent to RateNest servers, query strings, host page or third parties.
- Embed works in a narrow mobile column and desktop layout without inner scrollbars or clipping (or the fixed-height limitation is clearly documented).
- Keyboard and assistive-technology checks are completed.
- The attribution and usage policy is visible and accurate.
- Security headers and iframe permissions are tested from an unrelated origin.
- A user can leave the embed and open the full tool without losing the ability to understand the result.

After launch, count only verified public placements and genuine referring pages. Do not claim that a visible attribution link automatically passes ranking value. If aggregate usage measurement would require analytics or tracking, obtain owner approval first; initial measurement can be manual placement/referral review without tracking visitors.

## 8. Decision

Proceed to a technical feasibility review by Claude and a further value review by ChatGPT. Do not code yet. If the first calculator cannot be embedded without compromising privacy, accessibility, formula parity or the existing static architecture, keep the idea on hold or choose a safer alternative (copy/share link or printable result).


## Update 2026-11-03

The publisher shortlist and current security sequence are maintained in docs/embed-publisher-target-research-2026-11-02.md. PR #81 merged deny-by-default framing headers for all pages. Verify Cloudflare's actual response headers before creating an embed route; then add the route and its narrow exception together in one PR. This initial note remains as the original competitor/technical research record, not the current execution checklist.
