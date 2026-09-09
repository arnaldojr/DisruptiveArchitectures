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