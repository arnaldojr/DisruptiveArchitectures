## O que esse código faz?

Este código de exemplo demonstra como controlar dois LEDs com Arduino usando um botão e um potenciômetro. Um LED acende e apaga em um intervalo de 100 milissegundos ao pressionar um botão, enquanto o outro LED acende e apaga no mesmo intervalo quando o valor do potenciômetro é maior ou igual a 500.

## Circuito protoboard

![](botao_pot_led.png)

## Código

```c
const int led = 13; //define o apelido led para o valor 13
const int botao = 5; //define o apelido botao para o valor 5
const int ledPwm = 11; //define o apelido ledPwm para o valor 11
const int potAD = A0; //define o apelido potenciometro para o valor A0

void setup(){
  // Entradas e saídas digitais
  pinMode(led, OUTPUT); //declara o pino13 (led) como saída
  pinMode(botao, INPUT_PULLUP); //declara o pino5 (botao) como entrada

  // Entradas e saídas analógicas
  pinMode(ledPwm, OUTPUT); //declara o pino11 (ledPwm) como saída
  pinMode(potAD, INPUT); //declara o pinoA0 (potenciometro) como entrada
}

void loop(){
  // Faz a leitura do botao
  if (digitalRead(botao) == LOW) {
    digitalWrite(led, HIGH); //acende o led
    delay(100); //delay em milissegundos
    digitalWrite(led, LOW); //apaga o led
    delay(100); //delay em milissegundos
  }
  // Faz a leitura analógica do potenciometro
  int pot = analogRead(potAD);
  if (pot >= 500) {
    digitalWrite(ledPwm, HIGH); //acende o led
    delay(100); //delay em milissegundos
    digitalWrite(ledPwm, LOW); //apaga o led
    delay(100); //delay em milissegundos
  }
}
```

??? note "Circuito simulador"
    ![](botao_pot_led.png)

## Links para Download

* [Código arduino](botao_pot_led.ino)

* [Thinkercad online](https://www.tinkercad.com/things/5b1JG4Y3q3t-super-invention/editel?sharecode=dS7V_4pLzX7VRYxT_0nhTAVBccXTDZoePQuIbPnwtiQ)

* [SimulIDE](botao_pot_led.simu)