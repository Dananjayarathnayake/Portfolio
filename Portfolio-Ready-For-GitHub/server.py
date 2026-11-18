import os
import sys
import json
import base64
import mimetypes
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse

PORT = 8080
DATA_FILE = os.path.join(os.path.dirname(__file__), 'portfolio_data.json')
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

class PortfolioRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable aggressive caching for live edits
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/data':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.wfile.write(b'{}')
            return
        
        if parsed.path in ('/', ''):
            self.path = '/main.html'

        # Default static file handling
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        
        # 1. Update Portfolio Data
        if parsed.path == '/api/data':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body.decode('utf-8'))
                with open(DATA_FILE, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True, 'message': 'Data updated successfully!'}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode('utf-8'))
            return

        # 2. Upload Image
        if parsed.path == '/api/upload':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            try:
                req = json.loads(body.decode('utf-8'))
                filename = req.get('filename', 'uploaded_image.png')
                # Clean filename
                clean_name = os.path.basename(filename).replace(' ', '_')
                data_b64 = req.get('data', '')
                if ',' in data_b64:
                    data_b64 = data_b64.split(',', 1)[1]
                
                file_bytes = base64.b64decode(data_b64)
                target_path = os.path.join(UPLOAD_DIR, clean_name)
                with open(target_path, 'wb') as f:
                    f.write(file_bytes)
                
                rel_url = f'uploads/{clean_name}'
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True, 'url': rel_url}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', PORT), PortfolioRequestHandler)
    print(f'Server listening on http://localhost:{PORT} with full API support...')
    server.serve_forever()
