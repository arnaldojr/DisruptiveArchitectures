# Python para aplicações com IA

Antes de adicionar ferramentas ao assistente, vamos fortalecer algumas habilidades de programação que serão necessárias nos próximos laboratórios.

[**Abrir no Google Colab**](https://colab.research.google.com/github/arnaldojr/DisruptiveArchitectures/blob/master/material/aulas/genAI/lab2_5/lab2_5_python_colab.ipynb){ .md-button .md-button--primary }

[Baixar notebook](lab2_5_python_colab.ipynb){ .md-button download="lab2_5_python_colab.ipynb" }

---

## Objetivos

Esta não é uma revisão completa da linguagem. O foco está nas construções que aparecem em aplicações de IA.

---

## Como estudar com o notebook

Cada etapa segue quatro ações:

```text
Leia → Preveja → Execute → Altere
```

- **Leia:** identifique as variáveis e operações presentes no código.
- **Preveja:** tente imaginar o resultado antes de executar.
- **Execute:** confira a saída produzida pelo Python.
- **Altere:** modifique um valor ou uma regra e observe o efeito.

Quando encontrar uma seção **Sua vez**, tente escrever o código antes de consultar a solução apresentada na etapa seguinte.

---

## O catálogo de livros

Começaremos representando cada livro com um dicionário:

```python
livro = {
    "id": 1,
    "titulo": "Eu, Robô",
    "autor": "Isaac Asimov",
    "categoria": "ficcao",
    "disponivel": True,
}
```

Vários livros serão armazenados em uma lista. Ao longo da aula, você criará funções para cadastrar, consultar e listar livros disponíveis.

---

## Funções e fluxo de dados

Uma função recebe dados, executa uma responsabilidade e pode devolver um resultado:

```text
argumentos → função → resultado
```

Por exemplo:

```python
resultado = consultar_livro(1)
```

Essa separação será importante no próximo laboratório, quando o modelo poderá sugerir o nome de uma função e seus argumentos.

---

## Orientação a objetos

Depois de trabalhar com dicionários, o mesmo livro será representado por uma classe. Você verá apenas os fundamentos necessários:

- classe e objeto;
- `__init__` e `self`;
- atributos;
- um método simples;
- herança no nível necessário para compreender `BaseModel`.

Conceitos avançados de orientação a objetos não fazem parte desta aula.

---

## Validação com Pydantic

Type hints como `str`, `int` e `bool` ajudam a documentar o tipo esperado, mas o Python não valida todos esses dados automaticamente durante a execução.

O Pydantic permite definir um modelo com campos e restrições:

```python
class LivroValidado(BaseModel):
    id_livro: int = Field(gt=0)
    titulo: str = Field(min_length=2)
```

Ao criar um objeto, a biblioteca valida os valores. Se algum deles não atender às regras, será gerado um `ValidationError` que a aplicação poderá tratar.

---

## Python e JSON

Um dicionário Python e um objeto JSON são parecidos, mas não são a mesma coisa:

| Python | JSON |
| --- | --- |
| `dict` | objeto |
| `list` | array |
| `True` / `False` | `true` / `false` |
| `None` | `null` |

O módulo `json` realiza a conversão entre essas representações.

---

## Miniaplicação final

Ao final, o programa receberá uma solicitação estruturada:

```python
{
    "nome": "consultar_livro",
    "argumentos": {"id_livro": 1},
}
```

A aplicação irá:

1. verificar o nome da operação;
2. validar os argumentos;
3. executar apenas uma função conhecida;
4. produzir um resultado;
5. converter esse resultado para JSON.

Esse fluxo será retomado no Lab 3. A diferença é que o nome da função e os argumentos poderão ser sugeridos pelo llm.
