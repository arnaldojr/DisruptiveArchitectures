
# Gemini API com Python

Em vez de usar uma interface pronta, você vai escrever um programa em Python que envia mensagens para o modelo Gemini e recebe respostas pela API.

Ao final, você terá um pequeno assistente conversacional funcionando no Google Colab.

[**Abrir no Google Colab**](https://colab.research.google.com/github/arnaldojr/DisruptiveArchitectures/blob/main/docs/aulas/genAI/lab2/lab2_gemini_api_colab.ipynb){ .md-button .md-button--primary }

[**Baixar notebook**](lab2/lab2_gemini_api_colab.ipynb){ .md-button download="lab2_gemini_api_colab.ipynb" }



---

## O cenário

Você foi contratado para desenvolver a primeira versão do assistente virtual da **TechStore**, uma loja fictícia de eletrônicos.

A aplicação será simples e executada no terminal do notebook. O objetivo aqui não é criar uma interface bonita, e sim compreender o fluxo real de uma aplicação com IA.

O fluxo será este:

```text
Usuário
   ↓
Programa Python
   ↓
Gemini API
   ↓
Modelo Gemini
   ↓
Resposta
   ↓
Programa Python
   ↓
Usuário
```

Parece parecido com o que aconteceu no Google AI Studio, certo?

A diferença é que agora **você controla a aplicação**.

---

## Antes do código, o que é uma API?

Quando você usa o Google AI Studio, a interface cuida de vários detalhes por você.

Você digita uma mensagem, clica para executar e recebe uma resposta.

Em uma aplicação Python, precisamos fazer essa comunicação por código. É aí que entra a API.

Uma **API** é uma interface que permite que programas se comuniquem.

Neste laboratório, nosso programa envia uma requisição para a Gemini API. O serviço do Google processa essa requisição com um modelo Gemini e devolve uma resposta.

```text
Python              Internet              Gemini
  │                     │                    │
  │---- requisição ---->│------------------->│
  │                     │                    │
  │<---- resposta ------│<-------------------│
  │                     │                    │
```

Nosso código não executa o modelo Gemini dentro do Colab. O Colab funciona como **cliente**. O modelo está sendo executado na infraestrutura do Google.

---

## SDK ou requisição HTTP?

Seria possível montar as requisições HTTP manualmente. Para este laboratório, vamos usar o SDK oficial do Google para Python.

A biblioteca utilizada será:

```text
google-genai
```

Um SDK fornece classes e métodos que simplificam o acesso a uma API. Em vez de construir URLs, cabeçalhos HTTP e payloads JSON manualmente, você trabalha com código Python mais legível.

O importante aqui é entender o conceito: a comunicação continua acontecendo por meio de uma API. O SDK apenas organiza esse processo para nós.

---

# Parte 1 — Preparando o acesso à Gemini API

## 1. Crie sua chave

A API precisa identificar quem está fazendo a requisição. Para isso, vamos usar uma **API key**.

1. Acesse o [Google AI Studio](https://aistudio.google.com/).
2. Abra a área de **API Keys**.
3. Crie uma nova chave para a Gemini API.
4. Copie a chave.

A chave funciona como uma credencial de acesso.

> Atenção: não compartilhe sua API key. Não coloque a chave em repositórios públicos, notebooks compartilhados ou arquivos abertos na internet.

No Colab, vamos armazená-la na área de **Secrets**.

---

## 2. Salve a chave no Google Colab

Abra este notebook no Google Colab.

Na barra lateral esquerda:

1. clique no ícone de chave chamado **Secrets**;
2. crie um novo secret chamado `GEMINI_API_KEY`;
3. cole sua chave como valor;
4. habilite o acesso desse secret ao notebook.

O código poderá recuperar a chave sem escrevê-la diretamente em uma célula.

---

# Parte 2 — Sua primeira chamada

## 3. Instale o SDK

No Colab, bibliotecas adicionais podem ser instaladas com `pip`.

```python
!pip install -q -U "google-genai>=2.3.0"
```

Depois, importe a biblioteca e recupere a chave armazenada no Colab.

```python
from google import genai
from google.colab import userdata

api_key = userdata.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)
```

A variável `client` será nosso ponto de comunicação com a Gemini API.

---

## 4. Envie uma mensagem

Vamos começar com uma única requisição.

```python
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Explique em uma frase o que é uma API."
)

print(response.text)
```

Observe três elementos importantes:

```python
model="gemini-2.5-flash"
```

Escolhe o modelo que será utilizado.

```python
contents="..."
```

Contém a entrada enviada para o modelo.

```python
response.text
```

Recupera o texto produzido pelo Gemini.

### Teste

Troque a mensagem no `contents` e execute novamente.

Experimente, por exemplo:

```text
Explique a diferença entre API e biblioteca usando uma analogia.
```

Neste momento, nosso programa já está usando IA generativa.

Mas ele ainda não é uma aplicação completa.

---

# Parte 3 — Definindo o comportamento do assistente

No Google AI Studio, você usou instruções para dizer ao modelo como ele deveria se comportar.

Na API fazemos a mesma coisa. O modelo precisa receber regras claras para saber seu papel, seu objetivo e seus limites.

O assistente da TechStore utilizará o seguinte System Prompt:

```text
Você é a NIA, assistente virtual da TechStore, uma loja fictícia
de eletrônicos criada para uma atividade acadêmica.

Seu objetivo é ajudar clientes com dúvidas simples sobre produtos
e problemas básicos de uso.

Regras:
- responda em português;
- seja objetiva e educada;
- faça perguntas quando faltarem informações;
- não invente preços, estoque, informações de pedidos ou dados de clientes;
- informe claramente que você não possui acesso ao sistema de pedidos;
- nunca peça senhas, números completos de cartão ou outros dados sensíveis;
- se não souber a resposta, diga que não possui informação suficiente;
- quando o problema exigir análise física do equipamento, recomende atendimento técnico;
- responda normalmente em até 120 palavras.

Informações disponíveis:
- o suporte humano funciona de segunda a sexta, das 9h às 18h;
- a TechStore oferece garantia fictícia de 12 meses contra defeitos de fabricação;
- você não possui acesso a preços em tempo real, estoque ou situação de pedidos.
```

No código, podemos guardar esse texto em uma variável:

```python
SYSTEM_PROMPT = """
Você é a NIA, assistente virtual da TechStore, uma loja fictícia
...
"""
```

Agora, em vez de só mandar uma mensagem sem contexto, vamos incluir `system_instruction` na solicitação.

```python
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Meu pedido ainda não chegou. Onde ele está?",
    config={
        "system_instruction": SYSTEM_PROMPT
    }
)

print(response.text)
```

Compare essa resposta com uma chamada feita sem o System Prompt.

O modelo continua sendo o mesmo. O que mudou foi o **comportamento esperado dentro da aplicação**.

---

# Parte 4 — Recebendo uma mensagem do usuário

Até agora, as mensagens estavam escritas diretamente no código.

Uma aplicação precisa receber entradas do usuário.

Em Python, podemos começar com `input()`:

```python
mensagem = input("Você: ")

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=mensagem,
    config={
        "system_instruction": SYSTEM_PROMPT
    }
)

print("NIA:", response.text)
```

Execute a célula e escreva uma pergunta.

Exemplo:

```text
Meu notebook não está ligando. O que posso verificar?
```

Agora o fluxo já está mais próximo de uma aplicação:

```text
input()
   ↓
mensagem
   ↓
Gemini API
   ↓
resposta
   ↓
print()
```

---

# Parte 5 — Uma conversa precisa de contexto

Faça o seguinte teste.

Primeira mensagem:

```text
Meu computador é um notebook Orion 14.
```

Depois faça **uma nova chamada independente**:

```text
Qual é o modelo do meu computador?
```

Por que o modelo pode não saber a resposta?

Porque cada requisição pode ser tratada como uma nova interação, se você não informar ao sistema que a nova mensagem pertence à mesma conversa anterior.

Nesse ponto, a ideia de **histórico de conversa** entra em cena.

Se você mandar uma pergunta isolada, o modelo normalmente não tem memória de interações anteriores.

Uma maneira simples de manter a conversa é usar o recurso de chat do SDK.

```python
chat = client.chats.create(
    model="gemini-2.5-flash",
    config={
        "system_instruction": SYSTEM_PROMPT
    }
)
```

Agora, em vez de enviar uma mensagem isolada, você usa o chat para manter o contexto.

```python
response_1 = chat.send_message("Meu computador é um notebook Orion 14.")
print(response_1.text)

response_2 = chat.send_message("Qual é o modelo do meu computador?")
print(response_2.text)
```

O chat guarda o histórico da conversa para você, sem precisar sempre reescrever o contexto na mensagem.

---

## 5.1 O que mudou aqui?

Agora você não está mais pensando apenas em uma chamada simples. Você está trabalhando com uma **sessão de conversa**.

Isso é importante porque a maioria das aplicações reais precisa manter contexto entre mensagens. Exemplos:

- chatbot de suporte;
- assistente virtual;
- tutor de estudos;
- agente conversacional para negócios.

A diferença principal está em duas coisas:

1. o sistema recebe regras de comportamento;
2. o chat preserva contexto entre mensagens.

---

# Parte 6 — Transformando as chamadas em uma aplicação

Até agora executamos cada interação manualmente.

Nosso próximo passo é repetir o processo enquanto o usuário quiser conversar.

Para isso, usaremos um `while`.

A lógica desejada é:

```text
iniciar aplicação

enquanto o usuário não digitar "sair":

    ler mensagem

    enviar mensagem ao Gemini

    mostrar resposta

encerrar
```

O código completo pode ser construído assim:

```python
from google import genai
from google.colab import userdata

api_key = userdata.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

SYSTEM_PROMPT = """
Você é a NIA, assistente virtual da TechStore.
Seu objetivo é ajudar clientes com dúvidas simples sobre produtos e problemas básicos de uso.

Regras:
- responda em português;
- seja objetiva e educada;
- não invente preço, estoque ou dados de pedidos;
- se não souber a resposta, diga que não possui informação suficiente;
- nunca peça senhas ou dados sensíveis;
- responda em até 120 palavras.
"""

chat = client.chats.create(
    model="gemini-2.5-flash",
    config={
        "system_instruction": SYSTEM_PROMPT
    }
)

print("NIA: Olá! Sou a assistente virtual da TechStore.")
print("Digite 'sair' para encerrar.\n")

while True:
    mensagem = input("Você: ").strip()

    if mensagem.lower() == "sair":
        print("NIA: Atendimento encerrado.")
        break

    if not mensagem:
        continue

    response = chat.send_message(mensagem)
    print("NIA:", response.text)
    print()
```

O ponto principal aqui é que o objeto `chat` preserva a conversa. Isso significa que, em vez de tratar cada mensagem como isolada, o sistema continua entendendo o contexto da sessão.

---

# Parte 7 — Teste sua aplicação

Uma aplicação com IA não deve ser testada apenas com uma pergunta fácil.

Faça pelo menos os três testes abaixo.

| Teste | Exemplo | O que observar |
| --- | --- | --- |
| Caso normal | `Meu notebook não está ligando. O que posso verificar?` | A resposta é útil, curta e coerente? |
| Informação inexistente | `Meu pedido 58421 está onde?` | O assistente evita inventar a situação do pedido? |
| Contexto | `Meu computador é um Orion 14.` e depois `Qual é o modelo dele?` | O assistente mantém a informação da conversa? |

Depois crie **um quarto teste** por conta própria.

Tente encontrar um caso em que o assistente responda mal, fique ambíguo ou deixe de seguir alguma regra.

Se isso acontecer, não é necessariamente um erro no código. Talvez o comportamento definido no System Prompt precise ser refinado.

---

# Parte 8 — Entendendo o que você construiu

O programa final possui algumas camadas diferentes.

```text
┌──────────────────────────────┐
│ Interface                    │
│ input() e print()            │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│ Lógica da aplicação          │
│ while, if, variáveis         │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│ SDK google-genai             │
│ client.chats.create()        │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│ Gemini API                   │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│ Modelo Gemini                │
└──────────────────────────────┘
```

Isso ajuda a separar conceitos que parecem iguais no início.

O **Python** controla o fluxo da aplicação.

O **SDK** facilita a comunicação.

A **API** recebe a requisição e devolve a resposta.

O **modelo** produz o conteúdo.

O **System Prompt** define parte do comportamento esperado.

---

# Parte 9 — Desafio

Agora faça uma pequena melhoria no assistente.

Escolha **uma** das opções abaixo.

### Opção A — Melhorar a experiência

Faça a aplicação:

- mostrar uma mensagem inicial melhor;
- ignorar entradas vazias;
- reconhecer `sair`, `fim` e `encerrar`;
- mostrar uma mensagem amigável antes de finalizar.

### Opção B — Refinar o comportamento

Altere o System Prompt para que a NIA:

- faça apenas uma pergunta de diagnóstico por vez;
- apresente instruções em passos numerados quando houver um procedimento;
- encaminhe para suporte humano quando duas tentativas de solução não resolverem o problema.

### Opção C — Trocar a aplicação

Mantenha a estrutura Python e transforme a TechStore em outro assistente.

Algumas ideias:

- assistente de estudos;
- recepcionista de hotel;
- atendente de uma cafeteria;
- assistente de uma biblioteca;
- mestre de um jogo textual.

A pergunta importante é:

> Quanto do código precisou mudar quando o comportamento da aplicação mudou?

---

# Parte 10 — Entrega

Entregue o notebook executado contendo:

1. conexão funcionando com a Gemini API;
2. primeira chamada simples;
3. chamada utilizando o System Prompt;
4. teste de contexto com duas ou mais interações;
5. aplicação final utilizando `while`;
6. resultados dos quatro testes;
7. implementação de uma das opções do desafio.

Não envie sua API key no notebook.

---

## O que você aprendeu

Neste laboratório, você saiu de uma interface pronta e passou a controlar o fluxo de uma aplicação com IA usando Python.

O ponto principal não foi escrever muito código. Foi entender a arquitetura:

```text
usuário → aplicação → API → modelo → resposta
```

Você também viu que uma conversa não é apenas uma sequência de `input()` e `print()`. A aplicação precisa manter a relação entre as interações para que o modelo consiga usar o contexto anterior.

Esse mecanismo será importante quando aplicações com IA começarem a consultar dados externos, executar funções e tomar decisões com base em outras fontes de informação.

---

## Referências

- [Gemini API — Getting started](https://ai.google.dev/gemini-api/docs/get-started)
- [Google Gen AI SDK for Python](https://googleapis.github.io/python-genai/)
- [Gemini API — API keys](https://ai.google.dev/gemini-api/docs/api-key)
