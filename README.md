# RateNest

**Price smarter. Work better.**

Free pricing tools for freelancers.

## First tool: Freelance Hourly Rate Calculator

Estimate a sustainable hourly rate from your target annual income (before personal income tax), annual business expenses, unpaid time off, weekly working hours, and the share of time spent on billable work.

```text
required annual revenue = target annual income + annual business expenses
billable hours per year = weekly hours × (52 − weeks off) × billable share
suggested hourly rate   = required annual revenue ÷ billable hours per year
```

This is a planning estimate. It does not calculate personal income tax, platform or payment fees, or a profit buffer.

- No framework or runtime dependencies
- Responsive, accessible static website
- Calculations run locally in your browser
- Unit tests using Node's built-in test runner
- Static site checks (`scripts/check-site.mjs`) that also confirm the no-JavaScript default numbers match the calculator
- GitHub Actions checks on pushes, pull requests, and a daily schedule

## Run locally

The page uses an ES module (`app.mjs`), which browsers block when `index.html` is opened directly from disk (`file://`). Serve the folder over HTTP instead:

```sh
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Run tests

Requires Node.js 20 or newer (CI uses Node 22):

```sh
node --test
node scripts/check-site.mjs
```

## Deployment

The site is deployed to GitHub Pages by `.github/workflows/pages.yml`. One-time setup by the repository owner: open **Settings → Pages**, and under **Build and deployment → Source** choose **GitHub Actions**. Then re-run the workflow (Actions → Deploy RateNest to GitHub Pages → Run workflow). Only the site files listed in the workflow's staging step are published.

## Privacy

Calculator inputs are processed in the browser and are not sent to a server.
