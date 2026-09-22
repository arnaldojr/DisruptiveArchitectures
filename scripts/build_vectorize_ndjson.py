"""
Converte chunks_embedded.json no formato NDJSON exigido pelo `wrangler vectorize insert`.

Como rodar:
  python build_vectorize_ndjson.py --input chunks_embedded.json --output vectors.ndjson
"""

import argparse
import json


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="chunks_embedded.json")
    parser.add_argument("--output", default="vectors.ndjson")
    args = parser.parse_args()

    chunks = json.loads(open(args.input, encoding="utf-8").read())

    with open(args.output, "w", encoding="utf-8") as f:
        for i, c in enumerate(chunks):
            linha = {
                "id": str(i),
                "values": c["embedding"],
                "metadata": {
                    "titulo": c["titulo"],
                    "url": c["url"],
                    "texto": c["texto"][:800],  # trunca pra não estourar limite de metadata
                },
            }
            f.write(json.dumps(linha, ensure_ascii=False) + "\n")

    print(f"Salvo {len(chunks)} vetores em {args.output}")


if __name__ == "__main__":
    main()
