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
            ok(f"[{w}px] no horizontal overflow", not pg.evaluate("document.documentElement.scrollWidth>document.documentElement.clientWidth"), pg.evaluate("document.documentElement.scrollWidth+'>'+document.documentElement.clientWidth"))
            if w == 375:
                # live recalculation
                pg.fill("#estimatedHours", "10"); pg.fill("#hourlyRate", "100"); pg.fill("#directExpenses", "0"); pg.fill("#bufferPercent", "0"); pg.wait_for_timeout(200)
                ok("recalc 10h x 100, no buffer/expenses = $1,000.00", pg.inner_text("#quote-total") == "$1,000.00", pg.inner_text("#quote-total"))
                pg.fill("#directExpenses", ""); pg.fill("#bufferPercent", ""); pg.wait_for_timeout(200)
                ok("blank optional fields treated as 0 without error", pg.inner_text("#quote-total") == "$1,000.00" and not pg.is_visible("#directExpenses-error"))
                # validation messages
                for fld, bad in (("estimatedHours", "0"), ("estimatedHours", ""), ("estimatedHours", "-3"), ("hourlyRate", "-1"), ("bufferPercent", "101"), ("directExpenses", "-5")):
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
                pg.fill("#estimatedHours", "20"); pg.fill("#hourlyRate", "60"); pg.fill("#directExpenses", "150"); pg.fill("#bufferPercent", "25"); pg.fill("#projectTitle", "Logo redesign"); pg.wait_for_timeout(150)
                pg.click("#copy-quote"); pg.wait_for_timeout(200)
                clip = pg.evaluate("navigator.clipboard.readText()")
                ok("copy summary has project, quote, assumptions", all(s in clip for s in ("Logo redesign", "$1,650.00", "$82.50/hr", "Assumptions")), clip.replace("\n", " | ")[:260])
                ok("copy status announced", "copied" in pg.inner_text("#copy-status").lower(), pg.inner_text("#copy-status"))
                # currency
                pg.select_option("#currency", "EUR"); pg.wait_for_timeout(150)
                ok("currency EUR re-renders quote", "€" in pg.inner_text("#quote-total"), pg.inner_text("#quote-total"))
                pg.select_option("#currency", "TND"); pg.wait_for_timeout(150)
                ok("currency TND renders without throwing", "1,350" in pg.inner_text("#quote-total"), pg.inner_text("#quote-total"))
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
        b.close()
finally: srv.terminate()
for n, c, d in r: print(("PASS" if c else "FAIL"), n, (f"[{d}]" if d else ""))
print(sum(1 for _, c, _ in r if c), "passed,", sum(1 for _, c, _ in r if not c), "failed")
