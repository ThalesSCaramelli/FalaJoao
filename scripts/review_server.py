"""
Servidor local pequeno pra curadoria de imagens via navegador: upload de arquivo ou link,
salva direto em assets/images/<id>.jpg (mesmo otimizador dos outros scripts: thumbnail
480x480, JPEG q82). Não mexe em data.js -- isso continua manual, de proposito (ver
CONTENT_GUIDE.md).

Uso:
    python scripts/review_server.py [porta]   (padrao 8090)

Depois abra http://localhost:8090/review/upload.html
"""
import http.server
import io
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(ROOT, "assets", "images")


def optimize_and_save(src_bytes_or_path, item_id):
    from PIL import Image

    if isinstance(src_bytes_or_path, bytes):
        img = Image.open(io.BytesIO(src_bytes_or_path))
    else:
        img = Image.open(src_bytes_or_path)
    img = img.convert("RGB")
    img.thumbnail((480, 480), Image.LANCZOS)
    os.makedirs(ASSETS_DIR, exist_ok=True)
    dst = os.path.join(ASSETS_DIR, f"{item_id}.jpg")
    img.save(dst, "JPEG", quality=82)
    return f"assets/images/{item_id}.jpg"


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def send_json(self, code, obj):
        data = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        if self.path == "/api/upload":
            return self.handle_upload()
        if self.path == "/api/fetch-url":
            return self.handle_fetch_url()
        self.send_error(404)

    def handle_upload(self):
        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type or "boundary=" not in content_type:
            return self.send_json(400, {"ok": False, "error": "esperava multipart/form-data"})
        boundary = content_type.split("boundary=")[-1].strip().encode()
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)

        item_id = None
        file_bytes = None
        for part in body.split(b"--" + boundary):
            part = part.strip(b"\r\n")
            if not part or part == b"--":
                continue
            if b"\r\n\r\n" not in part:
                continue
            headers_raw, content = part.split(b"\r\n\r\n", 1)
            content = content[:-2] if content.endswith(b"\r\n") else content
            headers_text = headers_raw.decode("utf-8", errors="replace")
            disp_line = next((l for l in headers_text.split("\r\n") if l.lower().startswith("content-disposition")), "")
            name_m = re.search(r'name="([^"]+)"', disp_line)
            filename_m = re.search(r'filename="([^"]*)"', disp_line)
            field_name = name_m.group(1) if name_m else None
            if filename_m and filename_m.group(1):
                file_bytes = content
            elif field_name == "item_id":
                item_id = content.decode("utf-8", errors="replace")

        if not item_id or not file_bytes:
            return self.send_json(400, {"ok": False, "error": "faltando item_id ou arquivo"})
        try:
            path = optimize_and_save(file_bytes, item_id)
            self.send_json(200, {"ok": True, "path": path})
        except Exception as e:
            self.send_json(500, {"ok": False, "error": str(e)})

    def handle_fetch_url(self):
        length = int(self.headers.get("Content-Length", 0))
        try:
            payload = json.loads(self.rfile.read(length))
        except Exception:
            return self.send_json(400, {"ok": False, "error": "JSON invalido"})
        item_id = payload.get("item_id")
        url = payload.get("url")
        if not item_id or not url:
            return self.send_json(400, {"ok": False, "error": "faltando item_id ou url"})

        tmp = os.path.join(ASSETS_DIR, f"_tmp_{item_id}.download")
        res = subprocess.run(
            ["curl", "-s", "-m", "15", "-A", "FalaJoao-content-curation/1.0", "-o", tmp, url],
            capture_output=True,
        )
        if res.returncode != 0 or not os.path.exists(tmp) or os.path.getsize(tmp) < 500:
            if os.path.exists(tmp):
                os.remove(tmp)
            return self.send_json(400, {"ok": False, "error": "falha ao baixar a URL"})
        try:
            path = optimize_and_save(tmp, item_id)
            self.send_json(200, {"ok": True, "path": path})
        except Exception as e:
            self.send_json(500, {"ok": False, "error": str(e)})
        finally:
            if os.path.exists(tmp):
                os.remove(tmp)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8090
    os.chdir(ROOT)
    server = http.server.HTTPServer(("0.0.0.0", port), Handler)
    print(f"Servidor de curadoria em http://localhost:{port}/review/upload.html")
    server.serve_forever()
