import sys, subprocess, time, json
from playwright.sync_api import sync_playwright
repo,port=sys.argv[1],sys.argv[2]
srv=subprocess.Popen(["python3","-I","-m","http.server",port,"--bind","127.0.0.1"],cwd=repo,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
JS = r"""
() => {
  const parse = c => { const m=c.match(/rgba?\(([^)]+)\)/); if(!m) return [0,0,0,0]; const p=m[1].split(',').map(s=>parseFloat(s)); return [p[0],p[1],p[2],p.length>3?p[3]:1]; };
  const over = (f,b) => { const a=f[3]; return [f[0]*a+b[0]*(1-a), f[1]*a+b[1]*(1-a), f[2]*a+b[2]*(1-a), 1]; };
  const bgOf = el => { const stack=[]; for(let e=el;e;e=e.parentElement){ const c=parse(getComputedStyle(e).backgroundColor); if(c[3]>0) stack.push(c); if(c[3]===1) break; } let base=[255,255,255,1]; for(const c of stack.reverse()) base=over(c,base); return base; };
  const lum = c => { const v=[c[0],c[1],c[2]].map(x=>{x/=255; return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)}); return .2126*v[0]+.7152*v[1]+.0722*v[2]; };
  const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p); return (x+.05)/(y+.05); };
  const out={contrast:[],names:[],headings:[],small:[],dupIds:[]};
  const seen=new Set();
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
    const t=walker.currentNode; if(!t.textContent.trim()) continue; const el=t.parentElement;
    if(seen.has(el)) continue; seen.add(el);
    const cs=getComputedStyle(el); const r=el.getBoundingClientRect();
    if(cs.visibility==='hidden'||cs.display==='none'||r.width===0||r.height===0) continue;
    if(el.closest('.sr-only,[hidden],noscript,script,style')) continue;
    const bg=bgOf(el); const fg=over(parse(cs.color),bg);
    const size=parseFloat(cs.fontSize); const bold=parseInt(cs.fontWeight)>=700;
    const large = size>=24 || (size>=18.66 && bold);
    const need=large?3:4.5; const cr=ratio(fg,bg);
    if(cr<need) out.contrast.push({text:t.textContent.trim().slice(0,40), cls:el.className||el.tagName, ratio:+cr.toFixed(2), need, size});
  }
  for(const el of document.querySelectorAll('a,button,input,select,summary')){
    const r=el.getBoundingClientRect(); if(r.width===0) continue;
    const name=(el.getAttribute('aria-label')||el.labels?.[0]?.textContent||el.textContent||el.getAttribute('title')||'').trim();
    if(!name) out.names.push(el.outerHTML.slice(0,80));
  }
  let prev=0; for(const h of document.querySelectorAll('h1,h2,h3,h4')){ const l=+h.tagName[1]; out.headings.push(h.tagName+':'+h.textContent.trim().slice(0,25)); if(prev && l>prev+1) out.small.push('heading jump '+prev+'->'+l); prev=l; }
  const ids=[...document.querySelectorAll('[id]')].map(e=>e.id); out.dupIds=ids.filter((x,i)=>ids.indexOf(x)!==i);
  out.landmarks={main:document.querySelectorAll('main').length, header:document.querySelectorAll('header').length, footer:document.querySelectorAll('footer').length};
  return out;
}
"""
try:
    with sync_playwright() as p:
        b=p.chromium.launch()
        # (page, state, label) — the project quote page was added with Phase 3
        CASES=[("index.html",s) for s in ("default","error","adjusted")]+[("project-pricing.html",s) for s in ("default","error","large")]+[("retainer-pricing.html",s) for s in ("default","error","large")]
        for page,state in CASES:
            tag=({"index.html":"","project-pricing.html":"project ","retainer-pricing.html":"retainer "}[page])+state
            for w in (320,1280):
                pg=b.new_page(viewport={"width":w,"height":900}); pg.goto(f"http://127.0.0.1:{port}/{page}"); pg.wait_for_timeout(300)
                if page=="index.html":
                    if state=="error": pg.fill("#income",""); pg.wait_for_timeout(200)
                    if state=="adjusted": pg.click("#adjustments summary"); pg.fill("#fee","10"); pg.fill("#buffer","10"); pg.wait_for_timeout(250)
                elif page=="retainer-pricing.html":
                    if state=="error": pg.fill("#monthlyHours",""); pg.click(".calculate-button"); pg.wait_for_timeout(250)
                    if state=="large": pg.fill("#monthlyHours","160"); pg.fill("#hourlyRate","500"); pg.fill("#discountPercent","5"); pg.fill("#months","24"); pg.wait_for_timeout(250)
                else:
                    if state=="error": pg.fill("#estimatedHours",""); pg.click(".calculate-button"); pg.wait_for_timeout(250)
                    if state=="large": pg.fill("#estimatedHours","500"); pg.fill("#hourlyRate","150"); pg.fill("#directExpenses","25000"); pg.fill("#bufferPercent","30"); pg.wait_for_timeout(250)
                r=pg.evaluate(JS)
                print(f"[{tag} @{w}] contrast failures: {len(r['contrast'])}; unnamed controls: {len(r['names'])}; dup ids: {r['dupIds']}; notes: {r['small']}")
                for c in r["contrast"]: print("   LOW CONTRAST", c)
                if state=="default" and w==1280: print("   headings:", r["headings"]); print("   landmarks:", r["landmarks"])
                pg.close()
        # Every focusable element must show a visible focus indicator; reflow at 200% text on 320 px
        for page in ("index.html","project-pricing.html","retainer-pricing.html"):
            pg=b.new_page(viewport={"width":375,"height":900}); pg.goto(f"http://127.0.0.1:{port}/{page}"); pg.wait_for_timeout(300)
            bad=[]
            for _ in range(14):
                pg.keyboard.press("Tab")
                info=pg.evaluate("""()=>{const e=document.activeElement;const c=getComputedStyle(e);return {id:e.id||e.className||e.tagName, ow:parseFloat(c.outlineWidth), os:c.outlineStyle, bs:c.boxShadow}}""")
                if info["os"]=="none" or info["ow"]<2:
                    if info["bs"]=="none": bad.append(info)
            print(f"[focus {page}] elements without a >=2px outline or box-shadow:", bad)
            pg.add_style_tag(content="html{font-size:200%}"); pg.set_viewport_size({"width":320,"height":900}); pg.wait_for_timeout(200)
            print(f"[zoom {page}] horizontal overflow at 320px with 200% text:", pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth"))
            pg.close()
        b.close()
finally: srv.terminate()
