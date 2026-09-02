const int led = 13; //define o apelido led para o valor 13
const int botao = 2; //define o apelido botao para o valor 5

const int ledPwm = 11; //define o apelido ledPwm para o valor 11
const int potAD = A0; //define o apelido potenciometro para o valor A0



void setup(){
  //  Entradas e saidas digitais
  pinMode(led,OUTPUT); //declara o pino13 (led) como saida
  pinMode(botao,INPUT_PULLUP); //declara o pino13 (led) como saida
  // Entradas e saidas analógicas
  pinMode(ledPwm,OUTPUT); //declara o pino11 (ledPwm) como saida
  pinMode(potAD, INPUT); //declara o pinoA0 (potenciometro) como entrada


  //-----------  Configuração da Interrução ------------------- //                                 

  attachInterrupt(digitalPinToInterrupt(botao),interrupcaoPino2,RISING);  //  Configura o pino2 como interrupção externa do tipo Rising (borda de LOW para HIGH)
  //attachInterrupt(digitalPinToInterrupt(3),interrupcaoPino3,RISING);  //  Configura o pino2 como interrupção externa do tipo Rising (borda de LOW para HIGH)
  
}

void loop(){  
  //------- Programa pricipal -----//
  int pot = analogRead(potAD);
  if (pot >= 500){
    digitalWrite(ledPwm, !digitalRead(ledPwm));	
    delay(100);    
  } 
   
}

void interrupcaoPino2()           //funcão de interrupção do pino2, é executado quando o botao do pino2 pressionado
{                    
  digitalWrite(led, !digitalRead(led));
}
