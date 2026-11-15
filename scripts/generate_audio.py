"""
Gera o audio em ingles (voz neural Natasha, via edge-tts) pra todo item de CONTENT em data.js
que ainda nao tem arquivo em assets/audio/en/<id>.mp3 -- e tambem pro `promptEn` de cada cenario
de SCENARIOS (a situacao em ingles do perfil em imersao), salvo como assets/audio/en/<scn_id>.mp3,
e pro `nameEn` de cada lugar de SITUATIONS, salvo como assets/audio/en/place_<id>.mp3, e pro
`term` de cada verbete de ADULT_DICTIONARY, salvo como assets/audio/en/dict_<slug>.mp3.

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


def extract_place_names():
    """nameEn de SITUATIONS (nome do lugar no perfil em imersao), salvo como place_<id>.mp3."""
    text = open(DATA_JS, encoding="utf-8").read()
    block = text.split("const SITUATIONS = [", 1)[1].split("\n];", 1)[0]
    pattern = re.compile(r'\{\s*id:\s*"([^"]+)"[^\n]*?nameEn:\s*"([^"]+)"')
    return [(f"place_{m.group(1)}", m.group(2)) for m in pattern.finditer(block)]


def extract_dictionary_terms():
    """`term` de ADULT_DICTIONARY (dicionario do adulto), salvo como dict_<slug>.mp3 --
    mesmo slug do app (engine.js, dictSlug): minusculas, tudo que nao e' letra/numero vira _."""
    text = open(DATA_JS, encoding="utf-8").read()
    if "const ADULT_DICTIONARY = [" not in text:
        return []
    block = text.split("const ADULT_DICTIONARY = [", 1)[1].split("\n];", 1)[0]
    out = []
    for m in re.finditer(r'term:\s*"([^"]+)"', block):
        slug = re.sub(r"[^a-z0-9]+", "_", m.group(1).lower()).strip("_")
        out.append((f"dict_{slug}", m.group(1)))
    return out


def extract_scenario_prompts():
    text = open(DATA_JS, encoding="utf-8").read()
    block = text.split("const SCENARIOS = [", 1)[1].split("\n];", 1)[0]
    pattern = re.compile(r'\{\s*id:\s*"([^"]+)"[^\n]*?promptEn:\s*"([^"]+)"')
    return [(m.group(1), m.group(2)) for m in pattern.finditer(block)]


async def gen(text, path):
    await edge_tts.Communicate(text, VOICE).save(path)


async def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    items = extract_items()
    print(f"{len(items)} itens em CONTENT.")
    prompts = extract_scenario_prompts()
    print(f"{len(prompts)} cenarios com promptEn.")
    items += prompts
    places = extract_place_names()
    print(f"{len(places)} lugares com nameEn.")
    items += places
    dict_terms = extract_dictionary_terms()
    print(f"{len(dict_terms)} verbetes do dicionario.")
    items += dict_terms
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
