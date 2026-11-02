"""Local check of the framing policy in `_headers` (deny by default).

Starts two servers on different origins: a RateNest server that applies the rules of `_headers` (the documented Cloudflare Pages
format: a path pattern line, then indented `Name: value` lines; `*` matches any text; matching rules add their headers) and a
"publisher" server whose page iframes RateNest pages. It proves how Chromium treats the headers; it does NOT prove that Cloudflare
parses the file the same way, so the headers must still be confirmed on a Cloudflare preview with `curl -I`.

Usage: python3 -I tools/browser-checks/frame-headers.py <repo path> <free port>   (uses <port> and <port>+1)
"""
import sys, re, threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright
repo, port = os.path.abspath(sys.argv[1]), int(sys.argv[2])
r = []
def ok(n, c, d=""): r.append((n, bool(c), d))

def parse_rules(text):
    rules, current = [], None
    for line in text.splitlines():
        if not line.strip() or line.lstrip().startswith("#"): continue
        if not line[0].isspace(): current = (line.strip(), []); rules.append(current)
        elif current is not None: current[1].append(line.strip())
    return rules

def headers_for(path, rules):
    out = {}
    for pattern, lines in rules:
        if not re.fullmatch(re.escape(pattern).replace(r"\*", ".*"), path): continue
        for line in lines:
            if line.startswith("!"): out.pop(line[1:].strip().lower(), None); continue
            name, value = line.split(":", 1); name = name.strip().lower()
            out[name] = f"{out[name]}, {value.strip()}" if name in out else value.strip()
    return out

def make_server(directory, bind_port, rules):
    class H(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **k): super().__init__(*a, directory=directory, **k)
        def end_headers(self):
            for k, v in headers_for(self.path.split("?")[0], rules).items(): self.send_header(k, v)
            super().end_headers()
        def log_message(self, *a): pass
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.TCPServer(("127.0.0.1", bind_port), H); threading.Thread(target=srv.serve_forever, daemon=True).start(); return srv

rules = parse_rules(open(os.path.join(repo, "_headers"), encoding="utf8").read())
site_rules_none = []
pub_dir = os.path.join(os.environ.get("TMPDIR", "/tmp"), f"frame-pub-{port}"); os.makedirs(pub_dir, exist_ok=True)
SITE = f"http://127.0.0.1:{port}"
def publisher_page(target): return f'<!doctype html><title>host</title><iframe id="f" src="{SITE}{target}" width="800" height="600"></iframe>'
for name in ("index.html", "project-pricing.html", "retainer-pricing.html", "how-to-price-a-freelance-project.html"):
    open(os.path.join(pub_dir, "host-" + name), "w", encoding="utf8").write(publisher_page("/" + name))
srv_site = make_server(repo, port, rules); srv_pub = make_server(pub_dir, port + 1, [])
# Control: the same site served WITHOUT any header rules, to prove the test can tell framed from refused.
srv_open = make_server(repo, port + 2, [])
with open(os.path.join(pub_dir, "host-open.html"), "w", encoding="utf8") as fh: fh.write(f'<!doctype html><title>host</title><iframe id="f" src="http://127.0.0.1:{port + 2}/index.html" width="800" height="600"></iframe>')
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        def framed_url(host_page):
            pg = b.new_page(); pg.goto(f"http://127.0.0.1:{port + 1}/{host_page}"); pg.wait_for_timeout(1200)
            frames = [f for f in pg.frames if f != pg.main_frame]; url = frames[0].url if frames else "(no frame)"; pg.close(); return url
        ok("control: with no header rules the page is framed normally", framed_url("host-open.html").startswith(f"http://127.0.0.1:{port + 2}/"), framed_url("host-open.html"))
        for name in ("index.html", "project-pricing.html", "retainer-pricing.html", "how-to-price-a-freelance-project.html"):
            url = framed_url("host-" + name)
            ok(f"framing {name} from another origin is refused", url.startswith("chrome-error:") or url == "about:blank" or not url.startswith(SITE), url)
        hdr = headers_for("/project-pricing.html", rules)
        ok("page response carries frame-ancestors 'none' and X-Frame-Options DENY", "frame-ancestors 'none'" in hdr.get("content-security-policy", "") and hdr.get("x-frame-options") == "DENY", str(hdr))
        ok("the CSP sets only frame-ancestors (nothing else is restricted)", hdr.get("content-security-policy", "").strip() == "frame-ancestors 'none'", hdr.get("content-security-policy", ""))
        ok("internal paths keep their noindex rule and also get the framing policy", headers_for("/docs/STATUS.md", rules).get("x-robots-tag") == "noindex, nofollow" and headers_for("/docs/STATUS.md", rules).get("x-frame-options") == "DENY")
        pg = b.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type in ("error", "warning") else None)
        pg.goto(f"{SITE}/project-pricing.html"); pg.wait_for_timeout(500)
        ok("opened directly (not framed) the calculator still loads and calculates", pg.inner_text("#quote-total") == "$1,350.00" and not errs, str(errs))
        b.close()
finally:
    for s in (srv_site, srv_pub, srv_open): s.shutdown()
for n, c, d in r: print(("PASS" if c else "FAIL"), n, (f"[{d}]" if d else ""))
print(sum(1 for _, c, _ in r if c), "passed,", sum(1 for _, c, _ in r if not c), "failed")
