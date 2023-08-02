const int led = 13; //define o apelido led para o valor 13
const int botao = 5; //define o apelido botao para o valor 5

void setup(){
  pinMode(led,OUTPUT); //declara o pino13 (led) como saida
  pinMode(botao, INPUT_PULLUP); //declara o pino5 (botao) como entrada
}


void loop(){
  // Faz a leitura do botao
  if(digitalRead(botao) == LOW){
    digitalWrite(led, HIGH); //acende o led
    delay(100); //delay em milisegundos
    digitalWrite(led, LOW); //apaga o led
    delay(100); //delay em milisegundos
  }
}
