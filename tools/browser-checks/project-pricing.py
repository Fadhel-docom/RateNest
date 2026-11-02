import sys, subprocess, time
from playwright.sync_api import sync_playwright
repo, port = sys.argv[1], sys.argv[2]
srv = subprocess.Popen(["python3", "-I", "-m", "http.server", port, "--bind", "127.0.0.1"], cwd=repo, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
r = []
def ok(n, c, d=""): r.append((n, bool(c), d))
URL = f"http://127.0.0.1:{port}/project-pricing.html"
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        for w in (320, 375, 1280):
            ctx = b.new_context(viewport={"width": w, "height": 800}, permissions=["clipboard-read", "clipboard-write"]); pg = ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type in ("error", "warning") else None)
            pg.goto(URL); pg.wait_for_timeout(400)
            ok(f"[{w}px] default quote $1,350.00 after JS", pg.inner_text("#quote-total") == "$1,350.00", pg.inner_text("#quote-total"))
            ok(f"[{w}px] defaults: labour/buffer/expenses/effective", (pg.inner_text("#labour-total"), pg.inner_text("#buffer-total"), pg.inner_text("#expenses-total"), pg.inner_text("#effective-rate")) == ("$1,200.00", "$0.00", "$150.00", "$67.50/hr"))
            ok(f"[{w}px] actual-hours scenario is blank by default", pg.inner_text("#actual-effective-rate") == "—" and not pg.is_visible("#actual-hours-note"))
            ok(f"[{w}px] no horizontal overflow", not pg.evaluate("document.documentElement.scrollWidth>document.documentElement.clientWidth"), pg.evaluate("document.documentElement.scrollWidth+'>'+document.documentElement.clientWidth"))
            if w == 375:
                # live recalculation
                pg.fill("#estimatedHours", "10"); pg.fill("#hourlyRate", "100"); pg.fill("#directExpenses", "0"); pg.fill("#bufferPercent", "0"); pg.wait_for_timeout(200)
                ok("recalc 10h x 100, no buffer/expenses = $1,000.00", pg.inner_text("#quote-total") == "$1,000.00", pg.inner_text("#quote-total"))
                pg.fill("#directExpenses", ""); pg.fill("#bufferPercent", ""); pg.wait_for_timeout(200)
                ok("blank optional fields treated as 0 without error", pg.inner_text("#quote-total") == "$1,000.00" and not pg.is_visible("#directExpenses-error"))
                # actual-hours scenario: fixed quote stays unchanged while quote-per-hour responds to actual time
                pg.fill("#estimatedHours", "20"); pg.fill("#hourlyRate", "60"); pg.fill("#directExpenses", "150"); pg.fill("#bufferPercent", "0"); pg.fill("#actualHours", "30"); pg.wait_for_timeout(150)
                ok("30 actual hours: quote remains $1,350 and effective rate is $45/hr", pg.inner_text("#quote-total") == "$1,350.00" and pg.inner_text("#actual-effective-rate") == "$45.00/hr" and "10 hours more" in pg.inner_text("#actual-hours-note"))
                pg.fill("#actualHours", "10"); pg.wait_for_timeout(150)
                ok("10 actual hours: effective rate rises to $135/hr", pg.inner_text("#actual-effective-rate") == "$135.00/hr" and "10 hours fewer" in pg.inner_text("#actual-hours-note"))
                pg.fill("#actualHours", "20"); pg.wait_for_timeout(150)
                ok("20 actual hours: effective rate matches estimate", pg.inner_text("#actual-effective-rate") == "$67.50/hr" and "matched your estimate" in pg.inner_text("#actual-hours-note"))
                pg.fill("#actualHours", "0"); pg.wait_for_timeout(150)
                ok("zero actual hours is explicitly not calculable", pg.inner_text("#actual-effective-rate") == "Not calculable" and "0 actual hours" in pg.inner_text("#actual-hours-note"))
                pg.fill("#actualHours", ""); pg.wait_for_timeout(150)
                ok("blank actual hours clears the optional scenario", pg.inner_text("#actual-effective-rate") == "—" and not pg.is_visible("#actual-hours-note"))
                # validation messages
                for fld, bad in (("estimatedHours", "0"), ("estimatedHours", ""), ("estimatedHours", "-3"), ("hourlyRate", "-1"), ("bufferPercent", "101"), ("directExpenses", "-5"), ("actualHours", "-1"), ("actualHours", "100001")):
                    pg.fill("#estimatedHours", "10"); pg.fill("#hourlyRate", "100"); pg.fill("#directExpenses", "0"); pg.fill("#bufferPercent", "0")
                    pg.fill(f"#{fld}", bad); pg.wait_for_timeout(150)
                    vis = pg.is_visible(f"#{fld}-error")
                    ok(f"{fld}='{bad}' shows error, aria-invalid, and clears result", vis and pg.get_attribute(f"#{fld}", "aria-invalid") == "true" and pg.inner_text("#quote-total") == "—" and pg.is_disabled("#copy-quote"), pg.inner_text(f"#{fld}-error") if vis else "no error")
                # focus must not be stolen while typing in ANOTHER field
                pg.fill("#estimatedHours", "10"); pg.fill("#hourlyRate", "100"); pg.fill("#directExpenses", "0"); pg.fill("#bufferPercent", "0")
                pg.fill("#estimatedHours", ""); pg.wait_for_timeout(100)
                pg.click("#hourlyRate"); pg.keyboard.type("5"); pg.wait_for_timeout(150)
                active = pg.evaluate("document.activeElement.id")
                ok("typing in hourlyRate while hours is invalid keeps focus in hourlyRate", active == "hourlyRate", f"activeElement={active}")
                # copy
                pg.fill("#estimatedHours", "20"); pg.fill("#hourlyRate", "60"); pg.fill("#directExpenses", "150"); pg.fill("#bufferPercent", "25"); pg.fill("#actualHours", "30"); pg.fill("#projectTitle", "Logo redesign"); pg.wait_for_timeout(150)
                pg.click("#copy-quote"); pg.wait_for_timeout(200)
                clip = pg.evaluate("navigator.clipboard.readText()")
                ok("copy summary has project, estimate, actual hours, actual rate and assumptions", all(s in clip for s in ("Logo redesign", "$1,650.00", "$82.50/hr", "Actual hours worked: 30", "$55.00/hr", "includes direct expenses", "Assumptions")), clip.replace("\n", " | ")[:260])
                ok("copy status announced", "copied" in pg.inner_text("#copy-status").lower(), pg.inner_text("#copy-status"))
                # currency
                pg.select_option("#currency", "EUR"); pg.wait_for_timeout(150)
                ok("currency EUR re-renders quote", "€" in pg.inner_text("#quote-total"), pg.inner_text("#quote-total"))
                pg.select_option("#currency", "TND"); pg.wait_for_timeout(150)
                ok("currency TND renders without throwing (buffer 25% from the copy test above)", "1,650" in pg.inner_text("#quote-total"), pg.inner_text("#quote-total"))
                # keyboard: skip link target exists and tab order reaches the button
                ok("skip link target exists", pg.evaluate("!!document.querySelector(document.querySelector('.skip-link').getAttribute('href'))"))
                # homepage link + sitemap
                pg.goto(f"http://127.0.0.1:{port}/index.html"); pg.wait_for_timeout(200)
                ok("homepage links to project page", pg.is_visible("a[href='./project-pricing.html']"))
            ok(f"[{w}px] no console errors/warnings", not errs, str(errs))
            ctx.close()
        # no-JS: static default numbers visible
        ctx = b.new_context(java_script_enabled=False); pg = ctx.new_page(); pg.goto(URL)
        ok("no-JS: static default $1,350.00 visible", "$1,350.00" in pg.inner_text("#quote-total"))
        ctx.close()
        # 320px + 200% text reflow
        ctx = b.new_context(viewport={"width": 320, "height": 800}); pg = ctx.new_page(); pg.goto(URL)
        pg.add_style_tag(content="html{font-size:200%}"); pg.wait_for_timeout(200)
        ok("320px with 200% text: no horizontal scroll", not pg.evaluate("document.documentElement.scrollWidth>document.documentElement.clientWidth"))
        ctx.close()
        # Realistic larger quotes (six and seven figures) must also reflow at 320px with 200% text.
        for label, vals in (("six-figure", (500, 150, 25000, 30)), ("seven-figure", (4000, 250, 100000, 25))):
            ctx = b.new_context(viewport={"width": 320, "height": 800}); pg = ctx.new_page(); pg.goto(URL); pg.wait_for_timeout(200)
            for key, val in zip(("estimatedHours", "hourlyRate", "directExpenses", "bufferPercent"), vals): pg.fill(f"#{key}", str(val))
            pg.add_style_tag(content="html{font-size:200%}"); pg.wait_for_timeout(200)
            ok(f"320px with 200% text, {label} quote: no horizontal scroll", not pg.evaluate("document.documentElement.scrollWidth>document.documentElement.clientWidth"), pg.evaluate("document.documentElement.scrollWidth+'>'+document.documentElement.clientWidth") + " " + pg.inner_text("#quote-total"))
            ctx.close()
        # Optional hours breakdown (PR #73): categories prompt the user and add their sum to the total-hours field.
        for w in (320, 375):
            ctx = b.new_context(viewport={"width": w, "height": 800}, permissions=["clipboard-read", "clipboard-write"]); pg = ctx.new_page(); errs = []
            pg.on("console", lambda m: errs.append(m.text) if m.type in ("error", "warning") else None); pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.goto(URL); pg.wait_for_timeout(250)
            ids = ("planningHours", "productionHours", "meetingsHours", "revisionsHours", "managementHours")
            ok(f"[{w}px] breakdown: closed by default, five labelled blank inputs", not pg.evaluate("document.querySelector('#hours-breakdown').open") and all(pg.get_attribute(f"#{i}", "value") in ("", None) and pg.input_value(f"#{i}") == "" and pg.locator(f"label[for={i}]").count() == 1 for i in ids))
            ok(f"[{w}px] breakdown: default copy summary has no category lines", (pg.click("#copy-quote"), pg.wait_for_timeout(150), "Discovery and planning" not in pg.evaluate("navigator.clipboard.readText()"))[2])
            pg.click("#hours-breakdown summary")
            pg.fill("#planningHours", "2"); pg.fill("#productionHours", "12"); pg.fill("#meetingsHours", "3"); pg.fill("#revisionsHours", "2"); pg.fill("#managementHours", "1")
            pg.click("#apply-hours-breakdown"); pg.wait_for_timeout(150)
            ok(f"[{w}px] breakdown: apply sets total hours to the category sum", pg.input_value("#estimatedHours") == "20", pg.input_value("#estimatedHours"))
            ok(f"[{w}px] breakdown: status announced and explains no auto-sync", "Breakdown total added: 20 hours" in pg.inner_text("#breakdown-status") and "will not update" in pg.inner_text("#breakdown-status") and pg.get_attribute("#breakdown-status", "role") == "status", pg.inner_text("#breakdown-status"))
            pg.click("#copy-quote"); pg.wait_for_timeout(150); clip = pg.evaluate("navigator.clipboard.readText()")
            ok(f"[{w}px] breakdown: copy summary lists non-zero categories matching the total", all(t in clip for t in ("Estimated effort: 20 hours", "Discovery and planning: 2 hours", "Production / delivery: 12 hours", "Meetings and communication: 3 hours", "Revisions and QA: 2 hours", "Project management and admin: 1 hours")), clip.replace("\n", " | ")[:300])
            pg.fill("#productionHours", "13"); pg.wait_for_timeout(100); pg.click("#copy-quote"); pg.wait_for_timeout(150); clip = pg.evaluate("navigator.clipboard.readText()")
            ok(f"[{w}px] breakdown: editing a category after apply drops the stale lines from the summary", "Discovery and planning" not in clip and "Estimated effort: 20 hours" in clip, clip.replace("\n", " | ")[:200])
            for i in ids: pg.fill(f"#{i}", "")
            pg.fill("#estimatedHours", "20"); pg.click("#apply-hours-breakdown"); pg.wait_for_timeout(100)
            ok(f"[{w}px] breakdown: all-blank apply is refused and total stays unchanged", pg.input_value("#estimatedHours") == "20" and "at least one positive" in pg.inner_text("#breakdown-status"), pg.inner_text("#breakdown-status"))
            pg.fill("#planningHours", "0.1"); pg.fill("#productionHours", "0.2"); pg.click("#apply-hours-breakdown"); pg.wait_for_timeout(150)
            ok(f"[{w}px] breakdown: 0.1 + 0.2 gives a clean 0.3 (no floating-point noise)", pg.input_value("#estimatedHours") == "0.3" and "0.3 hours" in pg.inner_text("#breakdown-status") and "0000000" not in pg.input_value("#estimatedHours"), pg.input_value("#estimatedHours"))
            ok(f"[{w}px] breakdown: quote recalculates from the applied total (0.3 h x $60 = $18.00 labour)", "$18.00" in pg.inner_text("#labour-total"), pg.inner_text("#labour-total"))
            pg.fill("#planningHours", "-1"); pg.click("#apply-hours-breakdown"); pg.wait_for_timeout(100); msg = pg.inner_text("#breakdown-status")
            ok(f"[{w}px] breakdown: invalid value gives a plain-language message (no internal field name)", "Discovery and planning hours" in msg and "planningHours" not in msg, msg)
            pg.fill("#planningHours", "60000"); pg.fill("#productionHours", "50000"); pg.click("#apply-hours-breakdown"); pg.wait_for_timeout(100)
            ok(f"[{w}px] breakdown: combined total above 100,000 is refused with a message", "combined breakdown" in pg.inner_text("#breakdown-status").lower() and pg.input_value("#estimatedHours") == "0.3", pg.inner_text("#breakdown-status"))
            pg.focus("#planningHours")
            ok(f"[{w}px] breakdown: category inputs are keyboard reachable", pg.evaluate("document.activeElement.id") == "planningHours")
            pg.add_style_tag(content="html{font-size:200%}"); pg.wait_for_timeout(200)
            ok(f"[{w}px] breakdown open at 200% text: no horizontal scroll", not pg.evaluate("document.documentElement.scrollWidth>document.documentElement.clientWidth"), pg.evaluate("document.documentElement.scrollWidth+'>'+document.documentElement.clientWidth"))
            ok(f"[{w}px] breakdown: no console errors/warnings", not errs, str(errs))
            ctx.close()
        # Printable client sheet (print media emulation): client-facing figures only, no freelancer-internal lines.
        for w in (375, 1280):
            ctx = b.new_context(viewport={"width": w, "height": 900}); pg = ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type in ("error", "warning") else None)
            pg.goto(URL); pg.wait_for_timeout(400)
            ok(f"[{w}px] print: button visible+enabled on screen, print-only blocks hidden", pg.is_visible("#print-quote") and pg.is_enabled("#print-quote") and not pg.is_visible(".quote-document-heading") and not pg.is_visible(".quote-print-note"))
            pg.fill("#estimatedHours", "0"); pg.wait_for_timeout(150)
            ok(f"[{w}px] print: button disabled when there is no valid quote", pg.is_disabled("#print-quote"))
            pg.fill("#estimatedHours", "20"); pg.fill("#actualHours", "30"); pg.fill("#projectTitle", "Acme website"); pg.wait_for_timeout(200)
            pg.emulate_media(media="print")
            shown = lambda s: pg.evaluate("s=>{const e=document.querySelector(s);if(!e)return false;const r=e.getBoundingClientRect();return getComputedStyle(e).display!=='none'&&r.width>0&&r.height>0}", s)
            ok(f"[{w}px] print: title, total, subtotals and not-a-contract note are shown", shown(".quote-document-heading") and "Acme website" in pg.inner_text("#print-project-title") and shown("#quote-total") and shown("#labour-total") and shown("#expenses-total") and shown(".quote-print-note"))
            ok(f"[{w}px] print: nav, form, FAQ, buttons and status are hidden", not any(shown(s) for s in (".site-header", "#project-form", ".explainer", "footer", "#copy-quote", "#print-quote", "#copy-status")))
            ok(f"[{w}px] print: freelancer-internal lines hidden (actual-hours analysis, effective rate, planning tip)", not any(shown(s) for s in ("#actual-hours-note", "#actual-effective-rate", "#effective-rate", ".result-tip")))
            ok(f"[{w}px] print: no horizontal overflow", not pg.evaluate("document.documentElement.scrollWidth>document.documentElement.clientWidth"))
            if w == 1280:
                ok("print: Chromium renders a PDF of the quote sheet", len(pg.pdf(prefer_css_page_size=True)) > 1000)
            ok(f"[{w}px] print: no console errors/warnings", not errs, str(errs))
            ctx.close()
        b.close()
finally: srv.terminate()
for n, c, d in r: print(("PASS" if c else "FAIL"), n, (f"[{d}]" if d else ""))
print(sum(1 for _, c, _ in r if c), "passed,", sum(1 for _, c, _ in r if not c), "failed")
