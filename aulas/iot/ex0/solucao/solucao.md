## Solução From Zero to Hero!!  


### Exercicio 1

!!! exercise
    "Hello, World!" no Monitor Serial

    Familiarize-se com o Arduino IDE e o Monitor Serial, escrevendo um programa simples que imprime "Hello, World!" no Monitor Serial.

 
```c
void setup() {
  // Inicia a comunicação serial com o monitor em 9600 bps
  Serial.begin(9600);
}

void loop() {
  
  Serial.println("Hello, World!");
  delay(1000); // Aguarda 1 segundo
}

```


!!! progress
    Continuar...


### Exercicio 2

!!! exercise
    Variáveis e Operações Matemáticas

    Crie um programa que recebe dois números inteiros do Monitor Serial, realiza operações matemáticas básicas (adição, subtração, multiplicação e divisão) e exibe os resultados no Monitor Serial.

```c
int num1, num2;

void setup() {
  Serial.begin(9600);
}

void loop() {
    Serial.println("Digite o primeiro número:");
    while (Serial.available() == 0) {} // Aguarda o primeiro número
    num1 = Serial.parseInt();

    Serial.println("Digite o segundo número:");
    while (Serial.available() == 0) {} // Aguarda o segundo número
    num2 = Serial.parseInt();

    Serial.print("Soma: ");
    Serial.println(num1 + num2);

    Serial.print("Subtração: ");
    Serial.println(num1 - num2);

    Serial.print("Multiplicação: ");
    Serial.println(num1 * num2);

    if (num2 != 0) {
      Serial.print("Divisão: ");
      Serial.println(num1 / num2);
    } else {
      Serial.println("Divisão por zero não permitida.");
    }
    delay(1000); // Aguarda 1 segundo
}
```


!!! progress
    Continuar...


### Exercicio 3

!!! exercise
    Estruturas de Controle: if, else e switch-case

    Escreva um programa que receba um número inteiro do Monitor Serial e, usando estruturas de controle, verifique se o número é par ou ímpar, positivo ou negativo e imprima o resultado no Monitor Serial.

```c
void setup() {
    Serial.begin(9600);
    Serial.println("Digite um número inteiro:");
}

void loop() {

    if (Serial.available() > 0) {
        int num = Serial.parseInt();

        if (num % 2 == 0) {
            Serial.println("O número é par.");
        } else {
            Serial.println("O número é ímpar.");
        }

        if (num > 0) {
            Serial.println("O número é positivo.");
        } else if (num < 0) {
            Serial.println("O número é negativo.");
        } else {
            Serial.println("O número é zero.");
        }
        Serial.println("Digite um número inteiro:");  
    }
}

```


!!! progress
    Continuar...


### Exercicio 4

!!! exercise
    Estruturas de Repetição: for e while

    Desenvolva um programa que imprima no Monitor Serial os primeiros N números da sequência de Fibonacci, onde N é um número inteiro fornecido pelo usuário através do Monitor Serial.

```c
int n;

void setup() {
  Serial.begin(9600);
  Serial.println("Digite o valor de N:");
}

void loop() {
  if (Serial.available() > 0) {
    n = Serial.parseInt();
    int a = 0, b = 1, c;

    Serial.print("Sequência de Fibonacci: ");
    Serial.print(a);
    Serial.print(", ");
    Serial.print(b);

    for (int i = 2; i < n; i++) {
      c = a + b;
      Serial.print(", ");
      Serial.print(c);
      a = b;
      b = c;
    }
    Serial.println();
    Serial.println("Digite o valor de N:");
  }
}

```


!!! progress
    Continuar...


### Exercicio 5

!!! exercise
    Funções

    Crie um programa que utiliza funções para converter temperaturas entre graus Celsius e Fahrenheit. O usuário deve inserir a temperatura e a escala desejada (C ou F) no Monitor Serial, e o programa deve retornar a temperatura convertida.
    
