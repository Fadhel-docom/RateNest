import sys, subprocess, time, json
from playwright.sync_api import sync_playwright
repo = sys.argv[1]
srv = subprocess.Popen(["python3","-I","-m","http.server","8766","--bind","127.0.0.1"],cwd=repo,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(1)
URL="http://127.0.0.1:8766/index.html"
res = {}
def ok(name, cond, detail=""):
    res[name] = ("PASS" if cond else "FAIL") + (f" {detail}" if detail else "")
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        for w in (320, 375, 1280):
            ctx = b.new_context(viewport={"width":w,"height":800}); pg = ctx.new_page(); errs=[]
            pg.on("console", lambda m: errs.append(m.text) if m.type in ("error","warning") else None)
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.goto(URL); pg.wait_for_timeout(500)
            ok(f"w{w}: no console errors/warnings", not errs, str(errs))
            ok(f"w{w}: no horizontal overflow", not pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth"))
            ok(f"w{w}: default rate $57.29/hr", pg.inner_text("#rate-result")=="$57.29/hr", pg.inner_text("#rate-result"))
            ctx.close()
        ctx = b.new_context(viewport={"width":375,"height":800}, permissions=["clipboard-read","clipboard-write"]); pg = ctx.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e))); pg.goto(URL); pg.wait_for_timeout(400)
        # Static vs JS render: same visible numbers
        ok("annual total after JS", pg.inner_text("#annual-total")=="$66,000", pg.inner_text("#annual-total"))
        ok("steps rendered (3)", pg.locator("#formula-steps li").count()==3)
        ok("scenario rows (3)", pg.locator("#scenario-rows tr").count()==3)
        ok("scenario table shows non-billable annual hours", pg.locator("#scenario-rows tr").nth(1).locator("td").nth(1).inner_text()=="768 hrs")
        ok("scenario table has four cells including non-billable hours", pg.locator("#scenario-rows tr").nth(1).locator("th,td").count()==4)
        # Clear income -> error state, no stale result
        pg.fill("#income",""); pg.wait_for_timeout(200)
        ok("clear income: rate shows dash", pg.inner_text("#rate-result")=="—", pg.inner_text("#rate-result"))
        ok("clear income: aria-invalid set", pg.get_attribute("#income","aria-invalid")=="true")
        ok("clear income: error visible", pg.is_visible("#income-error") and "target annual income" in pg.inner_text("#income-error"), pg.inner_text("#income-error"))
        ok("clear income: copy disabled", pg.is_disabled("#copy-result"))
        ok("clear income: scenarios cleared", pg.locator("#scenario-rows tr").count()==0)
        pg.wait_for_timeout(800)
        ok("clear income: SR announcement", "Please fix" in pg.inner_text("#sr-announce"), pg.inner_text("#sr-announce"))
        pg.fill("#income","60000"); pg.wait_for_timeout(200)
        ok("recover: rate back", pg.inner_text("#rate-result")=="$57.29/hr")
        ok("recover: error hidden + aria-invalid removed", (not pg.is_visible("#income-error")) and pg.get_attribute("#income","aria-invalid") is None)
        # Decimal hours
        pg.fill("#hours","37.5"); pg.wait_for_timeout(200)
        ok("37.5 hrs/week accepted -> $61.11/hr", pg.inner_text("#rate-result")=="$61.11/hr", pg.inner_text("#rate-result"))
        pg.fill("#hours","40")
        # Invalid weeks off
        pg.fill("#weeks-off","4.5"); pg.wait_for_timeout(200)
        ok("weeks off 4.5 rejected", "whole weeks" in pg.inner_text("#weeks-off-error"), pg.inner_text("#weeks-off-error"))
        pg.fill("#weeks-off","60"); pg.wait_for_timeout(200)
        ok("weeks off 60 rejected", "between 0 and 51" in pg.inner_text("#weeks-off-error"))
        pg.fill("#weeks-off","4")
        # Blank expenses = 0
        pg.fill("#expenses",""); pg.wait_for_timeout(200)
        ok("blank expenses -> $52.08/hr", pg.inner_text("#rate-result")=="$52.08/hr", pg.inner_text("#rate-result"))
        pg.fill("#expenses","6000")
        # Extreme
        pg.fill("#income","2000000000"); pg.wait_for_timeout(200)
        ok("income over 1e9 rejected", "1,000,000,000" in pg.inner_text("#income-error"))
        pg.fill("#income","60000")
        # Slider
        pg.fill("#billable","80"); pg.wait_for_timeout(200)
        ok("slider 80% -> $42.97/hr & output 80%", pg.inner_text("#rate-result")=="$42.97/hr" and pg.inner_text("#billable-output")=="80%", pg.inner_text("#rate-result")+" / "+pg.inner_text("#billable-output"))
        pg.fill("#billable","60")
        # Currency
        for cur in ("EUR","TND","GBP"):
            pg.select_option("#currency",cur); pg.wait_for_timeout(150)
            ok(f"currency {cur} renders a rate", "57.29" in pg.inner_text("#rate-result") and "NaN" not in pg.inner_text("#rate-result"), pg.inner_text("#rate-result"))
        pg.select_option("#currency","USD"); pg.wait_for_timeout(150)
        # Copy
        pg.click("#copy-result"); pg.wait_for_timeout(200)
        clip = pg.evaluate("navigator.clipboard.readText()")
        ok("copy status says copied", pg.inner_text("#copy-status")=="Summary copied.", pg.inner_text("#copy-status"))
        ok("copied text has rate, inputs, disclaimer", "Suggested rate: $57.29/hr" in clip and "before personal income tax): $60,000" in clip and "excludes personal income tax" in clip)
        res["_clipboard_text"]=clip
        # Keyboard & focus (fresh load so focus starts at the top of the document)
        pg.goto(URL); pg.wait_for_timeout(300)
        pg.keyboard.press("Tab"); first = pg.evaluate("document.activeElement.className")
        ok("first Tab stop is skip link", "skip-link" in first, first)
        pg.keyboard.press("Enter"); pg.wait_for_timeout(100)
        ok("skip link moves focus target to form", pg.evaluate("location.hash")=="#rate-form", pg.evaluate("location.hash"))
        pg.focus("#income")
        ow = pg.evaluate("parseFloat(getComputedStyle(document.querySelector('#income')).outlineWidth)")
        ok("input shows focus outline >=2px", ow>=2, str(ow))
        # Enter in a field submits and keeps focus management sane
        pg.keyboard.press("Enter"); pg.wait_for_timeout(150)
        ok("Enter submits without page navigation", pg.evaluate("location.pathname")=="/index.html")
        # Touch target sizes
        sizes = pg.evaluate("""() => Object.fromEntries(['#currency','.calculate-button','#copy-result','.faq summary','#income','#hours','#weeks-off'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return [s,Math.round(r.height)]}))""")
        ok("touch targets >=44px tall", all(h>=44 for h in sizes.values()), json.dumps(sizes))
        # Labels / accessible names
        unlabeled = pg.evaluate("""() => [...document.querySelectorAll('input,select')].filter(e=>!e.labels||e.labels.length===0).map(e=>e.id)""")
        ok("all inputs have labels", not unlabeled, str(unlabeled))
        res["_aria_snapshot_form"]=pg.locator("#rate-form").aria_snapshot()[:900]
        # FAQ opens with keyboard
        pg.goto(URL); pg.wait_for_timeout(300)
        pg.focus(".faq summary"); pg.keyboard.press("Enter"); pg.wait_for_timeout(150)
        ok("FAQ opens via keyboard", pg.evaluate("document.querySelector('.faq details').open"))
        ok("no page errors during session", not errs, str(errs))
        # Print emulation hides FAQ / header
        pg.emulate_media(media="print")
        ok("print: header & FAQ hidden", not pg.is_visible(".site-header") and not pg.is_visible(".faq"))
        ctx.close()
        # No-JS fallback
        ctx = b.new_context(java_script_enabled=False, viewport={"width":375,"height":800}); pg = ctx.new_page(); pg.goto(URL)
        ok("no-JS: static rate visible", pg.inner_text("#rate-result")=="$57.29/hr")
        ok("no-JS: noscript note shown", "needs JavaScript" in pg.inner_text(".noscript-note"))
        ctx.close()
        b.close()
finally:
    srv.terminate()
fails=[k for k,v in res.items() if v.startswith("FAIL")]
for k,v in res.items():
    if k.startswith("_"): print(f"\n{k}:\n{v}\n")
    else: print(f"{v.split()[0]:4} {k}" + ("" if v.startswith("PASS") and len(v)<=4 else f"  [{v[5:]}]" if len(v)>5 else ""))
print(f"\n{len(res)-len([k for k in res if k.startswith('_')])-len(fails)} passed, {len(fails)} failed")
