"""
Curadoria de imagens reais (Openverse, CC0) pra itens de CONTENT — sempre com revisao manual
antes de qualquer imagem entrar no app (nunca aplica automaticamente).

Regra de imagem (ver DESIGN_BRIEF.md): objeto/animal/comida -> foto real; pessoa/emocao/situacao
-> ilustracao (query com "illustration"/"cartoon"); conceito abstrato (cor/numero/forma) -> fica
em emoji, nem passa por aqui.

Passo 1 — buscar candidatas e montar pagina de revisao:
    python scripts/curate_images.py fetch minha_lista.py
    (minha_lista.py e' um arquivo Python que define ITEMS = [(id, query), ...] -- ver exemplo
    no final deste arquivo)
    -> gera review/images/<id>/*.jpg e review/index.html

Passo 2 — abrir review/index.html no navegador (servir com `python -m http.server` na raiz do
projeto), escolher as fotos ou deixar em "manter emoji", clicar em "Gerar resultado", copiar o
JSON que aparece.

Passo 3 — aplicar a selecao escolhida:
    python scripts/curate_images.py apply selecao.json
    -> copia/otimiza pra assets/images/<id>.jpg e imprime as linhas prontas pra colar em data.js
       (o campo image ainda precisa ser adicionado a mao em data.js, de proposito -- e' rapido
       e evita um script mexendo em data.js sozinho)

Alternativa direta (uma imagem que voce ja escolheu, sem passar pelo Openverse) --
url ou caminho de arquivo local, sem revisao de candidatas (voce ja revisou ao escolher):
    python scripts/curate_images.py add <item_id> <url_ou_caminho_local>
    -> mesmo otimizador (thumbnail 480x480, JPEG q82) copia pra assets/images/<id>.jpg e
       imprime a linha pronta pra colar em data.js. Pra "upload": salve o arquivo em
       review/incoming/ (ou qualquer caminho) e passe o caminho como argumento.
"""
import json
import os
import subprocess
import sys
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REVIEW_DIR = os.path.join(ROOT, "review")
ASSETS_DIR = os.path.join(ROOT, "assets", "images")
API = "https://api.openverse.org/v1/images/"


def curl_get(url, out_path=None, timeout=8):
    # curl em vez de urllib: urllib.request.urlopen trava sem erro nesta maquina/rede, curl nao.
    cmd = ["curl", "-s", "-m", str(timeout), "-A", "FalaJoao-content-curation/1.0"]
    if out_path:
        cmd += ["-o", out_path]
    cmd += [url]
    return subprocess.run(cmd, capture_output=True, timeout=timeout + 3)


def fetch_candidates(query, n=2):
    params = urllib.parse.urlencode({"q": query, "license": "cc0", "page_size": n * 3, "mature": "false", "extension": "jpg,png"})
    r = curl_get(API + "?" + params, timeout=8)
    results = json.loads(r.stdout).get("results", [])
    results.sort(key=lambda it: -(min(it.get("width") or 1, it.get("height") or 1) / max(it.get("width") or 1, it.get("height") or 1)))
    return results[:n]


