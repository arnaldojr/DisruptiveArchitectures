# Lab 3.5 — Do protótipo ao produto

Até agora, seu assistente de IA funciona como um protótipo desenvolvido no Google Colab. O desafio deste laboratório é transformar esse protótipo em uma **aplicação de IA estruturada para execução fora do notebook**.

Use como base o projeto que você desenvolveu no laboratório anterior ou o projeto desenvolvido no CP.

[**Abrir no Google Colab**](https://colab.research.google.com/github/arnaldojr/DisruptiveArchitectures/blob/master/material/aulas/genAI/lab3/lab3_ferramentas_colab.ipynb){ .md-button .md-button--primary }

[Baixar notebook](../lab3/lab3_ferramentas_colab.ipynb){ .md-button download="lab3_ferramentas_colab.ipynb" }

## O desafio

Para isso, você deverá **pesquisar, definir e implementar** uma solução que contemple, no mínimo:

* **Arquitetura e organização do projeto:** definir uma estrutura adequada de pastas, arquivos e responsabilidades para a aplicação.
* **API:** criar uma API capaz de receber uma solicitação do usuário, executar o assistente e retornar a resposta.
* **Banco de dados:** utilizar persistência para armazenar informações relevantes da aplicação, como interações, resultados e logs.

A escolha das tecnologias, frameworks, banco de dados e organização interna faz parte do desafio.

Ao final, o assistente deverá poder ser executado **fora do Google Colab** e acessado por meio da API criada.

## Como pesquisar e desenvolver

1. **Comece pelas dúvidas:** o que pode ser reaproveitado do notebook? Como separar responsabilidades, receber uma requisição e salvar dados que permaneçam após reiniciar a aplicação?
2. **Pesquise uma necessidade por vez:** use buscas específicas, como “módulos e pacotes Python”, “API HTTP em Python” e “persistência de dados em Python”. Compare as alternativas pelo que seu projeto precisa.
3. **Filtre as referências:** confira versões, dependências e exemplos na documentação oficial. Prefira materiais que expliquem as decisões e que você consiga testar. Evite adicionar componentes sem entender sua função.
4. **Teste antes de integrar:** experimente separadamente a API, a gravação e leitura no banco e a chamada ao assistente. Depois, conecte essas partes.
5. **Use IA com critério:** peça explicações e referências, confira as fontes e teste as sugestões. Você deverá conseguir explicar o código incorporado ao projeto.

## GitHub e portfólio

Crie um repositório no GitHub desde o início e registre a evolução com commits que descrevam as mudanças. 

Não publique chaves de API, senhas ou dados pessoais.

Use variáveis de ambiente e configure o `.gitignore`.

O **README** deverá conter instruções de instalação, execução e teste da aplicação, além de explicar a arquitetura e decisões técnicas do projeto.

O repositório será o portfólio final do projeto. Verifique se outra pessoa consegue entender e executar o projeto seguindo o README.

## Entrega

Apresentação do projeto no dia da aula, mostrando a arquitetura, decisões técnicas e funcionamento da aplicação.