import sys, subprocess, time
from playwright.sync_api import sync_playwright
repo=sys.argv[1]; port=sys.argv[2]
srv=subprocess.Popen(["python3","-I","-m","http.server",port,"--bind","127.0.0.1"],cwd=repo,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
r=[]
try:
    with sync_playwright() as p:
        b=p.chromium.launch(); ctx=b.new_context(permissions=["clipboard-read","clipboard-write"],viewport={"width":375,"height":800})
        pg=ctx.new_page(); pg.goto(f"http://127.0.0.1:{port}/index.html"); pg.wait_for_timeout(400)
        # 1) copy status cleared when result is invalidated
        pg.click("#copy-result"); pg.wait_for_timeout(200)
        before=pg.inner_text("#copy-status")
        pg.fill("#income",""); pg.wait_for_timeout(200)
        after=pg.inner_text("#copy-status")
        r.append(("copy status shown after copy", before=="Summary copied.", before))
        r.append(("copy status cleared when result invalidated", after=="", repr(after)))
        pg.fill("#income","60000"); pg.wait_for_timeout(200)
        # 2) billable error element is wired and shown when validation fails
        r.append(("billable-error exists + referenced by aria-describedby", pg.evaluate("!!document.getElementById('billable-error')") and "billable-error" in (pg.get_attribute("#billable","aria-describedby") or ""), pg.get_attribute("#billable","aria-describedby")))
        pg.evaluate("""()=>{const s=document.getElementById('billable');s.min='0';s.value='5';s.dispatchEvent(new Event('input',{bubbles:true}));}""")
        pg.wait_for_timeout(200)
        vis=pg.is_visible("#billable-error"); txt=pg.inner_text("#billable-error") if vis else ""
        r.append(("invalid billable: error visible with message", vis and "between 10% and 100%" in txt, txt))
        r.append(("invalid billable: aria-invalid set", pg.get_attribute("#billable","aria-invalid")=="true", pg.get_attribute("#billable","aria-invalid")))
        pg.evaluate("""()=>{const s=document.getElementById('billable');s.min='10';s.value='60';s.dispatchEvent(new Event('input',{bubbles:true}));}""")
        pg.wait_for_timeout(200)
        r.append(("billable valid again: error hidden, rate restored", (not pg.is_visible("#billable-error")) and pg.inner_text("#rate-result")=="$57.29/hr", pg.inner_text("#rate-result")))
        b.close()
finally: srv.terminate()
for n,ok,d in r: print(("PASS" if ok else "FAIL"),n,f"[{d}]")
print(f"{sum(1 for _,o,_ in r if o)} passed, {sum(1 for _,o,_ in r if not o)} failed")
