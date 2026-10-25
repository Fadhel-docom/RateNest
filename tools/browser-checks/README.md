# Local browser checks (not part of CI, not published)

Real-browser checks used to verify the site. They need Python 3 with Playwright and a Chromium
(`pip install playwright` + an installed Chromium). Each script starts its own local web server:

```sh
python3 -I tools/browser-checks/behaviour.py          . 8801   # 42 checks: widths, validation, currency, copy, keyboard, no-JS
python3 -I tools/browser-checks/review-regression.py  . 8802   # 6 checks from PR #1 review comments
python3 -I tools/browser-checks/phase2-ui.py          . 8803   # 13 checks: fee/buffer inputs, errors, adjusted result, copy
python3 -I tools/browser-checks/project-pricing.py     . 8805   # 29 checks: Phase 3 project quote page (needs PR #13 code)
python3 -I tools/browser-checks/a11y-measurements.py  . 8804   # contrast, names, headings, focus rings, zoom reflow (NOT axe-core)
```

Arguments: repository path, then a free port. Each prints PASS/FAIL lines and a total. They assert the current
default numbers ($57.29/hr for 60,000 + 6,000 at 40 h × 48 weeks × 60%), so update them if the defaults change.
`a11y-measurements.py` is a set of custom measurements, not an axe-core or Lighthouse audit.
