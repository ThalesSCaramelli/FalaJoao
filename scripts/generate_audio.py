"""
Gera o audio em ingles (voz neural Natasha, via edge-tts) pra todo item de CONTENT em data.js
que ainda nao tem arquivo em assets/audio/en/<id>.mp3.

Uso (da raiz do projeto):
    pip install edge-tts   # só na primeira vez
    python scripts/generate_audio.py

E' idempotente: roda de novo a qualquer momento, so gera o que falta. Depois de adicionar
palavras/frases novas em data.js, e' so rodar este script de novo.

Nao mexe em data.js nem em nenhum outro arquivo alem de assets/audio/en/*.mp3.
"""
import asyncio
import os
import re
import sys

try:
    import edge_tts
except ImportError:
    print("Falta instalar: pip install edge-tts")
    sys.exit(1)

VOICE = "en-AU-NatashaNeural"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_JS = os.path.join(ROOT, "data.js")
OUT_DIR = os.path.join(ROOT, "assets", "audio", "en")


def extract_items():
    text = open(DATA_JS, encoding="utf-8").read()
    content_block = text.split("const CONTENT = [", 1)[1]
    pattern = re.compile(r'\{\s*id:\s*"([^"]+)".*?en:\s*"([^"]+)"', re.DOTALL)
    items, seen = [], set()
    for m in pattern.finditer(content_block):
        id_, en = m.group(1), m.group(2)
        if id_ not in seen:
            seen.add(id_)
            items.append((id_, en))
    return items


async def gen(text, path):
    await edge_tts.Communicate(text, VOICE).save(path)


async def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    items = extract_items()
    print(f"{len(items)} itens em CONTENT.")
    done = 0
    for id_, en in items:
        path = os.path.join(OUT_DIR, f"{id_}.mp3")
        if os.path.exists(path):
            continue
        await gen(en, path)
        done += 1
        print(f"  + {id_} ({en})")
    print(f"Gerados agora: {done}. Ja existiam: {len(items) - done}.")
    if done:
        print("\nLembrete: adicione os novos arquivos no APP_SHELL de sw.js e suba a versao do CACHE_NAME.")


if __name__ == "__main__":
    asyncio.run(main())
