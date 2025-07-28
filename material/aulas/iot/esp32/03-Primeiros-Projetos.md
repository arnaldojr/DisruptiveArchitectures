# Primeiros Projetos com ESP32

Nesta aula, vamos explorar projetos básicos para nos familiarizarmos com as funcionalidades do ESP32. Estes projetos ajudarão a entender os conceitos fundamentais antes de avançarmos para aplicações IoT mais complexas.

## Projeto 1: Controle de LEDs com ESP32

### Materiais
- ESP32 DevKit
- 3 LEDs (vermelho, verde e azul)
- 3 resistores de 220Ω
- Jumpers
- Protoboard

### Circuito
Conecte os LEDs aos pinos GPIO do ESP32:
- LED Vermelho: pino 25
- LED Verde: pino 26
- LED Azul: pino 27

Não esqueça de conectar os resistores em série com os LEDs para limitar a corrente.

### Código

```cpp
const int ledVermelho = 25;
const int ledVerde = 26;
const int ledAzul = 27;

void setup() {
  pinMode(ledVermelho, OUTPUT);
  pinMode(ledVerde, OUTPUT);
  pinMode(ledAzul, OUTPUT);
}

void loop() {
  // Padrão de sequência de LEDs
  digitalWrite(ledVermelho, HIGH);
  digitalWrite(ledVerde, LOW);
  digitalWrite(ledAzul, LOW);
  delay(1000);
  
  digitalWrite(ledVermelho, LOW);
  digitalWrite(ledVerde, HIGH);
  digitalWrite(ledAzul, LOW);
  delay(1000);
  
  digitalWrite(ledVermelho, LOW);
  digitalWrite(ledVerde, LOW);
  digitalWrite(ledAzul, HIGH);
  delay(1000);
  
  // Todos acesos
  digitalWrite(ledVermelho, HIGH);
  digitalWrite(ledVerde, HIGH);
  digitalWrite(ledAzul, HIGH);
  delay(1000);
  
  // Todos apagados
  digitalWrite(ledVermelho, LOW);
  digitalWrite(ledVerde, LOW);
  digitalWrite(ledAzul, LOW);
  delay(1000);
}
```

## Projeto 2: Leitura de Sensores Analógicos

### Materiais
- ESP32 DevKit
- Potenciômetro de 10kΩ
- LED
- Resistor de 220Ω
- Jumpers
- Protoboard

### Circuito
- Conecte o potenciômetro ao pino analógico GPIO34 (ADC1_CH6)
- Conecte o LED ao pino GPIO2 através do resistor

### Código

```cpp
const int potPin = 34;  // Pino do potenciômetro
const int ledPin = 2;   // Pino do LED

// Variáveis para PWM
const int freq = 5000;
const int ledChannel = 0;
const int resolution = 8;  // Resolução de 8 bits (0-255)

void setup() {
  Serial.begin(115200);
  
  // Configuração do PWM
  ledcSetup(ledChannel, freq, resolution);
  ledcAttachPin(ledPin, ledChannel);
}

void loop() {
  // Leitura do valor analógico (ESP32 tem ADC de 12 bits: 0-4095)
  int sensorValue = analogRead(potPin);
  
  // Converte o valor lido (0-4095) para o intervalo do PWM (0-255)
  int brightness = map(sensorValue, 0, 4095, 0, 255);
  
  // Aplica o PWM ao LED
  ledcWrite(ledChannel, brightness);
  
  // Imprime os valores no monitor serial
  Serial.print("Valor Analógico: ");
  Serial.print(sensorValue);
  Serial.print(" | Brilho: ");
  Serial.println(brightness);
  
  delay(100);
}
```

## Projeto 3: Botões e Interrupções

### Materiais
- ESP32 DevKit
- Botão push
- Resistor de 10kΩ (pull-up)
- LED
- Resistor de 220Ω
- Jumpers
- Protoboard

### Circuito
- Conecte o botão ao pino GPIO13
- Use resistor de 10kΩ como pull-up
- Conecte o LED ao pino GPIO2 através do resistor de 220Ω

### Código

```cpp
const int buttonPin = 13;  // Pino do botão
const int ledPin = 2;      // Pino do LED

// Variáveis para controle de debounce
volatile bool ledState = false;
volatile unsigned long lastDebounceTime = 0;
unsigned long debounceDelay = 200;  // Tempo de debounce em ms

// Função de interrupção chamada quando o botão é pressionado
void IRAM_ATTR buttonISR() {
  if ((millis() - lastDebounceTime) > debounceDelay) {
    ledState = !ledState;
    lastDebounceTime = millis();
  }
}

void setup() {
  Serial.begin(115200);
  
  pinMode(buttonPin, INPUT_PULLUP);  // Configurar pino do botão com pull-up interno
  pinMode(ledPin, OUTPUT);
  
  // Anexa a interrupção ao pino do botão - FALLING para detectar quando o botão é pressionado
  attachInterrupt(digitalPinToInterrupt(buttonPin), buttonISR, FALLING);
}

void loop() {
  // Atualiza estado do LED baseado no estado armazenado pela interrupção
  digitalWrite(ledPin, ledState);
  
  // Adicionando um pequeno delay para estabilidade
  delay(50);
}
```

## Projeto 4: Medindo Temperatura e Umidade com DHT11/DHT22

### Materiais
- ESP32 DevKit
- Sensor DHT11 ou DHT22
- Resistor de 10kΩ (pull-up)
- Jumpers
- Protoboard

### Circuito
- Conecte o pino de dados do DHT ao pino GPIO4
- Conecte VCC ao 3.3V do ESP32
- Conecte GND ao GND do ESP32
- Use o resistor de 10kΩ como pull-up entre dados e VCC

### Código
Primeiro, instale a biblioteca DHT do Adafruit:
1. Na IDE do Arduino, vá para **Sketch > Incluir Biblioteca > Gerenciar Bibliotecas**
2. Pesquise por "DHT" e instale a biblioteca "DHT sensor library by Adafruit"
3. Também instale a "Adafruit Unified Sensor" (dependência)

```cpp
#include "DHT.h"

#define DHTPIN 4       // Pino digital conectado ao DHT
#define DHTTYPE DHT11  // DHT11 ou DHT22, dependendo do seu sensor

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  Serial.println("Teste do sensor DHT!");

  dht.begin();
}

void loop() {
  // Aguarde alguns segundos entre as medições
  delay(2000);

  // A leitura da temperatura e umidade pode levar até 250ms
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  float f = dht.readTemperature(true); // True = Fahrenheit

  // Verifica se alguma leitura falhou
  if (isnan(h) || isnan(t) || isnan(f)) {
    Serial.println("Falha na leitura do sensor DHT!");
    return;
  }

  // Calcula o índice de calor
  float hif = dht.computeHeatIndex(f, h);
  float hic = dht.computeHeatIndex(t, h, false);

  Serial.print("Umidade: ");
  Serial.print(h);
  Serial.print("%\t");
  Serial.print("Temperatura: ");
  Serial.print(t);
  Serial.print("°C ");
  Serial.print(f);
  Serial.print("°F\t");
  Serial.print("Índice de Calor: ");
  Serial.print(hic);
  Serial.print("°C ");
  Serial.print(hif);
  Serial.println("°F");
}
```

## Próximos Passos

Esses projetos básicos fornecem uma introdução prática ao ESP32 e suas funcionalidades fundamentais. Na próxima aula, exploraremos a conectividade WiFi do ESP32, um dos recursos mais importantes para aplicações IoT.

Experimente modificar os códigos e combinar esses projetos para criar suas próprias aplicações!
