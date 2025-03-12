# Guia de Programação C para Arduino

## Introdução

Este guia fornece uma introdução prática à programação em C para o Arduino, abordando conceitos fundamentais e boas práticas para desenvolvimento de projetos com microcontroladores. 

O objetivo é ajudar você a entender a sintaxe básica do C e como aplicá-la em projetos de IoT e sistemas embarcados.

## Estrutura Básica de um Programa em C para Arduino

Todo programa Arduino é composto de duas funções principais:

### Função `setup()`

A função `setup()` é executada uma vez quando o programa começa. É usada para inicializar variáveis, pinos de entrada e saída, bibliotecas, etc.

```c
void setup() {
  // Inicializa o pino digital 13 como saída
  pinMode(13, OUTPUT);
}
```

### Função `loop()`

A função `loop()` contém o código que é executado repetidamente até que o Arduino seja desligado. É aqui que a lógica principal do programa reside.

```c
void loop() {
  digitalWrite(13, HIGH);   // Liga o LED
  delay(1000);              // Espera por um segundo
  digitalWrite(13, LOW);    // Desliga o LED
  delay(1000);              // Espera por um segundo
}
```

## Conceitos Fundamentais

### Variáveis

Variáveis são usadas para armazenar dados que podem ser manipulados pelo programa. No Arduino, as variáveis comuns incluem:

- `int`: Números inteiros
- `float`: Números de ponto flutuante
- `char`: Caracteres individuais
- `String`: Cadeias de caracteres

```c
int ledPin = 13;
float temperatura = 23.5;
char inicial = 'A';
String texto = "Hello, World!";
```

### Estruturas de Controle

#### Condicionais

- `if`, `else if`, `else`: Executa blocos de código com base em condições.

```c
if (temperature > 25) {
  digitalWrite(ledPin, HIGH);
} else {
  digitalWrite(ledPin, LOW);
}
```

#### Loops

- `for`: Executa um bloco de código um número específico de vezes.
- `while`: Executa um bloco de código enquanto uma condição for verdadeira.
- `do...while`: Executa um bloco de código pelo menos uma vez, e então repete enquanto a condição for verdadeira.

```c
for (int i = 0; i < 10; i++) {
  Serial.println(i);
}

while (digitalRead(buttonPin) == LOW) {
  // Espera o botão ser pressionado
}

int j = 0;
do {
  Serial.println(j);
  j++;
} while (j < 5);
```

### Funções

Funções são blocos de código que executam tarefas específicas. Elas ajudam a organizar e reutilizar o código.

```c
void acenderLed(int pino) {
  digitalWrite(pino, HIGH);
}

void apagarLed(int pino) {
  digitalWrite(pino, LOW);
}

void loop() {
  acenderLed(ledPin);
  delay(1000);
  apagarLed(ledPin);
  delay(1000);
}
```

### Arrays

Arrays são coleções de variáveis do mesmo tipo, armazenadas em locais de memória contíguos. Eles são úteis para armazenar listas de valores.

```c
int numeros[5] = {10, 20, 30, 40, 50};

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 5; i++) {
    Serial.println(numeros[i]);
  }
}
```

### Manipulação de Arrays

```c
void inverterArray(int arr[], int tamanho) {
  for (int i = 0; i < tamanho / 2; i++) {
    int temp = arr[i];
    arr[i] = arr[tamanho - 1 - i];
    arr[tamanho - 1 - i] = temp;
  }
}

void setup() {
  int dados[5] = {1, 2, 3, 4, 5};
  inverterArray(dados, 5);
  for (int i = 0; i < 5; i++) {
    Serial.println(dados[i]);
  }
}
```

### Ponteiros

Ponteiros são variáveis que armazenam endereços de memória. Eles são poderosos para manipulação de dados e memória.

```c
int valor = 10;
int *ponteiro = &valor;

void setup() {
  Serial.begin(9600);
  Serial.println(*ponteiro); // Acessa o valor usando o ponteiro
  *ponteiro = 20;
  Serial.println(valor); // Valor alterado através do ponteiro
}
```

### Ponteiros e Arrays

```c
void imprimirArray(int *arr, int tamanho) {
  for (int i = 0; i < tamanho; i++) {
    Serial.println(*(arr + i));
  }
}

void setup() {
  int numeros[3] = {100, 200, 300};
  imprimirArray(numeros, 3);
}
```

### Structs

Structs são usadas para agrupar variáveis relacionadas sob um único nome. Elas são úteis para representar objetos complexos.

```c
typedef struct {
  int idade;
  float altura;
  char nome[50];
} Pessoa;

void setup() {
  Serial.begin(9600);
  Pessoa aluno = {20, 1.75, "João"};
  Serial.print("Nome: ");
  Serial.println(aluno.nome);
  Serial.print("Idade: ");
  Serial.println(aluno.idade);
  Serial.print("Altura: ");
  Serial.println(aluno.altura);
}
```

### Manipulação de Structs

```c
void imprimirPessoa(Pessoa p) {
  Serial.print("Nome: ");
  Serial.println(p.nome);
  Serial.print("Idade: ");
  Serial.println(p.idade);
  Serial.print("Altura: ");
  Serial.println(p.altura);
}

void setup() {
  Pessoa professor = {35, 1.80, "Carlos"};
  imprimirPessoa(professor);
}
```

## Boas Práticas

- **Comente seu código**: Use comentários para explicar o que o código faz, especialmente para lógica complexa.
- **Use nomes descritivos**: Escolha nomes de variáveis e funções que descrevam claramente seu propósito.
- **Modularize o código**: Divida o código em funções para melhorar a legibilidade e a reutilização.
- **Teste frequentemente**: Teste pequenas partes do código à medida que desenvolve para identificar problemas rapidamente.

## Recursos Adicionais

- [Documentação Oficial do Arduino](https://www.arduino.cc/reference/en/)
- [Curso de C para Arduino (YouTube)](https://www.youtube.com/watch?v=xyz)
- [Livro: "Programming Arduino: Getting Started with Sketches"](https://www.amazon.com/Programming-Arduino-Getting-Started-Sketches/dp/0071784225)

Este guia serve como um ponto de partida para a programação em C no Arduino.