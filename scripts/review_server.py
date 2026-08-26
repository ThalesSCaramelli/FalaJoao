"""
Servidor local pra "estudio de conteudo" via navegador: adicionar palavra nova, curar imagem
(upload/link), gravar ou enviar audio (voz da familia, nao so TTS). Roda 100% local, sem
dependencia externa alem do que o projeto ja usa (Pillow, edge-tts).

Uso:
    python scripts/review_server.py [porta]   (padrao 8090)

Depois abra http://localhost:8090/review/upload.html

Regra que continua valendo (CONTENT_GUIDE.md): imagem/audio nunca aplicados sem alguem olhar --
aqui quem esta escolhendo é a propria pessoa preenchendo o formulario, entao a "revisao" é o
formulario em si. Ao adicionar uma palavra nova, o servidor SO grava em data.js depois de
validar (id unico, campos obrigatorios) e SO confirma sucesso depois de `node --check` passar --
se falhar, desfaz a escrita e devolve o arquivo como estava.
"""
import http.server
import io
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES_DIR = os.path.join(ROOT, "assets", "images")
AUDIO_DIR = os.path.join(ROOT, "assets", "audio", "en")
DATA_JS = os.path.join(ROOT, "data.js")

AUDIO_EXTS = ["mp3", "webm", "ogg", "m4a", "wav"]
CATEGORIES = ["survival", "colors", "numbers", "shapes", "animals", "food", "body", "family", "clothes", "school", "combos", "phrases"]


# ===================== multipart/form-data (parser manual -- `cgi` foi removido no Python 3.13) =====================
def parse_multipart(body, boundary):
    fields, files = {}, {}
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
        if not field_name:
            continue
        if filename_m and filename_m.group(1):
            files[field_name] = {"filename": filename_m.group(1), "content": content}
        else:
            fields[field_name] = content.decode("utf-8", errors="replace")
    return fields, files


# ===================== imagens =====================
def optimize_and_save_image(src_bytes_or_path, item_id):
    from PIL import Image

    if isinstance(src_bytes_or_path, bytes):
        img = Image.open(io.BytesIO(src_bytes_or_path))
    else:
        img = Image.open(src_bytes_or_path)
    img = img.convert("RGB")
    img.thumbnail((480, 480), Image.LANCZOS)
    os.makedirs(IMAGES_DIR, exist_ok=True)
    dst = os.path.join(IMAGES_DIR, f"{item_id}.jpg")
    img.save(dst, "JPEG", quality=82)
    return f"assets/images/{item_id}.jpg"


# ===================== audio (gravado/enviado -- fica no formato que vier, sem depender de ffmpeg) =====================
def ext_from_filename_or_type(filename, content_type):
    if filename and "." in filename:
        ext = filename.rsplit(".", 1)[-1].lower()
        if ext in AUDIO_EXTS:
            return ext
    if content_type:
        for ext in AUDIO_EXTS:
            if ext in content_type:
                return ext
    return "webm"


def save_audio(item_id, content, ext):
    os.makedirs(AUDIO_DIR, exist_ok=True)
    for old_ext in AUDIO_EXTS:
        old_path = os.path.join(AUDIO_DIR, f"{item_id}.{old_ext}")
        if os.path.exists(old_path):
            os.remove(old_path)
    dst = os.path.join(AUDIO_DIR, f"{item_id}.{ext}")
    with open(dst, "wb") as f:
        f.write(content)
    return f"assets/audio/en/{item_id}.{ext}"


# ===================== data.js: leitura (regex, mesmo padrao dos outros scripts) e escrita validada =====================
def read_content_items():
    text = open(DATA_JS, encoding="utf-8").read()
    block = text.split("const CONTENT = [", 1)[1]
    block = block.rsplit("\n];", 1)[0]
    items = []
    for m in re.finditer(r'\{[^{}]*?id:\s*"([^"]+)"[^{}]*?\}', block):
        chunk = m.group(0)
        def field(name):
            fm = re.search(name + r':\s*"([^"]*)"', chunk)
            return fm.group(1) if fm else None
        items.append({
            "id": m.group(1),
            "en": field("en"),
            "pt": field("pt"),
            "category": field("category"),
            "hasImage": "image:" in chunk,
        })
    return items


def append_content_item(item_id, content_type, en, pt, emoji, category, difficulty):
    original = open(DATA_JS, encoding="utf-8").read()
    escaped = lambda s: s.replace("\\", "\\\\").replace('"', '\\"')
    line = (
        f'  {{ id: "{item_id}", contentType: "{content_type}", en: "{escaped(en)}", '
        f'pt: "{escaped(pt)}", emoji: "{emoji}", category: "{category}", difficulty: {difficulty}, prerequisites: [] }},\n'
        f'];'
    )
    if "\nconst CONTENT = [" not in original or not original.rstrip().endswith("];"):
        raise RuntimeError("estrutura inesperada em data.js -- abortando pra nao arriscar corromper o arquivo")
    # substitui só o ULTIMO "];" do arquivo (fecha o array CONTENT, que é o último array do arquivo)
    idx = original.rstrip().rfind("\n];")
    new_content = original[:idx] + "\n" + line + original[idx + len("\n];"):]

    with open(DATA_JS, "w", encoding="utf-8", newline="") as f:
        f.write(new_content)

    check = subprocess.run(["node", "--check", DATA_JS], capture_output=True, text=True)
    if check.returncode != 0:
        with open(DATA_JS, "w", encoding="utf-8", newline="") as f:
            f.write(original)
        raise RuntimeError("data.js não passou no node --check depois da escrita -- desfeito. Detalhe: " + check.stderr[:300])


