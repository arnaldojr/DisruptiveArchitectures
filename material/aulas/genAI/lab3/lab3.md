# Ferramentas e saídas estruturadas

Nos laboratórios anteriores, você definiu o comportamento de um assistente e o conectou à Gemini API. Agora a NIA deixará de apenas produzir texto: ela passará a entregar **dados estruturados** e a solicitar a execução de **funções Python**.

Ao final, você terá um assistente capaz de identificar uma solicitação de suporte, abrir um chamado fictício e consultar seu status.

[**Abrir no Google Colab**](https://colab.research.google.com/github/arnaldojr/DisruptiveArchitectures/blob/master/material/aulas/genAI/lab3/lab3_ferramentas_colab.ipynb){ .md-button .md-button--primary }

[Baixar notebook](lab3_ferramentas_colab.ipynb){ .md-button download="lab3_ferramentas_colab.ipynb" }

---

## Objetivos do laboratório

Neste laboratório, você irá:

1. gerar uma resposta que obedece a um schema JSON;
2. validar a resposta usando um modelo Pydantic;
3. declarar funções disponíveis para o LLM;
4. executar uma função escolhida pelo modelo;
5. devolver o resultado da execução ao modelo;
6. limitar quais ações o assistente pode realizar.

---

## Texto para pessoas e dados para sistemas

Uma resposta como esta funciona bem para leitura:

```text
O usuário parece ter um problema de energia e precisa de atendimento urgente.
```

Entretanto, outro componente do sistema teria dificuldade para encontrar com segurança a categoria e a prioridade dentro da frase.

Para uma aplicação, uma estrutura previsível é mais útil:

```json
{
  "categoria": "energia",
  "resumo": "Notebook não liga mesmo conectado ao carregador",
  "prioridade": "alta",
  "precisa_esclarecimento": false,
  "pergunta": null
}
```

Uma **saída estruturada** combina a interpretação do modelo com um contrato definido pela aplicação. O schema determina campos, tipos e valores permitidos.

!!! note "Schema não garante verdade"

    Um JSON válido pode conter uma classificação incorreta. O schema garante a forma da resposta, mas testes e regras de negócio continuam necessários.

---

## O que é function calling?

Function calling permite informar ao modelo quais operações a aplicação oferece. O modelo pode escolher uma função e produzir seus argumentos, mas o código da aplicação é responsável por executá-la.

```text
Mensagem do usuário
        ↓
Modelo escolhe uma função e seus argumentos
        ↓
Aplicação valida e executa a função
        ↓
Resultado da função retorna ao modelo
        ↓
Resposta final para o usuário
```

Essa separação é importante: o modelo não recebe acesso livre ao computador, ao banco de dados ou a outros sistemas. A aplicação expõe apenas operações específicas.

### Exemplo de ferramenta

```python
def consultar_status_chamado(numero: int) -> dict:
    # A aplicação consulta sua própria fonte de dados.
    ...
```

A declaração apresentada ao modelo informa o nome da função, seu objetivo e os parâmetros aceitos. Ela não contém a implementação nem concede permissões adicionais.

---

## Responsabilidades de cada componente

| Componente | Responsabilidade |
| --- | --- |
| LLM | Interpretar a solicitação e sugerir uma chamada de função |
| Schema | Definir o formato e os tipos esperados |
| Código Python | Validar argumentos e executar somente funções autorizadas |
| Sistema externo | Armazenar ou consultar dados reais, quando existir |

No laboratório, o “sistema de chamados” será apenas um dicionário Python em memória. Ao reiniciar o notebook, os dados serão apagados.

---

## Testes e limites

Uma ferramenta precisa ser testada tanto quando deve ser chamada quanto quando deve permanecer inativa. No notebook, você verificará:

- solicitação completa para abertura de chamado;
- solicitação sem informações suficientes;
- consulta a um chamado existente e a um inexistente;
- tentativa de executar uma ação que não foi disponibilizada;
- argumentos inválidos enviados à função.

O objetivo não é apenas fazer a demonstração funcionar. É observar onde termina a decisão do modelo e onde começa o controle da aplicação.

---

## Entrega

Ao final do notebook, cada grupo deverá apresentar:

1. uma saída estruturada validada;
2. pelo menos duas ferramentas disponíveis para a NIA;
3. evidência dos quatro testes obrigatórios;
4. uma explicação de como a aplicação restringe as ações do modelo;
5. a implementação de uma das opções do desafio final.

