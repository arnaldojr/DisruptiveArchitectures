## Memoria EEPROM

A memória EEPROM (Electrically Erasable Programmable Read-Only Memory) é uma memória não volátil, o que significa que os dados armazenados nela persistem mesmo depois de desligar o Arduino. É útil para armazenar pequenas quantidades de dados que precisam ser preservados entre reinicializações, como configurações ou contadores.

!!! warning
    Essa memoria não é infinita, pelo contrario! a memoria EEPROM é bem pequena, no caso do Arduino UNO é de apenas 1KB (1000 Bytes) tenha isso em mente para não ultrapassar esse valor.


## Desafio 1: Escrevendo e Lendo Dados na EEPROM

Neste desafio, vamos aprender a escrever e ler dados na memória EEPROM. Vamos escrever apenas 1 unico valor inteiro.

Monte um circuito com um botão no pino 2 e carregue o seguinte código no seu Arduino:

```C
#include <EEPROM.h>

const int buttonPin = 2; // Pino do botão
int lastButtonState = HIGH;
int buttonState; 

unsigned long lastDebounceTime = 0;
unsigned long debounceDelay = 50;    

void setup() {
  Serial.begin(9600);
  pinMode(buttonPin, INPUT_PULLUP); 
  
  EEPROM.write(0, 123); // Escreve o valor 123 na posição 0 da EEPROM
  delay(10); // Pequeno delay para garantir a escrita na memoria
}

void loop() {
  int reading = digitalRead(buttonPin); // Lê o estado do botão
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }
  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading != buttonState) {
      buttonState = reading;

      // Se o botão estiver pressionado (estado LOW devido ao pull-up)
      if (buttonState == LOW) {

        int valor = EEPROM.read(0); // Lê o valor na posição 0 da EEPROM
        Serial.println(valor); // Imprime o valor
      }
    }
  }

  lastButtonState = reading; // Atualiza o estado anterior do botão
}

```

## Desafio 2: Armazenando e Recuperando Strings

Agora altere o código para escrever e ler `Strings`. 

Altre o código do desafio 1 para:

    - Salve na memoria EEPROM a frase: `Let's Rock the Future` 
    - Recuperar o valor salvo na memoria quando apertar o botão.

!!! tip
    - Defina a frase como do tipo String. `String frase = "sua frase aqui"`
    - Conheça um pouco mais do objeto String lendo a documentação [aqui](https://www.arduino.cc/reference/pt/language/variables/data-types/stringobject/)
    - Para salvar na memoria EEPROM temos que rodar um `laço for` para salvar caractere por caractere. ` for (int i = 0; i < frase.length(); i++){}`
    - Dentro do laço for, defina a posição inicial da memoria e salve cada indice do frase `EEPROM.write(startPos + i, frase[i]);`
    - Faça a mesma coisa para recuperar os dados.     


## Desafio 3: Exiba os resultados em um display LCD

Agora vamos exibir o valor da memoria EEPROM em um display LCD. Para isso, busque por referências na internet de como realizar a ligação e elaborar o circuito.  

!!! tip
    execute os codigo exemplo que encontrar na internet para verificar o funcionamento do circuito antes de escrever seu proprio código