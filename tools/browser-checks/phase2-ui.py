import sys, subprocess, time
from playwright.sync_api import sync_playwright
repo,port=sys.argv[1],sys.argv[2]
srv=subprocess.Popen(["python3","-I","-m","http.server",port,"--bind","127.0.0.1"],cwd=repo,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
r=[]
def ok(n,c,d=""): r.append((n,bool(c),d))
try:
    with sync_playwright() as p:
        b=p.chromium.launch(); ctx=b.new_context(viewport={"width":375,"height":800},permissions=["clipboard-read","clipboard-write"]); pg=ctx.new_page(); errs=[]
        pg.on("pageerror",lambda e:errs.append(str(e))); pg.on("console",lambda m: errs.append(m.text) if m.type in("error","warning") else None)
        pg.goto(f"http://127.0.0.1:{port}/index.html"); pg.wait_for_timeout(400)
        ok("defaults: fee and buffer inputs are 0, no built-in fee", pg.input_value("#fee") in("0","") and pg.input_value("#buffer") in("0",""), pg.input_value("#fee")+"/"+pg.input_value("#buffer"))
        ok("defaults: base rate unchanged $57.29/hr", pg.inner_text("#rate-result")=="$57.29/hr", pg.inner_text("#rate-result"))
        det=pg.locator("details:has(#fee)")
        ok("adjustments section is collapsible and keyboard-focusable", pg.evaluate("!!document.querySelector('details:has(#fee) > summary')"))
        pg.evaluate("document.querySelector('details:has(#fee)').open=true")
        pg.fill("#fee","10"); pg.fill("#buffer","20"); pg.wait_for_timeout(250)
        txt=pg.inner_text(".result-card")
        ok("fee 10 + buffer 20 -> $76.39 shown", "$76.39" in txt, [l for l in txt.splitlines() if "$" in l][:6].__str__())
        ok("base rate $57.29 still shown separately", "$57.29" in txt)
        for bad,msg in (("100","between 0 and 50"),("-1","between 0 and 50"),("51","between 0 and 50")):
            pg.fill("#fee",bad); pg.wait_for_timeout(200)
            vis=pg.is_visible("#fee-error")
            ok(f"fee '{bad}' rejected with message", vis and pg.get_attribute("#fee","aria-invalid")=="true", pg.inner_text("#fee-error") if vis else "no error shown")
        pg.fill("#fee","10"); pg.fill("#buffer","150"); pg.wait_for_timeout(200)
        ok("buffer 150 rejected", pg.is_visible("#buffer-error"), pg.inner_text("#buffer-error"))
        pg.fill("#buffer","20"); pg.fill("#fee",""); pg.wait_for_timeout(200)
        ok("blank fee treated as 0 (no error)", not pg.is_visible("#fee-error"))
        pg.fill("#fee","10"); pg.wait_for_timeout(200); pg.click("#copy-result"); pg.wait_for_timeout(200)
        clip=pg.evaluate("navigator.clipboard.readText()"); res_clip=clip
        ok("copy summary includes fee, buffer and adjusted rate", "10" in clip and "20" in clip and "76.39" in clip, clip.replace("\n"," | ")[:300])
        ok("no overflow at 375px with adjustments open", not pg.evaluate("document.documentElement.scrollWidth>document.documentElement.clientWidth"))
        ok("no console errors/warnings", not errs, str(errs))
        b.close()
finally: srv.terminate()
for n,c,d in r: print(("PASS" if c else "FAIL"),n,(f"[{d}]" if d else ""))
print(sum(1 for _,c,_ in r if c),"passed,",sum(1 for _,c,_ in r if not c),"failed")
