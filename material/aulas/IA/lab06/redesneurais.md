# Redes Neurais Artificiais

## Introdução

As **Redes Neurais Artificiais (RNA)** são modelos computacionais inspirados no funcionamento do sistema nervoso biológico. Elas representam uma das abordagens mais poderosas e versáteis do aprendizado de máquina, capazes de:

- **Aprender padrões não lineares** e interações entre variáveis difíceis de modelar com técnicas lineares
- **Aproximar funções não-lineares** arbitrárias (quando bem dimensionadas e treinadas), graças ao seu poder de representação
- **Resolver problemas** de classificação, regressão e clustering
- **Processar múltiplas modalidades:** como dados de dados de imagens, texto e séries temporais...

### Quando considerar RNAs (regra prática):

- Relações claramente "não lineares" entre entradas e saídas.
- "Muitos atributos" (alta dimensionalidade) e grande volume de dados.
- Necessidade de aprender representações (extração automática de características).

### Quando suspeitar que RNAs não são a melhor 1ª escolha:

 - Poucos dados rotulados e problema simples → tente modelos lineares, kNN ou árvores antes.
 - Forte necessidade de interpretabilidade imediata → prefira modelos explicáveis (árvores, regressões com regularização, regras).

## Intuição básica

### O Neurônio Biológico

O neurônio é a unidade fundamental do sistema nervoso, composto por:

![alt text](Complete_neuron_cell_diagram_en.svg)


```
Dendritos → Soma → Axônio → Sinapses
    ↑        ↑       ↑        ↑
  Entrada  Processamento  Transmissão  Saída
```

#### Componentes principais:

- **Dendritos**: Recebem sinais de outros neurônios
- **Soma (corpo celular)**: Integra e processa os sinais
- **Axônio**: Transmite o sinal processado
- **Sinapses**: Conexões com outros neurônios

### Processo de Comunicação Neural

1. **Recepção**: Dendritos captam neurotransmissores
2. **Integração**: Soma pondera e combina os sinais
3. **Limiar**: Se o potencial excede um limiar, o neurônio "dispara"
4. **Transmissão**: Sinal elétrico percorre o axônio
5. **Liberação**: Neurotransmissores são liberados nas sinapses

## Neurônio Artificial

### Modelo Matemático

O neurônio artificial é uma abstração matemática do neurônio biológico:

![alt text](image.png)

```
x₁ ──w₁──┐
x₂ ──w₂──┤
    ...  ├─→ Σ ──→ f(net) ──→ y
xₙ ──wₙ──┘
    b ───┘
```

#### Equações fundamentais:

**Net Input (Entrada líquida):**
```
net = Σ(wᵢ × xᵢ) + b = w₁x₁ + w₂x₂ + ... + wₙxₙ + b
```

**Saída:**
```
y = f(net)
```

Onde:
- `xᵢ`: Entradas do neurônio
- `wᵢ`: Pesos sinápticos
- `b`: Bias (limiar)
- `f`: Função de ativação
- `y`: Saída do neurônio

### Funções de Ativação Clássicas

#### 1. Função Degrau (Step Function)
```
f(x) = { 1, se x ≥ 0
       { 0, se x < 0
```
- **Uso**: Perceptron clássico
- **Característica**: Saída binária

#### 2. Função Sigmóide
```
f(x) = 1 / (1 + e^(-x))
```
- **Intervalo**: (0, 1)
- **Característica**: Diferenciável, suave
- **Problema**: Saturação dos gradientes

#### 3. Função Tangente Hiperbólica (tanh)
```
f(x) = (e^x - e^(-x)) / (e^x + e^(-x))
```
- **Intervalo**: (-1, 1)
- **Vantagem**: Centrada em zero

#### 4. Função ReLU (Rectified Linear Unit)
```
f(x) = max(0, x)
```
- **Vantagem**: Resolve o problema de gradientes
- **Uso**: Redes profundas modernas

## Perceptron

### Conceito e História

O **Perceptron**, desenvolvido por Frank Rosenblatt em 1957, foi o primeiro algoritmo de aprendizado para redes neurais que garantia convergência para problemas linearmente separáveis.

### Arquitetura do Perceptron

```
Entrada → Pesos → Soma → Ativação → Saída
x₁,x₂,...,xₙ → w₁,w₂,...,wₙ → Σ → f → y
```

### Algoritmo de Treinamento

