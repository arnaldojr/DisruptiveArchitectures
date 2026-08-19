
# Gemini API com Python

Em vez de usar uma interface pronta, você vai escrever um programa em Python que envia/recebe mensagens diretamente para o LLM.

Ao final, você terá um pequeno assistente conversacional funcionando no Google Colab.

[**Abrir no Google Colab**](https://colab.research.google.com/github/arnaldojr/DisruptiveArchitectures/blob/master/material/aulas/genAI/lab2/lab2_gemini_api_colab.ipynb){ .md-button .md-button--primary }


[Baixar notebook](lab2_gemini_api_colab.ipynb){ .md-button download="lab2_gemini_api_colab.ipynb" }

---

## Como uma conversa com um LLM é organizada?

Até aqui falamos sobre como nossa aplicação consegue chegar até o modelo.

Agora precisamos entender o que será enviado para ele.

Em uma aplicação conversacional, diferentes mensagens podem cumprir papéis diferentes. Duas delas serão particularmente importantes neste laboratório:

- **System Prompt**: Define o comportamento e o estilo do modelo.
- **User Prompt**: É a mensagem que o usuário envia para o modelo.

Embora ambos sejam textos enviados ao modelo, eles têm funções diferentes.

--- 

### System Prompt

O System Prompt define o comportamento esperado do modelo dentro da aplicação.

Ele pode estabelecer:

- qual papel o modelo deve assumir;
- como as respostas devem ser apresentadas;
- quais regras devem ser respeitadas;
- quais informações estão disponíveis;
- quais limites devem ser considerados.

Imagine um assistente de uma loja de eletrônicos.

Parte do System Prompt poderia dizer:

```text
Você é a assistente virtual da TechStore.

Responda de forma objetiva e educada.

Não invente informações sobre preços, estoque ou pedidos.

Caso não tenha informações suficientes, peça esclarecimentos.
```

Essas instruções não representam uma pergunta feita pelo cliente. Elas definem como queremos que o modelo se comporte dentro daquela aplicação.

Normalmente, o System Prompt é definido por quem desenvolve a aplicação e não pelo usuário final.

### User Prompt

O User Prompt representa a mensagem enviada pelo usuário durante a interação.

Por exemplo:

```text
Meu notebook não está ligando. O que posso verificar?
```

Nesse momento, o modelo recebe informações com funções diferentes. O modelo utiliza essas informações para produzir uma resposta.

```text
System Prompt
       +
 User Prompt
       ↓
 Modelo Gemini
       ↓
    Resposta
```

O System Prompt não é simplesmente um "prompt mais importante" ou um "prompt melhor".

Ele possui uma função diferente do User Prompt.

Essa separação será importante quando começarmos a transformar uma conversa com um modelo em uma aplicação.

## E quando a conversa possui várias mensagens?

Uma conversa, normalmente, possui várias interações. Mas o modelo não "lembra" de tudo que foi dito. Ele apenas recebe o que é enviado a ele. Nesse sentido, o contexto é o conjunto de informações disponíveis no momento em que uma nova resposta é gerada. Ele não controla sozinho o estado da aplicação que está utilizando esse modelo.

Imagine duas solicitações completamente independentes:

**Requisição 1**

```text
"Meu notebook é um Orion 14."
        ↓
      Modelo
        ↓
    Resposta
````
    
Depois:

**Requisição 2**

```text
"Qual é o modelo dele?"
        ↓
      Modelo
```

Se a segunda requisição não tiver acesso à informação apresentada na primeira, o modelo não possui elementos suficientes para saber a que dele se refere.

Por outro lado, se a aplicação mantiver a relação entre as interações:

**Requisição**

```text
"Meu notebook é um Orion 14."
        │
        ▼
[Nova Requisição]
"Qual é o modelo dele?"
```

A informação anterior pode fazer parte do contexto utilizado na segunda resposta.

!! warning "Atenção"
    
    Manter uma conversa é uma responsabilidade da aplicação.

No notebook, você irá observar primeiro o que acontece quando duas solicitações são independentes e, depois, como podemos manter a continuidade entre elas.

