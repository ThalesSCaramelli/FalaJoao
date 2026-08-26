"""
Servidor local do app (threaded) -- substitui `python -m http.server`, que é de conexão
única e trava quando o navegador abre várias conexões ao mesmo tempo (foi a causa de imagens
"quebrando" aleatoriamente durante uso normal).

Uso: python scripts/dev_server.py [porta]   (padrao 8080)
"""
import http.server
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    os.chdir(ROOT)
    server = http.server.ThreadingHTTPServer(("0.0.0.0", port), http.server.SimpleHTTPRequestHandler)
    print(f"Servidor (threaded) em http://localhost:{port}/")
    server.serve_forever()
