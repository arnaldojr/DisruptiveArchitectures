# CHECKPOINT 6  

>
> **Data de apresentação:** 05/11/2025 - presencial em aula
>

## Objetivo

Desenvolver um **aplicativo mobile inteligente** que utilize **IA Generativa** para **analisar informações extraídas de cupons fiscais** e **gerar insights financeiros personalizados**.


## Desafio

O desafio consiste em criar um **app mobile funcional** capaz de:

- **Capturar uma imagem** de um cupom fiscal (via câmera do dispositivo).  
- **Extrair informações relevantes** utilizando IA generativa e APIs do **Firebase AI Logic**, como:
  - Valor total da compra  
  - Data e hora da transação  
  - Nome do estabelecimento  
  - Categoria da despesa (alimentação, transporte, lazer etc.)  
- **Persistir os dados extraídos** em um banco de dados **Firebase (Firestore)**.  
- **Implementar um assistente de IA Generativa** integrado com o **Firebase AI Logic**, que:
  - Analise os dados salvos e gere **insights financeiros personalizados**.  
  - Produza **respostas em linguagem natural**.

## Documentação Oficial

A integração com o Firebase deve seguir obrigatoriamente a documentação oficial:

- [https://firebase.google.com/docs/ai-logic](https://firebase.google.com/docs/ai-logic)

---

## IA em Duas Dimensões

### 1. No Aplicativo

O app utilizará o **modelo Gemini 2.5 Flash** para interpretar os dados extraídos dos cupons (imagem-texto) e gerar análises (texto-texto).  

> Exemplo: “Suas despesas em alimentação aumentaram 15% em relação ao mês anterior.”

### 2. No Desenvolvimento

Utilizar o **VS Code com o GitHub Copilot ativado** para auxiliar na escrita de código, refatoração e documentação (texto-código, código-código).  
Essa prática será avaliada como parte da **integração da IA no processo de desenvolvimento**.


## Funcionalidades Esperadas
- Captura de imagem (cupom fiscal)  
- Extração automática dos dados [https://firebase.google.com/docs/ai-logic/analyze-images?api=dev](https://firebase.google.com/docs/ai-logic/analyze-images?api=dev)  
- Armazenamento das informações extraídas no Firebase  
- Consulta e exibição dos registros no app  
- Geração de insights com IA Generativa [https://firebase.google.com/docs/ai-logic/chat?api=dev](https://firebase.google.com/docs/ai-logic/chat?api=dev)  
- Interface amigável e responsiva  


## Features Extras (opcional)

- Exibir **gráficos de gastos mensais** por categoria  
- Implementar **notificações de alertas de gastos**  
- Criar um **chatbot financeiro** dentro do app  


##  Apresentação e Entregáveis

- **Demonstração do app funcional**  
- **Repositório no GitHub** com código e README




**Data de apresentação:** 05/11/2025 - presencial em aula
