import sys, subprocess, time
from playwright.sync_api import sync_playwright
repo,port=sys.argv[1],sys.argv[2]
srv=subprocess.Popen(["python3","-I","-m","http.server",port,"--bind","127.0.0.1"],cwd=repo,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
base=f"http://127.0.0.1:{port}"
r=[]
def ok(n,c,d=""): r.append((n,bool(c),d))
def overflow(pg): return pg.evaluate("document.documentElement.scrollWidth>document.documentElement.clientWidth")
try:
    with sync_playwright() as p:
        b=p.chromium.launch(); ctx=b.new_context(viewport={"width":375,"height":800}); pg=ctx.new_page(); errs=[]; reqs=[]
        pg.on("pageerror",lambda e:errs.append(str(e))); pg.on("console",lambda m: errs.append(m.text) if m.type in("error","warning") else None)
        pg.on("request",lambda q:reqs.append(q.url))

        # --- hourly calculator: the opt-in links
        pg.goto(base+"/index.html"); pg.wait_for_timeout(400)
        ok("home: next-steps block visible with the default result", pg.is_visible("#next-steps"))
        ok("home: project link carries the default $57.29 rate and currency in the fragment", pg.get_attribute("#next-project","href")=="./project-pricing.html#rate=57.29&currency=USD", pg.get_attribute("#next-project","href"))
        ok("home: retainer link carries the same rate", pg.get_attribute("#next-retainer","href")=="./retainer-pricing.html#rate=57.29&currency=USD", pg.get_attribute("#next-retainer","href"))
        ok("home: link text shows the rate being carried", "$57.29/hr" in pg.inner_text("#next-project") and "$57.29/hr" in pg.inner_text("#next-retainer"), pg.inner_text("#next-project"))
        ok("home: block has an accessible name and keyboard-focusable links", pg.get_attribute("#next-steps","aria-label")=="Use this rate in another calculator" and pg.evaluate("(()=>{const a=document.querySelector('#next-project');a.focus();return document.activeElement===a})()"))
        pg.evaluate("document.querySelector('details:has(#fee)').open=true")
        pg.fill("#fee","10"); pg.fill("#buffer","20"); pg.wait_for_timeout(250)
        ok("home: with fee 10% + buffer 20% the rate to quote ($76.39) is carried, not the base rate", pg.get_attribute("#next-project","href")=="./project-pricing.html#rate=76.39&currency=USD", pg.get_attribute("#next-project","href"))
        pg.fill("#fee",""); pg.fill("#buffer",""); pg.wait_for_timeout(250)
        pg.select_option("#currency","TND"); pg.wait_for_timeout(250)
        ok("home: TND rounds to three digits and carries TND", pg.get_attribute("#next-project","href")=="./project-pricing.html#rate=57.292&currency=TND", pg.get_attribute("#next-project","href"))
        pg.select_option("#currency","USD")
        pg.fill("#income","-5"); pg.wait_for_timeout(250)
        ok("home: invalid inputs hide the block and reset to plain links", not pg.is_visible("#next-steps") and pg.get_attribute("#next-project","href")=="./project-pricing.html", pg.get_attribute("#next-project","href"))
        pg.fill("#income","60000"); pg.wait_for_timeout(250)
        ok("home: block returns when inputs are valid again", pg.is_visible("#next-steps"))
        for w in (320,375,1280):
            pg.set_viewport_size({"width":w,"height":800}); pg.wait_for_timeout(100)
            ok(f"home: no horizontal overflow at {w}px with the hand-off block", not overflow(pg))
        pg.set_viewport_size({"width":375,"height":800})
        pg.emulate_media(media="print")
        ok("home: block is hidden when printing", not pg.is_visible("#next-steps"))
        pg.emulate_media(media="screen")

        # --- click through to the project quote calculator
        pg.goto(base+"/index.html"); pg.wait_for_timeout(300)
        pg.click("#next-project"); pg.wait_for_url("**/project-pricing.html**"); pg.wait_for_timeout(400)
        ok("project: hourly rate pre-filled with 57.29", pg.input_value("#hourlyRate")=="57.29", pg.input_value("#hourlyRate"))
        ok("project: quote recomputed from the carried rate (20 h x 57.29 + 150 = $1,295.80)", pg.inner_text("#quote-total")=="$1,295.80", pg.inner_text("#quote-total"))
        ok("project: visible status note names the carried rate", pg.is_visible("#hourlyRate-carried") and "$57.29/hr" in pg.inner_text("#hourlyRate-carried"), pg.inner_text("#hourlyRate-carried"))
        ok("project: note is a polite status region", pg.get_attribute("#hourlyRate-carried","role")=="status")
        pg.fill("#hourlyRate","70"); pg.wait_for_timeout(250)
        ok("project: editing the rate removes the note and uses the edited value (20 h x 70 + 150 = $1,550.00)", not pg.is_visible("#hourlyRate-carried") and pg.inner_text("#quote-total")=="$1,550.00", pg.inner_text("#quote-total"))
        ok("project: no horizontal overflow at 375px with the note", not overflow(pg))

        # --- retainer
        pg.goto(base+"/index.html"); pg.wait_for_timeout(300)
        pg.click("#next-retainer"); pg.wait_for_url("**/retainer-pricing.html**"); pg.wait_for_timeout(400)
        ok("retainer: hourly rate pre-filled with 57.29", pg.input_value("#hourlyRate")=="57.29", pg.input_value("#hourlyRate"))
        ok("retainer: monthly fee recomputed (20 h x 57.29 = $1,145.80)", pg.inner_text("#retainer-total")=="$1,145.80", pg.inner_text("#retainer-total"))
        ok("retainer: note visible", pg.is_visible("#hourlyRate-carried"))

        # --- TND end to end
        pg.goto(base+"/index.html"); pg.wait_for_timeout(300)
        pg.select_option("#currency","TND"); pg.wait_for_timeout(250)
        pg.click("#next-project"); pg.wait_for_url("**/project-pricing.html**"); pg.wait_for_timeout(400)
        ok("project: TND carried: currency select is TND and rate is 57.292", pg.input_value("#currency")=="TND" and pg.input_value("#hourlyRate")=="57.292", pg.input_value("#currency")+"/"+pg.input_value("#hourlyRate"))
        ok("project: TND quote uses three digits (20 h x 57.292 + 150 = 1,295.840)", "1,295.840" in pg.inner_text("#quote-total"), pg.inner_text("#quote-total"))

        # --- note lifecycle (PR #112): the double-counting warning, and dismissal on rate OR currency change
        for page_file, total_id, label in (("project-pricing.html","#quote-total","project"),("retainer-pricing.html","#retainer-total","retainer")):
            pg.goto(base+"/index.html"); pg.wait_for_timeout(300)
            pg.click("#next-project" if label=="project" else "#next-retainer"); pg.wait_for_url(f"**/{page_file}**"); pg.wait_for_timeout(400)
            note=pg.inner_text("#hourlyRate-carried")
            ok(f"{label}: note warns about double-counting a fee/buffer and does not claim the calculator adds fees", pg.is_visible("#hourlyRate-carried") and "double-counting" in note and "fee or buffer" in note, note)
            pg.select_option("#currency","EUR"); pg.wait_for_timeout(250)
            ok(f"{label}: changing the currency removes the carried-rate note", not pg.is_visible("#hourlyRate-carried") and pg.inner_text("#hourlyRate-carried")=="", repr(pg.inner_text("#hourlyRate-carried")))
            ok(f"{label}: after the currency change the result is recomputed in the new currency and keeps the rate", pg.input_value("#hourlyRate")=="57.29" and pg.inner_text(total_id).startswith("€"), pg.input_value("#hourlyRate")+" "+pg.inner_text(total_id))
            ok(f"{label}: no horizontal overflow at 375px after the note is removed", not overflow(pg))
            # note stays gone, and editing the rate afterwards does not bring it back
            pg.fill("#hourlyRate","65"); pg.wait_for_timeout(250)
            ok(f"{label}: note does not reappear after a later rate edit", not pg.is_visible("#hourlyRate-carried"))
            # a fresh visit from the home page shows the note again (the fragment is the only trigger)
            pg.goto(base+"/index.html"); pg.wait_for_timeout(300)
            pg.click("#next-project" if label=="project" else "#next-retainer"); pg.wait_for_url(f"**/{page_file}**"); pg.wait_for_timeout(400)
            ok(f"{label}: a new hand-off shows the note again", pg.is_visible("#hourlyRate-carried"))
            pg.fill("#hourlyRate","70"); pg.wait_for_timeout(250)
            ok(f"{label}: editing the rate still removes the note (regression for the original behaviour)", not pg.is_visible("#hourlyRate-carried"))

        # --- tampered or hostile fragments fall back to the normal defaults
        for frag in ("#rate=abc","#rate=-5","#rate=0","#rate=60&currency=XXX","#rate=%3Cscript%3Ealert(1)%3C/script%3E","#rate=99999999999","#nothing"):
            for page,out,default in (("project-pricing.html","#quote-total","$1,350.00"),("retainer-pricing.html","#retainer-total","$1,200.00")):
                pg.goto("about:blank")  # a hash-only change on the same page is not a reload, so start from a blank page
                pg.goto(base+"/"+page+frag); pg.wait_for_timeout(250)
                ok(f"{page}{frag}: ignored, default rate 60 and result {default}", pg.input_value("#hourlyRate")=="60" and pg.inner_text(out)==default and not pg.is_visible("#hourlyRate-carried"), pg.input_value("#hourlyRate")+" "+pg.inner_text(out))
        pg.goto(base+"/project-pricing.html"); pg.wait_for_timeout(250)
        ok("project: opening directly without a fragment keeps the verified default $1,350.00", pg.inner_text("#quote-total")=="$1,350.00" and not pg.is_visible("#hourlyRate-carried"))

        # --- privacy: the carried value never appears in any network request
        ok("no network request carries the hand-off (fragment stays in the browser)", not any("rate=" in u or "#" in u for u in reqs), str([u for u in reqs if "rate=" in u or "#" in u][:3]))
        ok("no cookies or storage used by the hand-off", pg.evaluate("document.cookie===''&&localStorage.length===0&&sessionStorage.length===0"))
        ok("no console errors/warnings across all pages", not errs, str(errs))
        b.close()

        # --- no-JS: plain links still work
        b=p.chromium.launch(); ctx=b.new_context(java_script_enabled=False,viewport={"width":375,"height":800}); pg=ctx.new_page()
        pg.goto(base+"/index.html"); pg.wait_for_timeout(300)
        ok("no-JS: links are plain page links and the static result still shows $57.29", pg.get_attribute("#next-project","href")=="./project-pricing.html" and "$57.29" in pg.inner_text("#rate-result"))
        b.close()
finally: srv.terminate()
for n,c,d in r: print(("PASS" if c else "FAIL"),n,(f"[{d}]" if d else ""))
print(sum(1 for _,c,_ in r if c),"passed,",sum(1 for _,c,_ in r if not c),"failed")
