"""
Gera o audio em portugues (voz neural Antonio, via edge-tts) pra toda narracao em PT-BR do
app: nome das situacoes (SITUATIONS.namePt), prompt dos cenarios de problem-posing
(SCENARIOS.promptPt), e algumas falas avulsas (ex. boas-vindas do Quokka).

Uso (da raiz do projeto):
    pip install edge-tts   # so na primeira vez
    python scripts/generate_pt_audio.py

E' idempotente: roda de novo a qualquer momento, so gera o que falta.

Nao mexe em data.js/app.js nem em nenhum outro arquivo alem de assets/audio/pt/*.mp3.
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

VOICE = "pt-BR-AntonioNeural"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_JS = os.path.join(ROOT, "data.js")
OUT_DIR = os.path.join(ROOT, "assets", "audio", "pt")

# Falas avulsas que nao vivem em SITUATIONS/SCENARIOS (ex. boas-vindas), com id estavel
# escolhido a mao — mesma regra de ouro dos ids de CONTENT_GUIDE.md: uma vez criado, nao muda.
EXTRA_LINES = {
    "onboarding_greeting": "Oi! Eu sou o Quokka! Vamos aprender inglês brincando?",
}


def extract_pairs(block_start, id_field, text_field):
    text = open(DATA_JS, encoding="utf-8").read()
    block = text.split(block_start, 1)[1]
    # para no fechamento do array no nivel raiz (linha "];")
    block = block.split("\n];", 1)[0]
    pattern = re.compile(r'id:\s*"([^"]+)".*?' + text_field + r':\s*"([^"]+)"', re.DOTALL)
    items, seen = [], set()
    for m in pattern.finditer(block):
        id_, txt = m.group(1), m.group(2)
        if id_ not in seen:
            seen.add(id_)
            items.append((id_, txt))
    return items


async def gen(text, path):
    await edge_tts.Communicate(text, VOICE).save(path)


async def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    items = extract_pairs("const SITUATIONS = [", "id", "namePt")
    items += extract_pairs("const SCENARIOS = [", "id", "promptPt")
    items += list(EXTRA_LINES.items())

    print(f"{len(items)} falas em PT-BR.")
    done = 0
    for id_, txt in items:
        path = os.path.join(OUT_DIR, f"{id_}.mp3")
        if os.path.exists(path):
            continue
        await gen(txt, path)
        done += 1
        print(f"  + {id_} ({txt})")
    print(f"Gerados agora: {done}. Ja existiam: {len(items) - done}.")
    if done:
        print("\nLembrete: adicione os novos arquivos no PT_AUDIO_SHELL de sw.js e suba a versao do CACHE_NAME.")


if __name__ == "__main__":
    asyncio.run(main())
