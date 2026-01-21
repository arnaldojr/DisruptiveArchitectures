/*

JOGO DA MEMORIA - COM ARDUINO E SERIAL



Arnaldo Viana @2021

inspirado em: http://jeknowledge.github.io/academy-articles/jogo-da-memoria
*/


// Variáveis Globais
String recebido;
String sequenciaNumerica = "";

const int LED_PINS[] = {8, 9, 10}; // Array de LEDs
const long SERIAL_TIMEOUT = 10000; // Timeout de 10 segundos para leitura do Serial
const int NUM_LEDS = sizeof(LED_PINS) / sizeof(LED_PINS[0]);

long numeroGerado;

int sequencia;


// Definindo o enum para os estados do jogo
enum GameState {
  START_GAME,
  LEVEL_1,
  LEVEL_2,
  GAME_OVER,
  PLAY_AGAIN
};
GameState stateGame = START_GAME;

void setup() {
  // Iniciar comunicacao serial
  Serial.begin(9600);

  // Definir LEDs como OUTPUTs pinos 8,9 e 10
  for(int i = 0; i < NUM_LEDS; i++){
    pinMode(LED_PINS[i], OUTPUT);
  }
  // Definir a seed do gerador de números aleatórios
  randomSeed(analogRead(0));

}

void loop() {
  switch (stateGame) {
    case START_GAME:
      Serial.println("* INICIO *");
      Serial.println("Comecar? (s/n)");
      leserial();
      if (recebido.equalsIgnoreCase("s")){
        stateGame = LEVEL_1;
        Serial.println("Jogo começando...");
        piscaled(1000,3);
      } else {
        stateGame = GAME_OVER;
        Serial.println("Jogo não iniciado"); 
        piscaled(300,5);     
      }
      break;

    case LEVEL_1:
      Serial.println("* Nivel 1 *");
      geraSequencia(1000, 3); 
      leserial();
      if (recebido.equals(sequenciaNumerica)){
        stateGame = LEVEL_2;
        Serial.println("Parabens! proximo nivel.");
        piscaled(1000,3);
      } else {
        stateGame = GAME_OVER;
        Serial.println("Errooooo!!!"); 
        piscaled(300,5);     
      }
      break;

    case LEVEL_2:
      Serial.println("* Nivel 2 *");
      geraSequencia(1000, 5); 
      leserial();
      if (recebido.equals(sequenciaNumerica)){
        // Aqui, vamos terminar o jogo após o LEVEL_2. Você pode adicionar mais níveis se desejar.
        stateGame = GAME_OVER;
        Serial.println("Parabens! Você venceu!");
        piscaled(1000,3);
      } else {
        stateGame = GAME_OVER;
        Serial.println("Errooooo!!!"); 
        piscaled(300,5);     
      }
      break;

    case GAME_OVER:
      Serial.println("Game Over"); 
      piscaled(100,5);
      stateGame = PLAY_AGAIN;
      break;

    case PLAY_AGAIN:
      Serial.println("jogar novamente? (s/n)"); 
      leserial();
      if (recebido.equalsIgnoreCase("s")){
        stateGame = LEVEL_1;
        Serial.println("Jogo comecando...");
        piscaled(1000,3);
      } else {
        stateGame = GAME_OVER;
        Serial.println("Jogo nao iniciado"); 
        piscaled(300,5);     
      }
      break;
  }
}

void leserial(){

  Serial.println("* Insera sua resposta *");

  // Aguardar a resposta do usuario pelo tempo definido em SERIAL_TIMEOUT
  long startTime = millis();
  while (Serial.available() == 0 && millis() - startTime < SERIAL_TIMEOUT)
  {}

  // guarda o valor digitado pelo usuario em recebido
  if (Serial.available()) {
    recebido = Serial.readString();
    recebido.trim();
  } else {
    Serial.println("Timeout! Resposta não recebida.");
  }
}

void piscaled(int tempo, int vezes){
  for(int i = 0; i < vezes; i++){
    for(int j = 0; j < NUM_LEDS; j++){
      digitalWrite(LED_PINS[j], HIGH);
    }
    delay(tempo);
    for(int j = 0; j < NUM_LEDS; j++){
      digitalWrite(LED_PINS[j], LOW);
    }
    delay(tempo);
  }
}

void geraSequencia (int tempo, int sequencia){
  // Criar uma lista de inteiros com o tamanho que e passado como argumento
  int ordemLeds[sequencia];

  // Gerar sequencia aleatoria
  for (int i = 0; i < sequencia; i++){
    ordemLeds[i] = random(1, NUM_LEDS + 1);
  }

  // Inicialmente, a String sequenciaNumerica é uma String vazia
  sequenciaNumerica = "";

  // Pisca os LEDs na sequencia gerada
  for (int j = 0; j < sequencia; j++){
    int ledIndex = ordemLeds[j] - 1;
    digitalWrite(LED_PINS[ledIndex], HIGH);
    delay(tempo);
    digitalWrite(LED_PINS[ledIndex], LOW);
    delay(tempo);
    // Converte a lista numa String   
    sequenciaNumerica += String(ordemLeds[j]);
  }
}