def cmd_fetch(list_path):
    sys.path.insert(0, os.path.dirname(os.path.abspath(list_path)))
    mod_name = os.path.splitext(os.path.basename(list_path))[0]
    items = __import__(mod_name).ITEMS

    manifest = []
    for id_, query in items:
        item_dir = os.path.join(REVIEW_DIR, "images", id_)
        os.makedirs(item_dir, exist_ok=True)
        candidates = fetch_candidates(query, 2)
        saved = []
        for i, c in enumerate(candidates):
            fname = f"{i + 1}.jpg"
            fpath = os.path.join(item_dir, fname)
            res = curl_get(c.get("thumbnail") or c.get("url"), fpath, timeout=8)
            if res.returncode == 0 and os.path.exists(fpath) and os.path.getsize(fpath) > 500:
                saved.append({"file": f"images/{id_}/{fname}", "title": c.get("title"), "creator": c.get("creator"), "source": c.get("foreign_landing_url"), "license": c.get("license")})
        manifest.append({"id": id_, "query": query, "candidates": saved})
        print(f"{id_}: {len(saved)} candidatas")

    os.makedirs(REVIEW_DIR, exist_ok=True)
    json.dump(manifest, open(os.path.join(REVIEW_DIR, "manifest.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    build_review_html(manifest)
    print(f"\nAbra review/index.html (via servidor local) pra revisar {len(manifest)} itens.")


def build_review_html(manifest):
    def item_html(item):
        cards = "".join(
            f'<label class="cand"><input type="radio" name="sel_{item["id"]}" value="{c["file"]}"/><img src="{c["file"]}" loading="lazy"/></label>'
            for c in item["candidates"]
        )
        cards += f'<label class="cand cand-emoji"><input type="radio" name="sel_{item["id"]}" value="EMOJI" checked/><div class="emoji-box">manter emoji</div></label>'
        return f'<div class="item-row" data-id="{item["id"]}"><div class="item-label"><strong>{item["id"]}</strong></div><div class="cands">{cards}</div></div>'

    rows = "".join(item_html(it) for it in manifest)
    html = f"""<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>Revisao de imagens</title>
<style>
body {{ font-family: sans-serif; background: #FFF8EC; padding: 20px; }}
.item-row {{ display: flex; align-items: center; gap: 16px; background: #fff; border-radius: 14px; padding: 12px; margin-bottom: 12px; }}
.cands {{ display: flex; gap: 10px; }}
.cand img {{ width: 84px; height: 84px; object-fit: cover; border-radius: 8px; }}
.cand input {{ position: absolute; opacity: 0; }}
.cand:has(input:checked) {{ outline: 3px solid #5FC98D; border-radius: 10px; }}
.emoji-box {{ width: 84px; height: 84px; display: flex; align-items: center; justify-content: center; background: #eee; border-radius: 8px; font-size: 0.7rem; text-align: center; }}
textarea {{ width: 100%; height: 120px; }}
</style></head><body>
<h1>Revisao de imagens</h1>
<div>{rows}</div>
<button id="gen">Gerar resultado</button>
<textarea id="out" readonly></textarea>
<script>
document.getElementById('gen').onclick = () => {{
  const out = {{}};
  document.querySelectorAll('.item-row').forEach(row => {{
    const checked = row.querySelector('input:checked');
    out[row.dataset.id] = checked ? checked.value : 'EMOJI';
  }});
  document.getElementById('out').value = JSON.stringify(out, null, 2);
}};
</script></body></html>"""
    open(os.path.join(REVIEW_DIR, "index.html"), "w", encoding="utf-8").write(html)


def cmd_apply(selection_path):
    from PIL import Image

    manifest = {m["id"]: m for m in json.load(open(os.path.join(REVIEW_DIR, "manifest.json"), encoding="utf-8"))}
    selection = json.load(open(selection_path, encoding="utf-8"))
    os.makedirs(ASSETS_DIR, exist_ok=True)

    print("Adicione estas linhas em data.js (campo image em cada item):\n")
    for item_id, rel_path in selection.items():
        if rel_path == "EMOJI":
            continue
        src = os.path.join(REVIEW_DIR, rel_path)
        img = Image.open(src).convert("RGB")
        img.thumbnail((480, 480), Image.LANCZOS)
        dst = os.path.join(ASSETS_DIR, f"{item_id}.jpg")
        img.save(dst, "JPEG", quality=82)
        print(f'  {item_id}: image: "assets/images/{item_id}.jpg",')
    print("\nNao esqueca de rodar generate_audio.py se os itens tambem forem novos, e de\nsubir o CACHE_NAME em sw.js antes de publicar.")


def cmd_add(item_id, source):
    from PIL import Image

    os.makedirs(ASSETS_DIR, exist_ok=True)
    dst = os.path.join(ASSETS_DIR, f"{item_id}.jpg")

    if source.startswith("http://") or source.startswith("https://"):
        tmp = dst + ".download"
        res = curl_get(source, tmp, timeout=15)
        if res.returncode != 0 or not os.path.exists(tmp) or os.path.getsize(tmp) < 500:
            print(f"Falha ao baixar {source} (curl retornou {res.returncode}).")
            sys.exit(1)
        src_path = tmp
    else:
        if not os.path.exists(source):
            print(f"Arquivo não encontrado: {source}")
            sys.exit(1)
        src_path = source

    img = Image.open(src_path).convert("RGB")
    img.thumbnail((480, 480), Image.LANCZOS)
    img.save(dst, "JPEG", quality=82)
    if source.startswith("http"):
        os.remove(src_path)

    print(f'Salvo: assets/images/{item_id}.jpg')
    print(f'\nAdicione em data.js (campo image no item "{item_id}"):')
    print(f'  image: "assets/images/{item_id}.jpg",')


if __name__ == "__main__":
    if sys.argv[1:2] == ["fetch"] and len(sys.argv) == 3:
        cmd_fetch(sys.argv[2])
    elif sys.argv[1:2] == ["apply"] and len(sys.argv) == 3:
        cmd_apply(sys.argv[2])
    elif sys.argv[1:2] == ["add"] and len(sys.argv) == 4:
        cmd_add(sys.argv[2], sys.argv[3])
    else:
        print(__doc__)
        sys.exit(1)

# Exemplo de arquivo de lista (salve como minha_lista.py e passe pro comando fetch):
# ITEMS = [
#     ("food_pizza", "pizza slice food"),
#     ("family_uncle", "man illustration cartoon"),
# ]
