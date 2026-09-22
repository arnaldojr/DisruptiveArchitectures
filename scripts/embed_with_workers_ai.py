"""
Re-gera os embeddings de chunks.json usando o Workers AI da Cloudflare
(modelo @cf/baai/bge-m3, multilíngue, grátis) em vez do sentence-transformers local.

Por quê: a pergunta do aluno vai ser "embeddada" dentro do Worker (JavaScript),
usando Workers AI. Pra busca por similaridade fazer sentido, os chunks precisam
ter sido embeddados com o MESMO modelo.

Como pegar suas credenciais:
  - Account ID: aparece no dashboard do Cloudflare (barra lateral direita) ou:
    wrangler whoami
  - API Token: dash.cloudflare.com -> My Profile -> API Tokens -> Create Token
    -> template "Workers AI" (ou permissão "Account.Workers AI: Edit")

Como rodar:
  pip install requests
  export CF_ACCOUNT_ID=""
  export CF_API_TOKEN=""
  python embed_with_workers_ai.py --input chunks.json --output chunks_embedded.json
"""

import argparse
import json
import os
import time

import requests

MODEL = "@cf/baai/bge-m3"
BATCH_SIZE = 20  # quantos textos manda por chamada


def embed_lote(textos, account_id, token):
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{MODEL}"
    resp = requests.post(
        url,
        headers={"Authorization": f"Bearer {token}"},
        json={"text": textos},
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    if not data.get("success"):
        raise RuntimeError(f"Erro na API Workers AI: {data}")
    return data["result"]["data"]  # lista de vetores


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="chunks.json")
    parser.add_argument("--output", default="chunks_embedded.json")
    args = parser.parse_args()

    account_id = os.environ.get("CF_ACCOUNT_ID")
    token = os.environ.get("CF_API_TOKEN")
    if not account_id or not token:
        raise SystemExit("Defina as variáveis de ambiente CF_ACCOUNT_ID e CF_API_TOKEN antes de rodar.")

    chunks = json.loads(open(args.input, encoding="utf-8").read())
    print(f"Carregados {len(chunks)} chunks de {args.input}")

    for i in range(0, len(chunks), BATCH_SIZE):
        lote = chunks[i : i + BATCH_SIZE]
        textos = [c["texto"] for c in lote]
        vetores = embed_lote(textos, account_id, token)
        for c, v in zip(lote, vetores):
            c["embedding"] = v
        print(f"  embeddados {min(i + BATCH_SIZE, len(chunks))}/{len(chunks)}")
        time.sleep(0.3)  # gentileza com o rate limit

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False)

    dim = len(chunks[0]["embedding"]) if chunks else 0
    print(f"Salvo em {args.output} (dimensão {dim})")


if __name__ == "__main__":
    main()