**Pseudocódigo:**
```
1. Inicializar pesos aleatoriamente
2. Para cada época:
   a. Para cada amostra (x, d):
      - Calcular saída: y = f(Σwᵢxᵢ + b)
      - Calcular erro: e = d - y
      - Atualizar pesos: wᵢ = wᵢ + η × e × xᵢ
      - Atualizar bias: b = b + η × e
3. Repetir até convergência
```

**Parâmetros:**
- `η` (eta): Taxa de aprendizado
- `d`: Saída desejada
- `e`: Erro

### Teorema da Convergência

**Teorema**: Se os dados são linearmente separáveis, o algoritmo Perceptron converge em um número finito de iterações.

### Limitações do Perceptron

1. **Separabilidade linear**: Só resolve problemas linearmente separáveis
2. **Problema XOR**: Não consegue resolver o XOR
3. **Função de ativação**: Limitado a funções lineares por partes

## Multilayer Perceptron (MLP)

### Superando as Limitações

O **MLP** resolve as limitações do Perceptron através de:

1. **Camadas ocultas**: Permitem não-linearidade
2. **Múltiplas camadas**: Aumentam poder expressivo
3. **Backpropagation**: Algoritmo de treinamento eficiente

### Arquitetura MLP

![alt text](image-1.png)

```
Camada de    Camada(s)      Camada de
Entrada   →   Oculta(s)   →   Saída

x₁ ──────┐   h₁ ────────┐   y₁
x₂ ──────┤   h₂ ────────┤   y₂
  ...    ├─→  ... ────────┤→  ...
xₙ ──────┘   hₘ ────────┘   yₖ
```

### Teorema da Aproximação Universal

**Teorema**: Uma rede neural com uma única camada oculta e um número suficiente de neurônios pode aproximar qualquer função contínua com precisão arbitrária.

### Regras Práticas para Arquitetura

Historicamente, quando redes neurais eram menores e o custo computacional mais alto, surgiram algumas **heurísticas** para estimar o tamanho inicial da camada oculta em redes totalmente conectadas (MLPs).  
Essas regras **não são leis fixas**, mas podem servir como **ponto de partida**:

#### Número de neurônios na camada oculta:

- 1. Regra dos 2/3:
$$
\text{neurônios ocultos} \approx \frac{2}{3} \times (\text{neurônios de entrada}) + \text{neurônios de saída}
$$

> **Ideia:** reduzir a dimensionalidade da entrada mantendo espaço para representar as saídas.

- 2. Média geométrica

$$
\text{neurônios ocultos} \approx \sqrt{\text{entradas} \times \text{saídas}}
$$

> **Ideia:** buscar um equilíbrio proporcional entre o tamanho da entrada e o tamanho da saída.

---

- 3. Experimentação incremental *(abordagem mais usada atualmente)*

    - Comece com uma rede pequena.  
    - Monitore as métricas de treinamento e validação.  
    - Aumente gradualmente a quantidade de neurônios até atingir bom desempenho sem sobreajuste (*overfitting*).  
    - Utilize técnicas de regularização (*dropout*, L2, *batch normalization*) para manter a generalização.


!!! tip

    > Essas regras não consideram fatores como complexidade do problema, qualidade dos dados ou arquiteturas modernas (CNNs, RNNs, Transformers). 

    > Hoje, a prática recomendada é combinar um **chute inicial** com **ajuste via validação cruzada** e ferramentas de **busca de hiperparâmetros**.


#### Número de camadas ocultas:

O número de camadas ocultas em uma rede neural influencia diretamente a **capacidade de representação** do modelo.  
De forma geral, temos:

- **1 camada oculta:**  
  Indicada para problemas que se tornam linearmente separáveis após uma transformação não linear.  
  Exemplo: classificação simples com fronteiras suaves.

- **2 camadas ocultas:**  
  Capaz de aproximar **qualquer função contínua** arbitrária (Teorema da Aproximação Universal).  
  Útil quando há relações mais complexas entre entrada e saída.

- **3 ou mais camadas ocultas:**  
  Necessárias para representar **funções descontínuas** ou padrões muito complexos.  
  Base do **Deep Learning**, permitindo a extração de características em múltiplos níveis.

> 💡 **Observação:** Embora mais camadas aumentem a capacidade do modelo, também elevam o risco de **overfitting** e a necessidade de mais dados e regularização.


