"""
Baixa os emoji do Fluent Emoji 3D (Microsoft, licenca MIT) usados em data.js, pra que o app
desenhe todos do mesmo jeito em qualquer celular (emoji de texto muda de aparelho pra aparelho).

Uso (idempotente — o que ja foi baixado e' reaproveitado; rode de novo ao adicionar emoji novo):
    python scripts/fetch_fluent_emoji.py            # extrai de data.js, baixa, gera manifest + EMOJI_ASSETS
    python scripts/fetch_fluent_emoji.py --force    # rebaixa tudo
    python scripts/fetch_fluent_emoji.py --dry-run  # so mostra o que resolveria

O que faz:
  1. Le data.js, engine.js e app.js e pega todo emoji dos campos `emoji:`, `icon:` e `speaker:`
     (CONTENT, CATEGORY_META, SITUATIONS, SCENARIOS, perfis, minigames...), mais a lista EXTRA.
  2. Quebra combinacoes ("🏊❓") em emoji individuais; sequencias ZWJ (👨‍👩‍👧), seletor de variacao
     (U+FE0F), tom de pele e bandeiras ficam inteiras.
  3. Resolve a URL em raw.githubusercontent.com/microsoft/fluentui-emoji (pasta = nome CLDR com
     a 1a letra maiuscula; arquivo = nome em minusculas com "_"), baixa, redimensiona pra 160x160
     e otimiza o PNG em assets/emoji/<codepoints>.png (codepoints em hex minusculo, sem FE0F,
     separados por "-").
  4. Gera assets/emoji/manifest.json e o bloco `EMOJI_ASSETS` dentro de data.js (entre os
     marcadores EMOJI_ASSETS:begin/end) — inline, pra funcionar offline sem fetch extra.
  5. Baixa o LICENSE do Fluent pra assets/emoji/LICENSE-fluentui-emoji.txt.

Emoji que nao resolvem ficam fora do manifest e o app cai no emoji de texto (emojiHtml em app.js).
Pra resolver um que falhou, ache a pasta certa em
https://github.com/microsoft/fluentui-emoji/tree/main/assets e ponha em OVERRIDES abaixo.
Requer Pillow (pip install pillow). Opcional: `pip install emoji` (nomes CLDR; acha bem mais pastas).
"""
import io
import json
import re
import sys
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "emoji"
BASE = "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/"
SIZE = 160

# codepoints (sem FE0F, ver cp_key) -> nome da pasta no Fluent, pros que nao resolvem sozinhos.
OVERRIDES = {"1f53a": "Red triangle"}

# codepoints -> caminho exato (relativo a BASE) quando a variante padrao nao serve. O 🙏 amarelo do
# Fluent 3D, pequeno, vira um formato amarelo+roxo ilegivel (maos + mangas roxas); a variante de tom
# "Medium-Light" fica com cara de maos juntas (e tem contraste com o fundo creme, ao contrario da "Light").
# Pra voltar ao amarelo, remova a entrada e rode com --force.
URL_OVERRIDES = {
    "1f64f": "assets/Folded%20hands/Medium-Light/3D/folded_hands_3d_medium-light.png",
}

# O Fluent 3D nao tem familia, "pessoas de maos dadas" nem casal de maos dadas. Pra esses, o script
# monta o PNG juntando emoji individuais lado a lado: codepoints -> lista de emoji componentes.
# Crianca (CHILDREN) fica menor, na frente e no centro de baixo.
COMPOSE = {
    "1f468-200d-1f469-200d-1f467": ["👨", "👩", "👧"],
    "1f468-200d-1f469-200d-1f466": ["👨", "👩", "👦"],
    "1f46b": ["👨", "👩"],
    "1f9d1-200d-1f91d-200d-1f9d1": ["🧑", "🧑"],
}
CHILDREN = {"1f466", "1f467"}

ZWJ, VS16 = "‍", "️"
SKIN = range(0x1F3FB, 0x1F400)


def is_regional(ch):
    return 0x1F1E6 <= ord(ch) <= 0x1F1FF


