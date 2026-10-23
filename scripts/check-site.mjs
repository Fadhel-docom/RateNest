// Dependency-free static checks for the site. Run with: node scripts/check-site.mjs
// These are regex-based sanity checks, not a full HTML validator or accessibility audit.
import { readFileSync, existsSync } from "node:fs";
import { calculateHourlyRate, billableScenarios, formatCurrency, formatNumber } from "../calculator.mjs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const failures = [];
const check = (label, condition) => {
  console.log(`${condition ? "OK  " : "FAIL"}: ${label}`);
  if (!condition) failures.push(label);
};

const title = /<title>([^<]*)<\/title>/i.exec(html)?.[1] ?? "";
const description = /<meta name="description" content="([^"]*)"/i.exec(html)?.[1] ?? "";
const canonical = /<link rel="canonical" href="([^"]*)"/i.exec(html)?.[1] ?? "";

check("html lang attribute", /<html[^>]*\slang="en"/i.test(html));
check("viewport meta", /name="viewport"/i.test(html));
check("title is present and 10-70 chars", title.length >= 10 && title.length <= 70);
check("meta description is 70-170 chars", description.length >= 70 && description.length <= 170);
check("canonical is an absolute https URL", /^https:\/\/[^/]+\/.*/.test(canonical));
check("exactly one h1", (html.match(/<h1[\s>]/gi) ?? []).length === 1);
check("calculator form exists", /<form[^>]*id="rate-form"/i.test(html));

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
check("element ids are unique", new Set(ids).size === ids.length);

const referenced = [...html.matchAll(/aria-(?:describedby|labelledby)="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
check("aria references point at existing ids", referenced.every((id) => ids.includes(id)));

const controlIds = [...html.matchAll(/<(?:input|select)[^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
check("every input/select has a matching label", controlIds.every((id) => new RegExp(`<label[^>]*for="${id}"`).test(html)));

const localRefs = [...html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)].map((m) => m[1]);
check("local src/href files exist", localRefs.every((ref) => existsSync(new URL(`../${ref.slice(2)}`, import.meta.url))));
check("no external scripts or stylesheets", ![...html.matchAll(/<(?:script|link)[^>]*(?:src|href)="(https?:)?\/\/[^"]*"/gi)].some((m) => !/rel="canonical"/i.test(m[0])));

let jsonLdOk = true;
for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
  try { JSON.parse(match[1]); } catch { jsonLdOk = false; }
}
check("JSON-LD parses as JSON", jsonLdOk);

// The static (no-JavaScript) default numbers must match the calculator's real output.
const defaults = { income: 60000, expenses: 6000, hoursPerWeek: 40, weeksOff: 4, billablePercent: 60 };
const result = calculateHourlyRate(defaults);
const rate = formatCurrency(result.hourlyRate, "USD", "en-US");
check(`static default rate shows ${rate}`, new RegExp(`id="rate-result"[^>]*>${rate.replace("$", "\\$")}<`).test(html));
check(`static annual total shows ${formatCurrency(result.annualRequired, "USD", "en-US", { compact: true })}`,
  html.includes(`id="annual-total">${formatCurrency(result.annualRequired, "USD", "en-US", { compact: true })}<`));
check(`static billable hours show ${formatNumber(result.billableHours, "en-US")} hrs`,
  html.includes(`id="billable-hours">${formatNumber(result.billableHours, "en-US")} hrs<`));
check("static scenario table matches calculator output", billableScenarios(defaults).every((row) =>
  html.includes(`<th scope="row">${row.billablePercent}% billable</th><td>${formatNumber(row.billableHours, "en-US")} hrs</td><td>${formatCurrency(row.hourlyRate, "USD", "en-US")}/hr</td>`)));

check("sitemap.xml exists and lists the canonical URL", existsSync(new URL("../sitemap.xml", import.meta.url)) &&
  readFileSync(new URL("../sitemap.xml", import.meta.url), "utf8").includes(`<loc>${canonical}</loc>`));

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll site checks passed.");
