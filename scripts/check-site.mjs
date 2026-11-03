// Dependency-free static checks for the site. Run with: node scripts/check-site.mjs
// These are regex-based sanity checks, not a full HTML validator or accessibility audit.
import { readFileSync, existsSync } from "node:fs";
import { calculateHourlyRate, billableScenarios, rateEquivalents, formatCurrency, formatNumber } from "../calculator.mjs";
import { calculateProjectQuote, sumProjectTaskItems, MAX_PROJECT_TASKS } from "../project-pricing-calculator.mjs";
import { calculateRetainer } from "../retainer-pricing-calculator.mjs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const projectHtml = readFileSync(new URL("../project-pricing.html", import.meta.url), "utf8");
const projectCss = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const projectScript = readFileSync(new URL("../project-pricing.mjs", import.meta.url), "utf8");
const retainerHtml = readFileSync(new URL("../retainer-pricing.html", import.meta.url), "utf8");
const guideHtml = readFileSync(new URL("../how-to-price-a-freelance-project.html", import.meta.url), "utf8");
const robots = readFileSync(new URL("../robots.txt", import.meta.url), "utf8");
const measurementPath = new URL("../docs/measurement-protocol-2026-11-03.md", import.meta.url);
const measurementExists = existsSync(measurementPath);
const measurement = measurementExists ? readFileSync(measurementPath, "utf8") : "";
const failures = [];
const check = (label, condition) => {
  console.log(`${condition ? "OK  " : "FAIL"}: ${label}`);
  if (!condition) failures.push(label);
};

check("measurement protocol exists and distinguishes search visibility from actual tool use", measurementExists && measurement.includes("completed calculator use") && measurement.includes("actual-use totals are **unknown**"));
check("measurement protocol prohibits unapproved tracking and defines a fixed answer-engine prompt sample", measurement.includes("No analytics") && measurement.includes("Fixed prompt set") && measurement.includes("12. Which freelance pricing calculators"));

const title = /<title>([^<]*)<\/title>/i.exec(html)?.[1] ?? "";
const description = /<meta name="description" content="([^"]*)"/i.exec(html)?.[1] ?? "";
const canonical = /<link rel="canonical" href="([^"]*)"/i.exec(html)?.[1] ?? "";

check("html lang attribute", /<html[^>]*\slang="en"/i.test(html));
check("viewport meta", /name="viewport"/i.test(html));
check("title is present and 10-70 chars", title.length >= 10 && title.length <= 70);
check("meta description is 70-170 chars", description.length >= 70 && description.length <= 170);
check("canonical is the selected Cloudflare Pages homepage", canonical === "https://ratenest.pages.dev/");
check("homepage Open Graph URL matches canonical", html.includes(`<meta property="og:url" content="${canonical}">`));
check("exactly one h1", (html.match(/<h1[\s>]/gi) ?? []).length === 1);
check("project quote page has a descriptive title", /<title>Freelance Project Quote Calculator — RateNest<\/title>/.test(projectHtml));
check("project quote page has the Cloudflare canonical URL", /<link rel="canonical" href="https:\/\/ratenest\.pages\.dev\/project-pricing">/.test(projectHtml));
check("project page Open Graph URL uses Cloudflare Pages", projectHtml.includes(`<meta property="og:url" content="https://ratenest.pages.dev/project-pricing">`));
check("project quote page has exactly one h1", (projectHtml.match(/<h1[\s>]/gi) ?? []).length === 1);
check("project quote page has a calculator form", /<form[^>]*id="project-form"/i.test(projectHtml));
check("project quote page has five optional labelled effort categories", ["planningHours", "productionHours", "meetingsHours", "revisionsHours", "managementHours"].every((id) => new RegExp(`<input id="${id}"[^>]*value=""`).test(projectHtml) && new RegExp(`<label[^>]*for="${id}"`).test(projectHtml)));
check("project hours breakdown has an explicit apply action", projectHtml.includes('id="apply-hours-breakdown"') && projectHtml.includes("Blank categories count as zero."));
check("project quote offers an optional custom task list with labelled name and hour fields", projectHtml.includes('id="task-estimate"') && projectHtml.includes('id="task-list"') && projectHtml.includes('class="task-name"') && projectHtml.includes('class="task-hours"') && projectHtml.includes("Each completed row needs both a task name and an hour estimate."));
check("custom task estimator has add, remove-capable rows and an explicit apply action", projectHtml.includes('id="add-task"') && projectHtml.includes('id="apply-task-estimate"') && projectHtml.includes('id="task-status"'));
check("custom task estimator is presented as an alternative to category breakdown, not an additive second total", projectHtml.includes("alternative to the five-category breakdown above") && projectHtml.includes("not an extra amount to add on top"));
const taskExample = sumProjectTaskItems([{ label: "Discovery call", hours: "0.5" }, { label: "Design homepage", hours: "4" }, { label: "Build checkout", hours: "3.25" }]);
check("custom task estimate sums a transparent worked example to 7.75 hours", taskExample.total === 7.75 && taskExample.items.length === 3);
check("custom task estimator enforces a 30-task limit and responsive mobile layout", MAX_PROJECT_TASKS === 30 && projectCss.includes(".task-estimate .task-row") && projectCss.includes("@media(max-width:520px)"));
check("task or category effort details are included in copied and printable quote summaries only when totals match", projectHtml.includes('id="print-effort-details"') && projectScript.includes("Estimated effort breakdown:") && projectScript.includes("effortSummaryLines(lastResult, values.estimatedHours)") && projectCss.includes("#print-effort-details{white-space:pre-line"));