```c
float converteFahrenheit(float celsius) {
  return celsius * 9.0 / 5.0 + 32;
}

float converteCelsius(float fahrenheit) {
    float valor = (fahrenheit - 32) * 5.0 / 9.0;
  return valor;
}

void setup() {
  Serial.begin(9600);
  Serial.println("Digite a temperatura e a escala (C ou F):");
}

void loop() {
  if (Serial.available() > 0) {
    float temp = Serial.parseFloat();
    char scale = Serial.read();

    if (scale == 'C' || scale == 'c') {
      Serial.print("Temperatura em Fahrenheit: ");
      Serial.println(converteFahrenheit(temp));
    } else if (scale == 'F' || scale == 'f') {
      Serial.print("Temperatura em Celsius: ");
      Serial.println(converteCelsius(temp));
    } else {
      Serial.println("Escala inválida.");
    }
  }
}

```



!!! progress
    Continuar...


### Exercicio 6

!!! exercise
    Vetores e manipulação de dados

    Desenvolva um programa que recebe uma sequência de N números inteiros pelo Monitor Serial, armazena em um vetor, e calcula a média, o maior e o menor número. Imprima os resultados no Monitor Serial.


```c
#define TAMANHO_MAXIMO 100  // Defina um tamanho máximo para o vetor

int vetor[TAMANHO_MAXIMO];  // Vetor de tamanho fixo

void setup() {
  Serial.begin(9600);
  Serial.println("Digite o numero de elementos no vetor:");
}

void lerElementos(int vetor[], int tamanho) {
  for (int i = 0; i < tamanho; i++) {
    Serial.print("Digite o numero ");
    Serial.print(i + 1);
    Serial.print(": ");
    
    while (Serial.available() == 0) {} // Aguarda input
    vetor[i] = Serial.parseInt();
    Serial.println(vetor[i]);
  }
}

float calcularMedia(int vetor[], int tamanho) {
  int soma = 0;
  for (int i = 0; i < tamanho; i++) {
    soma += vetor[i];
  }
  float media = (float)soma / tamanho;
  return media;
}

int encontrarMaior(int vetor[], int tamanho) {
  int maior = vetor[0];
  for (int i = 1; i < tamanho; i++) {
    if (vetor[i] > maior) {
      maior = vetor[i];
    }
  }
  return maior;
}

int encontrarMenor(int vetor[], int tamanho) {
  int menor = vetor[0];
  for (int i = 1; i < tamanho; i++) {
    if (vetor[i] < menor) {
      menor = vetor[i];
    }
  }
  return menor;
}

void loop() {
  if (Serial.available() > 0) {
    int n = Serial.parseInt();
    
    if (n > TAMANHO_MAXIMO) {
      Serial.print("Numero de elementos escolhido excede o tamanho máximo permitido de ");
      Serial.println(TAMANHO_MAXIMO);
      n = TAMANHO_MAXIMO;
    }

    Serial.print("Numero de elementos: ");
    Serial.println(n);
    
    lerElementos(vetor, n);
    

    float media = calcularMedia(vetor, n);
    int maior = encontrarMaior(vetor, n);
    int menor = encontrarMenor(vetor, n);
    
    Serial.print("Media: ");
    Serial.println(media);
  
    Serial.print("Maior numero: ");
    Serial.println(maior);
  
    Serial.print("Menor numero: ");
    Serial.println(menor);

    Serial.println("Digite o numero de elementos no vetor:");

  }
}

```


!!! progress
    Continuar...


### Exercicio 7

!!! exercise
    Manipulação de Strings

    Escreva um programa que receba uma string do Monitor Serial e determine o número de palavras, o número de vogais e o número de consoantes na string. Imprima os resultados no Monitor Serial.

