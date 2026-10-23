# RateNest

**Price smarter. Work better.**

Free pricing tools for freelancers.

## First tool: Freelance Hourly Rate Calculator

Estimate a sustainable hourly rate from your target annual take-home income, annual business expenses, unpaid time off, weekly working hours, and the share of time spent on billable work.

- No framework or runtime dependencies
- Responsive, accessible static website
- Calculations run locally in your browser
- Unit tests using Node's built-in test runner
- GitHub Actions checks on pushes, pull requests, and a daily schedule

## Run locally

Open `index.html` directly in a browser, or serve the repository with any static web server.

## Run tests

Requires Node.js 20 or newer:

```sh
node --test
```

## Deployment

The site is designed for static hosting such as GitHub Pages. Configure Pages in repository settings to use GitHub Actions once the deployment workflow is enabled.

## Privacy

Calculator inputs are processed in the browser and are not sent to a server.
