import http.server
import socketserver

PORT = 8666

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Deteksi semua file berakhiran .js atau yang berada di dalam folder assets dengan ekstensi .js
        if self.path.endswith(".js") or ".js?" in self.path or "/assets/" in self.path and self.path.endswith((".js", ".css")):
            if self.path.endswith(".js"):
                self.send_header("Content-Type", "application/javascript")
            elif self.path.endswith(".css"):
                self.send_header("Content-Type", "text/css")
        super().end_headers()

Handler = MyHttpRequestHandler
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()