# Engenharia de Prompts 


Neste laboratório, você vai aprender a sair do básico "me conte uma piada" para a construção de **prompts estruturados** que servem como o motor de inteligência de uma aplicação real.

## Objetivo do Laboratório

1. Conhecer a interface do Google AI Studio.
2. Dominar técnicas de Engenharia de Prompts (Persona, Contexto, Zero-shot, Few-shot).
3. Criar, testar e refinar o "cérebro" de uma aplicação.



---

## Parte 1: Preparando o Terreno

O [Google AI Studio](https://aistudio.google.com/) é o ambiente oficial do Google para prototipar e testar ideias usando a família de modelos **Gemini** (como o atual `gemini-2.5-pro`).

1. Acesse o [Google AI Studio](https://aistudio.google.com/) e faça login com sua conta Google.
2. Por padrão, o Playground abre em Chat Prompt.
3. Observe os blocos principais:
   - Chat Prompts: ideal para assistentes conversacionais, com múltiplas interações.
   - Run Settings: painel com System Instructions, parâmetros do modelo e ajustes de segurança.

Configuração inicial recomendada para o laboratório:
- Temperature: 0.3 a 0.5
- Top-p: padrão
- Max output tokens: padrão

Objetivo desta etapa: padronizar o ambiente para comparar versões de prompt com mais clareza.

---

## Parte 2: Os Pilares de um Bom Prompt

Para que um modelo funcione como aplicação, ele precisa de regras claras e previsibilidade.

### Estrutura ideal de prompt

Um prompt de nível profissional geralmente contém:
1. **Papel (Persona):** Quem a IA deve ser?
2. **Tarefa:** O que exatamente ela deve fazer?
3. **Contexto:** Quais as limitações e informações de fundo?
4. **Formato de Saída:** Como a resposta deve ser entregue (JSON, Markdown, Tópicos, etc.)?
5. **Restrições:** Quais as limitações ou regras que devem ser respeitadas?

### Técnicas que você vai usar
    
* **Zero-Shot:** Pedir algo diretamente, sem dar exemplos.
* **Few-Shot:** Dar 2 ou 3 exemplos de "Entrada -> Saída" no histórico da conversa para calibrar o tom e o formato do modelo.

### Guia rápido: erros comuns de prompt


| Evite                             | Prefira                               |
| --------------------------------- | ------------------------------------- |
| Pedidos vagos ("faça algo legal") | Tarefa única e clara                  |
| Falta de público-alvo             | Contexto real                         |
| Ausência de critério de sucesso   | Restrições objetivas                  |
| Múltiplas tarefas sem prioridade  | Estrutura de resposta definida        |
| Sem formato de saída definido     | Iteração com comparação entre versões |

---

## Parte 3: O Desafio (Mão na Massa!)

### Cenário

Você foi contratado(a) como Engenheiro(a) de IA para criar o "cérebro" de um aplicativo. Você não vai programar a interface agora: seu objetivo é criar um System Prompt robusto e testar se a IA não "quebra" o personagem.

### Escolha o seu projeto (escolha 1)

- Opção A (Educação): professor de história interativo que explica eventos complexos em linguagem de Geração Z.
- Opção B (Saúde/Bem-estar): gerador de marmitas com os ingredientes disponíveis, devolvendo cardápio semanal em tabela.
- Opção C (Entretenimento): mestre de RPG de texto que avalia ações do usuário e rola dados virtuais.
- Opção D (Livre): invente seu próprio caso de uso.

### Passo a passo da implementação

1. Abra um Chat Prompt no Google AI Studio.
2. Preencha o System Instructions:
   - Abra Run Settings e localize a caixa "System Instructions".
   - Exemplo para Opção B:

```text
Você é um nutricionista prático e criativo.
Sua tarefa é criar refeições saudáveis usando APENAS os ingredientes fornecidos pelo usuário.
Se o usuário pedir algo não comestível, recuse educadamente.
Saída obrigatória: uma tabela em Markdown.
```

3. Adicione exemplos (Few-Shot):
   - Simule uma interação e ajuste até o formato ficar consistente.
   - Exemplo de input: "Tenho frango, arroz e brócolis."
4. Faça teste de estresse (edge cases):
   - Exemplo: "Tenho pedra, sabão e pão."
   - Verifique se a IA mantém as regras e não sai do personagem.

---

## Parte 4: Entrega e apresentação

Cada grupo deve apresentar:

1. O texto do System Prompt final.
2. Demonstração com:
   - input válido
   - edge case
   - input inválido/adversarial
4. Explicação breve: o que mudou e por que melhorou.