!!! tip
    Esse exércicio não funcionou no tinkercad, mas no [wokwi](https://wokwi.com/) deu certo.


```c
#define TAMANHO_MAXIMO 100;  // Defina um tamanho máximo para o vetor

void setup() {
  Serial.begin(9600);
  Serial.println("Digite uma string:");
}
// O `\0` é o caractere nulo que indica o fim da string
// || é o operador lógico OU e && é o operador lógico E

#define TAMANHO_MAXIMO 100

void setup() {
  Serial.begin(9600);
  Serial.println("Digite uma string:");
}

void loop() {

  if (Serial.available() > 0) {
    char palavras[TAMANHO_MAXIMO]; // Array para armazenar a string com um tamanho máximo de 100 caracteres
  
    lerString(palavras, TAMANHO_MAXIMO);

    int numPalavras = contarPalavras(palavras);
    int numVogais = contarVogais(palavras);
    int numConsoantes = contarConsoantes(palavras);

    // Imprime os resultados no Monitor Serial
    Serial.print("Número de palavras: ");
    Serial.println(numPalavras);
    Serial.print("Número de vogais: ");
    Serial.println(numVogais);
    Serial.print("Número de consoantes: ");
    Serial.println(numConsoantes);

    // Aguarda nova entrada do usuário
    Serial.println("Digite outra string:");
  }
}

// Função que lê uma string da Serial e armazena em um array de caracteres
void lerString(char buffer[], int maxLength) {
  int index = 0;

  while (true) {
    if (Serial.available() > 0) {   // Verifica se há dados disponíveis na porta serial
      char receivedChar = Serial.read(); // Lê o caractere recebido

      if (receivedChar == '\n') {  // Verifica se o caractere é uma nova linha (Enter)
        buffer[index] = '\0';    // Termina a string com um caractere nulo
        Serial.print("Você digitou: ");
        Serial.println(buffer);  // Imprime a string recebida
        break;  // Sai do loop
      } else {
        buffer[index] = receivedChar; // Armazena o caractere no array
        index++;  // Incrementa o índice

        if (index >= maxLength - 1) {  // Limita o tamanho da string para evitar estouro de memória
          Serial.println("String muito longa!");
          buffer[index] = '\0';  // Termina a string com um caractere nulo
          break;  // Sai do loop
        }
      }
    }
  }
}

// Função que conta o número de palavras em uma string, considerando que uma palavra é uma sequência de letras minúsculas
int contarPalavras(char input[]) {
  int numPalavras = 0;
  bool novaPalavra = true;
  for (int i = 0; input[i] != '\0'; i++) {
    char c = input[i];
    if (c >= 'a' && c <= 'z') {
      if (novaPalavra) {
        numPalavras++;
        novaPalavra = false;
      }
    } else {
      novaPalavra = true;
    }
  }
  return numPalavras;
}

// Função que conta o número de vogais em uma string 
int contarVogais(char input[]) {
  int numVogais = 0;
  for (int i = 0; input[i] != '\0'; i++) {
    char c = input[i];
    if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
      numVogais++;
    }
  }
  return numVogais;
}

// Função que conta o número de consoantes em uma string
int contarConsoantes(char input[]) {
  int numConsoantes = 0;
  for (int i = 0; input[i] != '\0'; i++) {
    char c = input[i];
    if (c >= 'a' && c <= 'z' && !(c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u')) {
      numConsoantes++;
    }
  }
  return numConsoantes;
}


```


!!! progress
    Continuar...


### Exercicio 8

!!! exercise
    Ponteiros

    Crie um programa que recebe dois números inteiros do Monitor Serial e troque seus valores usando ponteiros. Imprima os valores antes e depois da troca no Monitor Serial.

```c
void troca(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
  }
  
  int num1, num2;
  
  void setup() {
    Serial.begin(9600);
    Serial.println("Digite o primeiro número:");
  }
  
  void loop() {
    if (Serial.available() > 0) {
      num1 = Serial.parseInt();
      Serial.println("Digite o segundo número:");
      
      while (Serial.available() == 0) {} // Aguarda o segundo número
      num2 = Serial.parseInt();
  
      Serial.print("Antes da troca: num1 = ");
      Serial.print(num1);
      Serial.print(", num2 = ");
      Serial.println(num2);
  
      troca(&num1, &num2);
  
      Serial.print("Depois da troca: num1 = ");
      Serial.print(num1);
      Serial.print(", num2 = ");
      Serial.println(num2);
  
      while (true); // Pausa o programa após a execução
    }
  }
  
```


!!! progress
    Continuar...


### Exercicio 9

!!! exercise
    Estruturas (structs) e Tipos Definidos pelo Usuário

    Crie um programa que gerencia informações de alunos, como nome, idade e notas. Utilize structs para armazenar as informações e funções para realizar operações, como adicionar um aluno, remover um aluno, calcular a média das notas e exibir as informações dos alunos no Monitor Serial.

!!! tip
    Esse eu fiz com ajuda do gpt, não consegui testar pra saber se está funcionando....

```c
struct Aluno {
    String nome;
    int idade;
    float notas[3];
  };
  
  Aluno alunos[10];
  int alunoCount = 0;
  
  void adicionarAluno() {
    if (alunoCount < 10) {
      Serial.println("Digite o nome do aluno:");
      while (Serial.available() == 0) {}
      alunos[alunoCount].nome = Serial.readString();
      
      Serial.println("Digite a idade do aluno:");
      while (Serial.available() == 0) {}
      alunos[alunoCount].idade = Serial.parseInt();
  
      for (int i = 0; i < 3; i++) {
        Serial.print("Digite a nota ");
        Serial.print(i + 1);
        Serial.println(":");
        while (Serial.available() == 0) {}
        alunos[alunoCount].notas[i] = Serial.parseFloat();
      }
      
      alunoCount++;
    } else {
      Serial.println("Número máximo de alunos alcançado.");
    }
  }
  
  void exibirAlunos() {
    for (int i = 0; i < alunoCount; i++) {
      Serial.print("Nome: ");
      Serial.println(alunos[i].nome);
      Serial.print("Idade: ");
      Serial.println(alunos[i].idade);
      float media = 0;
      for (int j = 0; j < 3; j++) {
        Serial.print("Nota ");
        Serial.print(j + 1);
        Serial.print(": ");
        Serial.println(alunos[i].notas[j]);
        media += alunos[i].notas[j];
      }
      Serial.print("Média: ");
      Serial.println(media / 3);
    }
  }
  
  void setup() {
    Serial.begin(9600);
    Serial.println("Gerenciamento de alunos:");
    adicionarAluno();
    adicionarAluno();
    exibirAlunos();
  }
  
  void loop() {}
  
```
<!--


!!! progress
    Continuar...


### Exercicio 10


!!! exercise
    Alocação dinâmica de memória
    Desenvolva um programa que solicita ao usuário o tamanho de um vetor de números inteiros e aloca dinamicamente a memória necessária. Em seguida, receba os elementos do vetor através do Monitor Serial, calcule a soma e a média dos valores e imprima os resultados no Monitor Serial. Não esqueça de liberar a memória alocada.

```c
int *vetor;
int n;

void setup() {
  Serial.begin(9600);
  Serial.println("Digite o tamanho do vetor:");
}

void loop() {
  if (Serial.available() > 0) {
    n = Serial.parseInt();
    vetor = (int*) malloc(n * sizeof(int));
    int soma = 0;

    for (int i = 0; i < n; i++) {
      Serial.print("Digite o número ");
      Serial.print(i + 1);
      Serial.println(":");
      while (Serial.available() == 0) {} // Aguarda input
      vetor[i] = Serial.parseInt();
      soma += vetor[i];
    }

    Serial.print("Soma: ");
    Serial.println(soma);

    Serial.print("Média: ");
    Serial.println(soma / (float)n);

    free(vetor); // Libera a memória alocada

    while (true); // Pausa o programa após a execução
  }
}

```

 Ninguém vê esse comentário -->