def is_emoji_base(ch):
    o = ord(ch)
    return (o >= 0x1F000 or 0x2190 <= o <= 0x2BFF or o in (0xA9, 0xAE, 0x203C, 0x2049, 0x2122, 0x2139, 0x3030, 0x303D)) \
        and o not in SKIN


def split_emoji(s):
    """Quebra uma string em sequencias de emoji (ZWJ inteiras, bandeiras em par, keycaps)."""
    out, i = [], 0
    while i < len(s):
        ch = s[i]
        if ch in "0123456789#*" and "⃣" in s[i + 1:i + 3]:
            j = i + 1
            while j < len(s) and s[j] in (VS16, "⃣"):
                j += 1
            out.append(s[i:j]); i = j; continue
        if is_regional(ch) and i + 1 < len(s) and is_regional(s[i + 1]):
            out.append(s[i:i + 2]); i += 2; continue
        if not is_emoji_base(ch):
            i += 1; continue
        j = i + 1
        while j < len(s):
            if s[j] == VS16 or ord(s[j]) in SKIN:
                j += 1
            elif s[j] == ZWJ and j + 1 < len(s) and is_emoji_base(s[j + 1]):
                j += 2
            else:
                break
        out.append(s[i:j]); i = j
    return out


def cp_key(seq):
    return "-".join(f"{ord(c):x}" for c in seq if c != VS16)


# Emoji usados direto no codigo (fallbacks em app.js), que nao aparecem num campo emoji:/icon:/speaker:
EXTRA = ["👩‍🏫"]


def extract(path):
    text = path.read_text(encoding="utf8")
    found = {}
    for m in re.finditer(r'\b(?:emoji|icon|speaker)\s*:\s*"([^"]*)"', text):
        for e in split_emoji(m.group(1)):
            found[cp_key(e)] = e
    return found


def names_for(seq):
    """Nomes candidatos (minusculos) do emoji: CLDR via pacote `emoji` (se instalado) + unicodedata."""
    names = []
    try:
        import emoji as emoji_pkg
        for k in (seq, seq.replace(VS16, ""), seq + VS16 if VS16 not in seq else seq):
            d = emoji_pkg.EMOJI_DATA.get(k)
            if d:
                for n in [d.get("en")] + list(d.get("alias", [])):
                    n = n.strip(":").replace("_", " ").replace("&", "and").lower()
                    n = re.sub(r"\s+", " ", n).strip()
                    names.append(re.sub(r"[,’']", "", n))
                break
    except ImportError:
        pass
    chars = [c for c in seq if c != VS16 and ord(c) not in SKIN]
    if len(chars) == 1:
        names.append(unicodedata.name(chars[0], "").lower())
    return [n for n in names if n]


def variants(name):
    """Variacoes de nome que o Fluent costuma usar."""
    names = [name]
    names.append(name[:-5] if name.endswith(" face") else name + " face")
    for a in ("white ", "black ", "heavy ", "large ", "medium "):
        if name.startswith(a):
            names.append(name[len(a):])
    if name.endswith(" symbol"):
        names.append(name[:-7])
    names.append(name.replace(" sign", ""))
    return list(dict.fromkeys(names))


def http_get(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "fetch-fluent-emoji"})
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.read()
    except Exception:
        return None


def candidate_urls(seq):
    folders = []
    if cp_key(seq) in OVERRIDES:
        folders.append(OVERRIDES[cp_key(seq)])
    for n in names_for(seq):
        folders += [v[0].upper() + v[1:] for v in variants(n)]
    folders = list(dict.fromkeys(folders))
    urls = []
    if cp_key(seq) in URL_OVERRIDES:
        urls.append(BASE + URL_OVERRIDES[cp_key(seq)])
    for f in folders:
        fn = f.lower().replace(" ", "_")
        q = urllib.parse.quote(f)
        urls.append(f"{BASE}assets/{q}/3D/{fn}_3d.png")
        urls.append(f"{BASE}assets/{q}/Default/3D/{fn}_3d_default.png")
    return urls


