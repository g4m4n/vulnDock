# Save this as `cors_http_server.py`
import http.server
import socketserver

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')  # Permite todas las solicitudes de cualquier origen
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')  # Métodos permitidos
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')  # Cabeceras permitidas
        super().end_headers()

if __name__ == "__main__":
    PORT = 8080
    Handler = CORSHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Sirviendo en el puerto {PORT}")
        httpd.serve_forever()
