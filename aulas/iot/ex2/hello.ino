int led = 13; //define o apelido led para o valor 13

void setup(){
  pinMode(led,OUTPUT); //declara o pino13 (led) como saida
}


void loop(){
  digitalWrite(led, HIGH); //acende o led
  delay(1000); //delay em milisegundos
  digitalWrite(led, LOW); //apaga o led
  delay(1000); //delay em milisegundos
}