check("project quote has a print/save PDF action and a print-only document heading", projectHtml.includes('id="print-quote"') && projectHtml.includes('id="print-project-title"') && projectHtml.includes("Print / Save quote as PDF"));
check("project quote print sheet explains scope and excluded taxes/fees", projectHtml.includes("This estimate is not a contract or invoice.") && projectHtml.includes("payment schedule"));
check("actual-hours analysis is marked internal and excluded from print", projectHtml.includes('class="result-stat internal-stat"><span>Effective hourly rate at actual hours') && projectCss.includes(".internal-stat,#actual-hours-note,.result-tip{display:none!important}"));
check("freelancer-facing effective rate and planning tip are excluded from the client print sheet", projectHtml.includes('class="result-stat internal-stat"><span>Effective hourly rate at estimated hours') && projectCss.includes(".result-tip{display:none!important}"));
check("payout fee inputs default to blank (no built-in fee rate, no provider preset)", /<input id="feePercent"[^>]*\svalue=""/.test(projectHtml) && /<input id="fixedFee"[^>]*\svalue=""/.test(projectHtml) && ["feePercent", "fixedFee"].every((id) => new RegExp(`<label[^>]*for="${id}"`).test(projectHtml)));
check("payout fee labels name the fee base and say the fixed fee is deducted once", projectHtml.includes("Percentage fee on the client-paid quote (%)") && projectHtml.includes("Fixed payout fee (deducted once)"));
check("project quote FAQ explains optional payout fees accurately and includes a verified worked example", projectHtml.includes("How do the optional payment and payout fees change my quote?") && projectHtml.includes("the entire amount the client pays") && projectHtml.includes("providers may calculate fees on a different base or in stages") && projectHtml.includes("$1,505.56") && projectHtml.includes("$150.56 plus $5, leaving $1,350.00") && projectHtml.includes("not profit or take-home pay") && projectHtml.includes("in the optional section above") && !projectHtml.includes("No automatic tax or fee is applied."));
check("payout fee result lines are hidden by default and the amount remaining is internal (not printed)", /id="pct-fee-line" hidden/.test(projectHtml) && /id="fixed-fee-line" hidden/.test(projectHtml) && /class="result-stat internal-stat" id="remaining-line" hidden/.test(projectHtml) && /id="fee-note" class="result-summary internal-stat" hidden/.test(projectHtml));
check("static default quote has no fee applied", calculateProjectQuote({ estimatedHours: 20, hourlyRate: 60, directExpenses: 150, bufferPercent: 0, feePercent: 0, fixedFee: 0 }).fees === null);
const headersFile = readFileSync(new URL("../_headers", import.meta.url), "utf8");
const catchAll = /^\/\*\s*\n((?:[ \t]+.*\n?)+)/m.exec(headersFile)?.[1] ?? "";
check("_headers denies framing on every page by default (frame-ancestors 'none' and X-Frame-Options DENY)", /Content-Security-Policy:\s*frame-ancestors 'none'\s*$/m.test(catchAll) && /X-Frame-Options:\s*DENY\s*$/m.test(catchAll));
check("_headers framing policy sets only frame-ancestors and has no embed exception without an embed page", !/Content-Security-Policy:[^\n]*(?:script-src|default-src|style-src)/i.test(headersFile) && !/\/embed\//.test(headersFile.replace(/^\s*#.*$/gm, "")));
check("_headers keeps noindex for internal paths", ["/docs/*", "/scripts/*", "/tools/*", "/.github/*"].every((p) => new RegExp(`^${p.replace(/[*.]/g, "\\$&")}\\s*\\n\\s+X-Robots-Tag: noindex, nofollow`, "m").test(headersFile)));
const projectIds = [...projectHtml.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
check("project quote page element ids are unique", new Set(projectIds).size === projectIds.length);
const projectAriaRefs = [...projectHtml.matchAll(/aria-(?:describedby|labelledby)="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
check("project quote page ARIA references exist", projectAriaRefs.every((id) => projectIds.includes(id)));
const projectControlIds = [...projectHtml.matchAll(/<(?:input|select)[^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
check("project quote page inputs/selects have labels", projectControlIds.every((id) => new RegExp(`<label[^>]*for="${id}"`).test(projectHtml)));
check("project quote page links to local assets that exist", [...projectHtml.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)].map((m) => m[1]).every((ref) => existsSync(new URL(`../${ref.slice(2)}`, import.meta.url))));
check("project quote page is linked from the homepage", html.includes('href="./project-pricing.html"'));
const projectDefault = calculateProjectQuote({ estimatedHours: 20, hourlyRate: 60, directExpenses: 150, bufferPercent: 0 });
check("static project quote default matches calculation", projectDefault.quote === 1350 && projectDefault.effectiveHourlyRate === 67.5 && projectHtml.includes('id="quote-total" class="rate-result">$1,350.00<'));
check("project quote buffer input defaults to 0 (percentages are entered by the user)", /<input id="bufferPercent"[^>]*\svalue="0"/.test(projectHtml));
const projectActualScenario = calculateProjectQuote({ estimatedHours: 20, hourlyRate: 60, directExpenses: 150, bufferPercent: 0, actualHours: 30 });
check("project actual-hours input is optional, blank by default, and linked to its error/help text", /<input id="actualHours"[^>]*\svalue=""/.test(projectHtml) && !/<input id="actualHours"[^>]*\srequired/.test(projectHtml) && projectHtml.includes('id="actual-effective-rate">—<') && projectHtml.includes('aria-describedby="actualHours-help actualHours-error"'));
check("static project actual-hours example output is not assumed", projectActualScenario.actualUsage.effectiveHourlyRate === 45 && projectActualScenario.actualUsage.overEstimate && projectActualScenario.quote === 1350);
check("project page explains the actual-hours rate and its expense limitation", projectHtml.includes("the unchanged fixed quote ÷ the hours you actually worked") && projectHtml.includes("includes direct expenses; it is not profit or take-home pay"));
check("Pages workflow stages all public pages and calculator modules", readFileSync(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8").includes("cp index.html project-pricing.html retainer-pricing.html how-to-price-a-freelance-project.html styles.css app.mjs calculator.mjs project-pricing.mjs project-pricing-calculator.mjs retainer-pricing.mjs retainer-pricing-calculator.mjs sitemap.xml robots.txt _site/"));

check("retainer page has a descriptive title", /<title>Freelance Retainer Calculator — RateNest<\/title>/.test(retainerHtml));
check("retainer page has the Cloudflare canonical and Open Graph URL", /<link rel="canonical" href="https:\/\/ratenest\.pages\.dev\/retainer-pricing">/.test(retainerHtml) && retainerHtml.includes('<meta property="og:url" content="https://ratenest.pages.dev/retainer-pricing">'));
check("retainer page has exactly one h1 and a calculator form", (retainerHtml.match(/<h1[\s>]/gi) ?? []).length === 1 && /<form[^>]*id="retainer-form"/i.test(retainerHtml));
const retainerIds = [...retainerHtml.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
check("retainer page element ids are unique", new Set(retainerIds).size === retainerIds.length);
check("retainer page ARIA references exist", [...retainerHtml.matchAll(/aria-(?:describedby|labelledby)="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)).every((id) => retainerIds.includes(id)));
check("retainer page inputs/selects have labels", [...retainerHtml.matchAll(/<(?:input|select)[^>]*\sid="([^"]+)"/g)].map((m) => m[1]).every((id) => new RegExp(`<label[^>]*for="${id}"`).test(retainerHtml)));
check("retainer page local assets exist", [...retainerHtml.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)].map((m) => m[1]).every((ref) => existsSync(new URL(`../${ref.slice(2)}`, import.meta.url))));
check("retainer page is linked from the homepage and the project page", html.includes('href="./retainer-pricing.html"') && projectHtml.includes('href="./retainer-pricing.html"'));
check("pricing guide has a descriptive title and extensionless canonical", /<title>How to Price a Freelance Project — RateNest<\/title>/.test(guideHtml) && /<link rel="canonical" href="https:\/\/ratenest\.pages\.dev\/how-to-price-a-freelance-project">/.test(guideHtml));
check("pricing guide has exactly one h1", (guideHtml.match(/<h1[\s>]/gi) ?? []).length === 1);
check("pricing guide local assets and internal links exist", [...guideHtml.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)].map((m) => m[1]).every((ref) => existsSync(new URL(`../${ref.slice(2)}`, import.meta.url))));
check("pricing guide is linked from the homepage and both calculators", html.includes('href="./how-to-price-a-freelance-project.html"') && projectHtml.includes('href="./how-to-price-a-freelance-project.html"') && retainerHtml.includes('href="./how-to-price-a-freelance-project.html"'));
check("pricing guide explains a concrete scope-change workflow and written approval before extra work", guideHtml.includes("What to do when the client asks for more") && guideHtml.includes("Pause the newly requested work") && guideHtml.includes("written approval") && guideHtml.includes("additional hours, direct costs, price, and schedule impact"));
check("pricing guide distinguishes new deliverables from included revisions with a practical example", guideHtml.includes("five-page website and two review rounds") && guideHtml.includes("a sixth landing page") && guideHtml.includes("not automatically a correction"));
check("pricing guide offers a discovery or time-boxed alternative when fixed scope cannot be estimated", guideHtml.includes("separately scoped discovery stage") && guideHtml.includes("time-boxed hourly phase"));
check("pricing guide links to relevant Upwork sources while qualifying platform-specific payment rules", guideHtml.includes("https://www.upwork.com/resources/how-to-estimate-fixed-price-projects") && guideHtml.includes("https://support.upwork.com/hc/en-us/articles/211068218-How-to-use-milestones-in-fixed-price-jobs") && guideHtml.includes("specific to Upwork’s platform") && guideHtml.includes("differ across services and direct contracts"));
const retainerDefault = calculateRetainer({ monthlyHours: 20, hourlyRate: 60, discountPercent: 0, months: 12 });
check("static retainer default matches calculation", retainerDefault.monthlyRetainer === 1200 && retainerDefault.effectiveHourlyRate === 60 && retainerDefault.contractValue === 14400 && retainerHtml.includes('id="retainer-total" class="rate-result">$1,200.00<') && retainerHtml.includes('id="contract-total">$14,400.00<') && retainerHtml.includes('id="effective-rate">$60.00/hr<'));
const retainerExample = calculateRetainer({ monthlyHours: 20, hourlyRate: 60, discountPercent: 10, months: 6, expectedHours: 15 });
check("retainer worked example matches calculator formulas and is explained on page", retainerExample.fullRateValue === 1200 && retainerExample.discountAmount === 120 && retainerExample.monthlyRetainer === 1080 && retainerExample.effectiveHourlyRate === 54 && retainerExample.usage.effectiveHourlyRate === 72 && retainerExample.breakEvenHours === 18 && retainerExample.contractValue === 6480 && retainerHtml.includes("Worked example: a 20-hour monthly retainer") && retainerHtml.includes("$1,080") && retainerHtml.includes("$72 per hour") && retainerHtml.includes("18 hours") && retainerHtml.includes("$6,480"));
check("retainer discount input defaults to 0 (percentages are entered by the user)", /<input id="discountPercent"[^>]*\svalue="0"/.test(retainerHtml));
check("retainer expected-hours input is optional and starts blank (no assumed usage)", /<input id="expectedHours"[^>]*\svalue=""/.test(retainerHtml) && !/<input id="expectedHours"[^>]*\srequired/.test(retainerHtml) && retainerHtml.includes('id="usage-rate">—<'));
check("retainer calculator returns no usage scenario by default", retainerDefault.usage === null);
check("retainer page has no external scripts or stylesheets", ![...retainerHtml.matchAll(/<(?:script|link)[^>]*(?:src|href)="(https?:)?\/\/[^"]*"/gi)].some((m) => !/rel="canonical"/i.test(m[0])));

check("calculator form exists", /<form[^>]*id="rate-form"/i.test(html));
const h1Html = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] ?? "";
check("h1 line breaks are preceded by a space (plain text reads correctly)", !/\S<br\s*\/?>/i.test(h1Html));

check("fee and buffer inputs default to 0 (no built-in fee rate)",
  /<input id="fee"[^>]*value="0"/.test(html) && /<input id="buffer"[^>]*value="0"/.test(html));
check("adjusted-result block is hidden by default", /<div id="adjusted-block"[^>]*\shidden/.test(html));

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
check("static scenario table matches billable and non-billable hours from calculator output", billableScenarios(defaults).every((row) =>
  html.includes(`<th scope="row">${row.billablePercent}% billable</th><td>${formatNumber(row.billableHours, "en-US")} hrs</td><td>${formatNumber(row.nonBillableHours, "en-US")} hrs</td><td>${formatCurrency(row.hourlyRate, "USD", "en-US")}/hr</td>`)));
check("homepage explains non-billable time separately from time off", html.includes("Non-billable hours = annual working hours − billable hours") && html.includes("Time off is already excluded through the weeks-off input."));
check("scenario table states that it shows the base rate before any fee or buffer", html.includes("shows the base rate before any fee or buffer you add"));
const dayRateSection = (html.match(/<section class="explainer" aria-labelledby="day-rate-heading">[\s\S]*?<\/section>/) || [""])[0];
check("static day-rate example (6 h and 8 h) matches calculator output",
  dayRateSection.includes(`base rate of ${rate} per hour`)
  && dayRateSection.includes(`is ${formatCurrency(result.hourlyRate * 6, "USD", "en-US")} (using the unrounded`)
  && dayRateSection.includes(`equivalent is ${formatCurrency(rateEquivalents(result.hourlyRate).dailyRate, "USD", "en-US")}.`));

const sitemap = existsSync(new URL("../sitemap.xml", import.meta.url)) ? readFileSync(new URL("../sitemap.xml", import.meta.url), "utf8") : "";
check("robots explicitly allows OAI-SearchBot for ChatGPT Search", /(?:^|\n)User-agent: OAI-SearchBot\s*\nAllow: \//.test(robots));
check("robots advertises the primary-host sitemap", robots.includes("Sitemap: https://ratenest.pages.dev/sitemap.xml"));
check("sitemap lists both selected canonical URLs", sitemap.includes(`<loc>${canonical}</loc>`) && sitemap.includes("<loc>https://ratenest.pages.dev/project-pricing</loc>"));
check("canonical, Open Graph, JSON-LD and sitemap URLs on the primary host are extensionless (Cloudflare Pages redirects .html to extensionless)", ![html, projectHtml, retainerHtml, guideHtml, sitemap].some((text) => /https:\/\/ratenest\.pages\.dev\/[^"<\s]*\.html/.test(text)));
check("sitemap lists the retainer page", sitemap.includes("<loc>https://ratenest.pages.dev/retainer-pricing</loc>"));
check("sitemap lists the freelance project pricing guide", sitemap.includes("<loc>https://ratenest.pages.dev/how-to-price-a-freelance-project</loc>"));
check("sitemap no longer advertises GitHub Pages URLs", !sitemap.includes("fadhel-docom.github.io"));

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll site checks passed.");
