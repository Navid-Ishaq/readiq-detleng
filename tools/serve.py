"""Build, preview, and refresh automatically after local content changes."""
import functools,threading,time,webbrowser
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from build import build,ROOT
build()
def signature():
 return [(str(p.relative_to(ROOT)),p.stat().st_mtime_ns,p.stat().st_size) for p in sorted(ROOT.rglob('*')) if (p.is_file() and '_site' not in p.parts and '__pycache__' not in p.parts and '.git' not in p.parts)]
def watch():
 previous=signature()
 while True:
  time.sleep(3)
  current=signature()
  if current!=previous:
   try:build();previous=current
   except Exception as exc:print('Build error:',exc,flush=True)
class Handler(SimpleHTTPRequestHandler):
 def end_headers(self):self.send_header('Cache-Control','no-store');super().end_headers()
server=ThreadingHTTPServer(('127.0.0.1',8101),functools.partial(Handler,directory=str(ROOT/'_site')))
threading.Thread(target=watch,daemon=True).start()
print('DeTLeng Read IQ: http://127.0.0.1:8101/ — keep this window open.',flush=True)
threading.Timer(.8,lambda:webbrowser.open('http://127.0.0.1:8101/')).start()
try:server.serve_forever()
except KeyboardInterrupt:pass
finally:server.server_close()