async def gen_tts(text, path):
    import edge_tts
    await edge_tts.Communicate(text, "en-AU-NatashaNeural").save(path)


def generate_word_audio(item_id, en):
    import asyncio
    os.makedirs(AUDIO_DIR, exist_ok=True)
    path = os.path.join(AUDIO_DIR, f"{item_id}.mp3")
    try:
        asyncio.run(gen_tts(en, path))
        return True
    except Exception:
        return False


# ===================== servidor =====================
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

    def read_json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(length))

    def do_GET(self):
        if self.path == "/api/items":
            items = read_content_items()
            missing_image = [it for it in items if not it["hasImage"] and it["category"] in ("animals", "food", "body", "family", "clothes", "school")]
            return self.send_json(200, {"all": items, "missingImage": missing_image, "categories": CATEGORIES})
        return super().do_GET()

    def do_POST(self):
        try:
            if self.path == "/api/upload":
                return self.handle_image_upload()
            if self.path == "/api/fetch-url":
                return self.handle_image_url()
            if self.path == "/api/audio-upload":
                return self.handle_audio_upload()
            if self.path == "/api/add-word":
                return self.handle_add_word()
        except Exception as e:
            return self.send_json(500, {"ok": False, "error": str(e)})
        self.send_error(404)

    def handle_image_upload(self):
        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type or "boundary=" not in content_type:
            return self.send_json(400, {"ok": False, "error": "esperava multipart/form-data"})
        boundary = content_type.split("boundary=")[-1].strip().encode()
        body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        fields, files = parse_multipart(body, boundary)
        item_id = fields.get("item_id")
        file_ = files.get("file")
        if not item_id or not file_:
            return self.send_json(400, {"ok": False, "error": "faltando item_id ou arquivo"})
        path = optimize_and_save_image(file_["content"], item_id)
        self.send_json(200, {"ok": True, "path": path})

    def handle_image_url(self):
        payload = self.read_json_body()
        item_id, url = payload.get("item_id"), payload.get("url")
        if not item_id or not url:
            return self.send_json(400, {"ok": False, "error": "faltando item_id ou url"})
        tmp = os.path.join(IMAGES_DIR, f"_tmp_{item_id}.download")
        res = subprocess.run(["curl", "-s", "-m", "15", "-A", "FalaJoao-content-curation/1.0", "-o", tmp, url], capture_output=True)
        if res.returncode != 0 or not os.path.exists(tmp) or os.path.getsize(tmp) < 500:
            if os.path.exists(tmp):
                os.remove(tmp)
            return self.send_json(400, {"ok": False, "error": "falha ao baixar a URL"})
        try:
            path = optimize_and_save_image(tmp, item_id)
            self.send_json(200, {"ok": True, "path": path})
        finally:
            if os.path.exists(tmp):
                os.remove(tmp)

    def handle_audio_upload(self):
        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type or "boundary=" not in content_type:
            return self.send_json(400, {"ok": False, "error": "esperava multipart/form-data"})
        boundary = content_type.split("boundary=")[-1].strip().encode()
        body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        fields, files = parse_multipart(body, boundary)
        item_id = fields.get("item_id")
        file_ = files.get("file")
        if not item_id or not file_:
            return self.send_json(400, {"ok": False, "error": "faltando item_id ou arquivo"})
        ext = ext_from_filename_or_type(file_["filename"], fields.get("mime", ""))
        path = save_audio(item_id, file_["content"], ext)
        self.send_json(200, {"ok": True, "path": path})

    def handle_add_word(self):
        payload = self.read_json_body()
        item_id = (payload.get("id") or "").strip()
        en = (payload.get("en") or "").strip()
        pt = (payload.get("pt") or "").strip()
        emoji = (payload.get("emoji") or "").strip()
        category = (payload.get("category") or "").strip()
        content_type = (payload.get("contentType") or "word").strip()
        difficulty = payload.get("difficulty", 1)

        if not re.match(r"^[a-z][a-z0-9_]*$", item_id):
            return self.send_json(400, {"ok": False, "error": "id inválido -- só minúsculas, números e _, começando com letra"})
        if not en or not pt or not emoji:
            return self.send_json(400, {"ok": False, "error": "falta preencher inglês, português ou emoji"})
        if category not in CATEGORIES:
            return self.send_json(400, {"ok": False, "error": "categoria inválida"})
        if content_type not in ("word", "phrase", "sentence"):
            return self.send_json(400, {"ok": False, "error": "tipo inválido"})
        try:
            difficulty = int(difficulty)
            assert 1 <= difficulty <= 5
        except Exception:
            return self.send_json(400, {"ok": False, "error": "difficulty tem que ser 1-5"})

        existing_ids = {it["id"] for it in read_content_items()}
        if item_id in existing_ids:
            return self.send_json(400, {"ok": False, "error": f'id "{item_id}" já existe'})

        append_content_item(item_id, content_type, en, pt, emoji, category, difficulty)
        audio_ok = generate_word_audio(item_id, en)
        self.send_json(200, {"ok": True, "id": item_id, "audioGenerated": audio_ok})


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8090
    os.chdir(ROOT)
    # ThreadingHTTPServer, não HTTPServer puro -- o navegador abre várias conexões ao mesmo
    # tempo (troca de aba, buscas em paralelo) e um servidor de conexão única emperra todo
    # mundo esperando a primeira liberar (foi exatamente isso que quebrou no meio do teste).
    server = http.server.ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"Servidor de curadoria em http://localhost:{port}/review/upload.html")
    server.serve_forever()