def save_png(data, dest):
    im = Image.open(io.BytesIO(data)).convert("RGBA")
    im.thumbnail((SIZE, SIZE), Image.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    canvas.paste(im, ((SIZE - im.width) // 2, (SIZE - im.height) // 2))
    canvas.save(dest, "PNG", optimize=True)


def compose_png(parts, dest):
    """Junta os PNGs de `parts` (emoji ja baixados) num 160x160: dois lado a lado, ou, com crianca
    (CHILDREN) na lista, os adultos atras e a crianca na frente, no centro de baixo."""
    imgs = []
    for p in parts:
        f = OUT / f"{cp_key(p)}.png"
        if not f.exists():
            return False
        imgs.append((Image.open(f).convert("RGBA"), cp_key(p) in CHILDREN))
    adults = [im for im, child in imgs if not child]
    kids = [im for im, child in imgs if child]
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    big = int(SIZE * (0.78 if kids else 0.8))
    top = int(SIZE * 0.04) if kids else (SIZE - big) // 2
    for i, im in enumerate(adults):
        x = int((SIZE - big) * i / max(len(adults) - 1, 1))
        canvas.alpha_composite(im.resize((big, big), Image.LANCZOS), (x, top))
    small = int(SIZE * 0.6)
    for im in kids:
        canvas.alpha_composite(im.resize((small, small), Image.LANCZOS), ((SIZE - small) // 2, SIZE - small))
    canvas.save(dest, "PNG", optimize=True)
    return True


def main():
    force = "--force" in sys.argv
    dry = "--dry-run" in sys.argv
    OUT.mkdir(parents=True, exist_ok=True)
    emojis = extract(ROOT / "data.js")
    for extra_file in ("engine.js", "app.js"):
        if (ROOT / extra_file).exists():
            emojis.update(extract(ROOT / extra_file))
    for e in EXTRA:
        for part in split_emoji(e):
            emojis[cp_key(part)] = part
    print(f"{len(emojis)} emoji distintos")

    manifest, missing = {}, []
    for key, seq in sorted(emojis.items()):
        dest = OUT / f"{key}.png"
        if dest.exists() and not force:
            manifest[key] = seq
            continue
        data = None
        for url in candidate_urls(seq):
            data = http_get(url)
            if data:
                break
        if not data:
            missing.append(seq)
            print("  SEM PNG:", seq, key, names_for(seq)[:1])
            continue
        if not dry:
            save_png(data, dest)
        manifest[key] = seq
        print("  ok", seq, key)

    # Sequencias sem PNG no Fluent: monta a partir dos componentes (COMPOSE)
    for seq in list(missing):
        key = cp_key(seq)
        if key in COMPOSE and not dry and compose_png(COMPOSE[key], OUT / f"{key}.png"):
            manifest[key] = seq
            missing.remove(seq)
            print("  composto", seq, key)

    if not dry:
        (OUT / "manifest.json").write_text(json.dumps(
            {"emoji": {k: manifest[k] for k in sorted(manifest)}, "unresolved": missing},
            ensure_ascii=False, indent=1), encoding="utf8")
        lic = http_get(BASE + "LICENSE")
        if lic:
            (OUT / "LICENSE-fluentui-emoji.txt").write_bytes(lic)
        # EMOJI_ASSETS inline em data.js: lista das sequencias resolvidas
        block = ("// EMOJI_ASSETS:begin (gerado por scripts/fetch_fluent_emoji.py — nao editar a mao)\n"
                 "const EMOJI_ASSETS = " + json.dumps([manifest[k] for k in sorted(manifest)], ensure_ascii=False) + ";\n"
                 "// EMOJI_ASSETS:end")
        dj = ROOT / "data.js"
        t = dj.read_text(encoding="utf8")
        if "EMOJI_ASSETS:begin" in t:
            t = re.sub(r"// EMOJI_ASSETS:begin.*?// EMOJI_ASSETS:end", lambda m: block, t, flags=re.S)
        else:
            t = t.rstrip("\n") + "\n\n" + block + "\n"
        dj.write_text(t, encoding="utf8")
    total = sum(p.stat().st_size for p in OUT.glob("*") if p.is_file())
    print(f"resolvidos: {len(manifest)}  sem PNG: {len(missing)}  tamanho assets/emoji: {total/1e6:.2f} MB")


if __name__ == "__main__":
    main()
