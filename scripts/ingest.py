"""
Extração + chunking do material do curso Disruptive Architectures.

O que este script faz:
  1. Varre a pasta `material/` (clonada localmente do repo do mkdocs)
  2. Para cada .md, remove front-matter/markdown "puro demais" e quebra em chunks
  3. Deriva a URL final de cada chunk (igual ao mkdocs faria)
  4. Salva tudo em chunks.json (sem embeddings ainda)

Os embeddings são gerados depois, por embed_with_workers_ai.py — assim o modelo
usado é o mesmo que o Worker usa pra buscar (@cf/baai/bge-m3, via Workers AI),
e este script fica leve, sem precisar baixar modelo nenhum.

Como rodar:
  pip install -r requirements.txt
  python ingest.py --material-dir /caminho/para/DisruptiveArchitectures/material \
                    --base-url https://arnaldojr.github.io/DisruptiveArchitectures

Saída:
  chunks.json  -> lista de {id, titulo, url, texto}
"""

import argparse
import re
import json
from pathlib import Path

CHUNK_SIZE_WORDS = 220       # tamanho alvo de cada chunk
CHUNK_OVERLAP_WORDS = 40     # sobreposição entre chunks vizinhos (mantém contexto)


def limpar_markdown(texto: str) -> str:
    """Remove front-matter, imagens, e reduz sintaxe markdown pra texto mais 'limpo'."""
    # remove front-matter YAML (--- ... ---)
    texto = re.sub(r"^---.*?---\s*", "", texto, flags=re.DOTALL)
    # remove imagens ![alt](src)
    texto = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", texto)
    # transforma links [texto](url) em só "texto"
    texto = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", texto)
    # remove blocos de código (```...```) — geralmente não ajuda muito no RAG textual
    texto = re.sub(r"```.*?```", "", texto, flags=re.DOTALL)
    # remove headers markdown (mantém o texto do header)
    texto = re.sub(r"^#+\s*", "", texto, flags=re.MULTILINE)
    # colapsa espaços/linhas em excesso
    texto = re.sub(r"\n{2,}", "\n", texto)
    return texto.strip()


def extrair_titulo(texto_original: str, md_path: Path) -> str:
    """Pega o primeiro cabeçalho markdown (# ou ##) como título.
    Se não achar, usa o nome da pasta (pra arquivos index.md) ou do arquivo."""
    m = re.search(r"^#{1,2}\s+(.+)$", texto_original, flags=re.MULTILINE)
    if m:
        return m.group(1).strip()
    if md_path.stem == "index":
        return md_path.parent.name
    return md_path.stem


def path_para_url(md_path: Path, material_dir: Path, base_url: str) -> str:
    """Converte caminho do .md pra URL final do site, igual o mkdocs faz."""
    rel = md_path.relative_to(material_dir)
    partes = list(rel.parts)

    if partes[-1] == "index.md":
        partes = partes[:-1]
    else:
        partes[-1] = partes[-1].removesuffix(".md")

    caminho = "/".join(partes)
    base_url = base_url.rstrip("/")
    if caminho:
        return f"{base_url}/{caminho}/"
    return f"{base_url}/"


def chunkar(texto: str, tamanho=CHUNK_SIZE_WORDS, sobreposicao=CHUNK_OVERLAP_WORDS):
    """Quebra o texto em pedaços de ~N palavras, com sobreposição entre eles."""
    palavras = texto.split()
    if not palavras:
        return []

    chunks = []
    inicio = 0
    while inicio < len(palavras):
        fim = min(inicio + tamanho, len(palavras))
        chunk = " ".join(palavras[inicio:fim])
        if len(chunk.strip()) > 30:  # ignora sobras muito curtas/vazias
            chunks.append(chunk)
        if fim == len(palavras):
            break
        inicio = fim - sobreposicao
    return chunks


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--material-dir", required=True, help="Caminho local da pasta material/")
    parser.add_argument("--base-url", required=True, help="URL base do site publicado")
    parser.add_argument("--output", default="chunks.json")
    args = parser.parse_args()

    material_dir = Path(args.material_dir).resolve()
    arquivos_md = sorted(material_dir.rglob("*.md"))

    print(f"Encontrados {len(arquivos_md)} arquivos .md em {material_dir}")

    todos_chunks = []
    for md_path in arquivos_md:
        texto_original = md_path.read_text(encoding="utf-8")
        titulo = extrair_titulo(texto_original, md_path)
        texto_limpo = limpar_markdown(texto_original)

        if not texto_limpo:
            continue

        url = path_para_url(md_path, material_dir, args.base_url)
        pedacos = chunkar(texto_limpo)

        for i, pedaco in enumerate(pedacos):
            todos_chunks.append({
                "id": f"{md_path.relative_to(material_dir)}::chunk{i}",
                "titulo": titulo,
                "url": url,
                "texto": pedaco,
            })

    print(f"Total de chunks gerados: {len(todos_chunks)}")

    Path(args.output).write_text(
        json.dumps(todos_chunks, ensure_ascii=False, indent=None),
        encoding="utf-8",
    )
    print(f"Salvo em {args.output} ({len(todos_chunks)} chunks)")


if __name__ == "__main__":
    main()