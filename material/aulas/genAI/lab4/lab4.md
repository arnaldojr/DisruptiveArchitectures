# RAG e bases de conhecimento

No Lab 3, a NIA aprendeu a solicitar ações da aplicação. Neste laboratório, ela aprenderá a consultar informações externas antes de responder.

Você construirá um mecanismo de **Retrieval-Augmented Generation (RAG)** usando documentos fictícios da TechStore, embeddings e busca por similaridade.

[**Abrir no Google Colab**](https://colab.research.google.com/github/arnaldojr/DisruptiveArchitectures/blob/master/material/aulas/genAI/lab4/lab4_rag_colab.ipynb){ .md-button .md-button--primary }

[Baixar notebook](lab4_rag_colab.ipynb){ .md-button download="lab4_rag_colab.ipynb" }

---

## Objetivos do laboratório

Neste laboratório, você irá:

1. distinguir memória de conversa de base de conhecimento;
2. representar textos usando embeddings;
3. comparar uma pergunta com trechos de documentos;
4. recuperar os trechos semanticamente mais próximos;
5. inserir esses trechos no contexto enviado ao LLM;
6. responder com indicação das fontes utilizadas;
7. reconhecer quando a base não contém a resposta.

---

## Por que o System Prompt não é uma base de conhecimento?

É possível colocar algumas informações no System Prompt, mas essa abordagem não escala bem. Documentos podem ser extensos, mudar com frequência ou conter apenas alguns trechos relevantes para cada pergunta.

Além disso, três conceitos diferentes não devem ser confundidos:

| Conceito | Para que serve |
| --- | --- |
| System Prompt | Define comportamento, regras e estilo |
| Histórico da conversa | Mantém informações das interações anteriores |
| Base de conhecimento | Fornece conteúdo externo que pode ser consultado |

O RAG seleciona informações da base antes de pedir ao modelo que produza a resposta.

---

## Arquitetura do RAG

```text
Documentos → divisão em trechos → embeddings → índice
                                            ↑
Pergunta → embedding → busca por similaridade
                         ↓
                 trechos recuperados
                         ↓
        pergunta + trechos + instruções
                         ↓
                       LLM
                         ↓
              resposta fundamentada
```

O laboratório implementará cada etapa diretamente em Python. Em uma aplicação maior, o índice em memória poderia ser substituído por um banco vetorial ou serviço de busca.

---

## Embeddings

Um embedding é uma lista de números que representa características semânticas de um conteúdo. Textos relacionados tendem a ocupar posições próximas nesse espaço vetorial.

Por exemplo, uma busca por:

```text
Até quando posso desistir de uma compra?
```

pode recuperar um trecho que contém:

```text
O cliente pode solicitar devolução em até sete dias corridos.
```

As frases não usam as mesmas palavras, mas possuem significado relacionado. Isso diferencia busca semântica de uma simples procura por palavras exatas.

---

## Trechos e similaridade

Documentos extensos são normalmente divididos em **chunks**. Cada trecho recebe seu próprio embedding e preserva uma referência à fonte original.

No notebook, a similaridade de cosseno será usada para ordenar os trechos:

```text
-1                           0                           1
sentidos opostos      pouca relação        grande proximidade
```

Uma pontuação alta indica proximidade vetorial, não uma garantia de que o trecho responde corretamente à pergunta. A etapa de geração ainda precisa seguir regras claras e os resultados precisam ser avaliados.

---

## Resposta fundamentada

Depois da busca, a aplicação enviará ao modelo somente alguns trechos relevantes e instruções como:

- use apenas o contexto fornecido;
- não complete lacunas com conhecimento próprio;
- informe quando a resposta não estiver nos documentos;
- identifique as fontes utilizadas.

Esse processo reduz respostas sem fundamento, mas não elimina erros. RAG depende da qualidade dos documentos, da divisão em trechos, da recuperação e das instruções de geração.

---

## Escopo didático

A base da TechStore será criada dentro do próprio notebook para que ele funcione sozinho no Colab. Ela contém pequenos trechos fictícios sobre suporte, garantia, devolução, privacidade e produtos.

!!! warning "Dados fictícios"

    As políticas e os produtos deste laboratório existem somente para fins acadêmicos. Eles não devem ser apresentados como informações de uma empresa real.

---

## Entrega

Ao final do notebook, cada grupo deverá apresentar:

1. a base vetorial criada a partir dos documentos;
2. os trechos recuperados para uma pergunta;
3. comparação entre uma resposta sem RAG e uma resposta com RAG;
4. evidência dos quatro testes obrigatórios;
5. uma análise de pelo menos uma falha ou limitação observada;
6. a implementação de uma das opções do desafio final.

