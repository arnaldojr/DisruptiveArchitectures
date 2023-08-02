## O que esse código faz?

Este código de exemplo demonstra como controlar dois LEDs com Arduino usando um botão e um potenciômetro, substituindo o uso de `delay()` por `millis()`. Um LED alterna seu estado a cada 100 milissegundos ao pressionar um botão, enquanto o outro LED alterna seu estado no mesmo intervalo quando o valor do potenciômetro é maior ou igual a 500.

## Circuito protoboard

![](botao_pot_millis.png)

## Código

```c
const int led = 13; //define o apelido led para o valor 13
const int botao = 5; //define o apelido botao para o valor 5
const int ledPwm = 11; //define o apelido ledPwm para o valor 11
const int potAD = A0; //define o apelido potenciometro para o valor A0

unsigned long tempo1 = 0, tempo2 = 0;

void setup() {
  // Entradas e saídas digitais
  pinMode(led, OUTPUT); //declara o pino13 (led) como saída
  pinMode(botao, INPUT_PULLUP); //declara o pino5 (botao) como entrada

  // Entradas e saídas analógicas
  pinMode(ledPwm, OUTPUT); //declara o pino11 (ledPwm) como saída
  pinMode(potAD, INPUT); //declara o pinoA0 (potenciometro) como entrada
}

void loop() {
  //usando millis no lugar do delay
  if (millis() - tempo1 >= 100){
    tempo1 = millis(); 
    if (digitalRead(botao) == LOW){
      digitalWrite(led, !digitalRead(led));	   
    }
  }
  // usando millis 
  int pot = analogRead(potAD);
  if (millis() - tempo2 >= 100 && pot >= 500){
    tempo2 = millis(); 
    digitalWrite(ledPwm, !digitalRead(ledPwm));	    
  }
}
```

??? note "Circuito simulador"
    ![](botao_pot_millis.png)

## Links para Download

* [Código arduino](botao_pot_millis.ino)

* [Thinkercad online](https://www.tinkercad.com/things/1S2zV5j5P5o-captivating-mox-duino/editel?sharecode=4vGvV8WZFFHk9q3zqYJbc_-C8oGJRKoRn7zfk1dfQdk)

* [SimulIDE](botao_pot_millis.simu)
