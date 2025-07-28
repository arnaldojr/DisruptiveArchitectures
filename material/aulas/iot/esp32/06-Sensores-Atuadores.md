# Sensores e Atuadores com ESP32

Nesta aula, exploraremos como conectar e utilizar diversos sensores e atuadores com o ESP32. O ESP32 possui muitos pinos GPIO, ADC, DAC, capacitivos e interfaces como I2C, SPI e UART que permitem a conexão com uma ampla variedade de dispositivos.

## Pinagem do ESP32

Antes de começarmos, é importante entender a pinagem do ESP32. Dependendo da placa que você está utilizando, os pinos físicos podem variar, mas as funcionalidades são semelhantes.

![Pinagem ESP32 DevKit](https://raw.githubusercontent.com/espressif/arduino-esp32/master/docs/esp32_pinmap.png)

Observações importantes:
- Nem todos os pinos podem ser usados como entrada/saída de propósito geral
- Os pinos GPIO6-GPIO11 são usados para o flash SPI interno (não disponíveis)
- Os pinos GPIO0, GPIO2 e GPIO15 têm funções especiais durante o boot
- GPIO34-GPIO39 são apenas entradas (não possuem resistores pull-up/pull-down internos)

## 1. Sensores Analógicos

O ESP32 possui dois conversores analógico-digital (ADC) que permitem ler valores analógicos:
- ADC1: Conectado aos pinos GPIO32-GPIO39
- ADC2: Conectado aos pinos GPIO0, GPIO2, GPIO4, GPIO12-GPIO15, GPIO25-GPIO27 (não disponível quando WiFi está ativo)

### Leitura de Sensor Analógico (LDR)

```cpp
// Sensor de luz (LDR) conectado ao pino GPIO34
const int ldrPin = 34;

void setup() {
  Serial.begin(115200);
  delay(1000); // Aguarda estabilização do serial
  
  // Configura resolução do ADC (padrão é 12 bits, mas você pode escolher 9-12)
  analogReadResolution(12); // 0-4095
}

void loop() {
  // Lê o valor do LDR
  int ldrValue = analogRead(ldrPin);
  
  // Converte o valor para porcentagem (0-100%)
  int lightPercent = map(ldrValue, 0, 4095, 0, 100);
  
  // Imprime os valores
  Serial.print("Valor ADC: ");
  Serial.print(ldrValue);
  Serial.print(" | Luz (%): ");
  Serial.println(lightPercent);
  
  delay(1000);
}
```

### Calibração de Sensores Analógicos

A calibração é importante para obter medições precisas:

```cpp
// Constantes para calibração
const int numReadings = 10;
const int minRawValue = 500;   // Valor raw mínimo esperado
const int maxRawValue = 3800;  // Valor raw máximo esperado

// Função para calibrar sensor analógico
float calibrateAnalogSensor(int pin) {
  int sum = 0;
  
  // Faz várias leituras e calcula a média
  for (int i = 0; i < numReadings; i++) {
    sum += analogRead(pin);
    delay(10);
  }
  int rawValue = sum / numReadings;
  
  // Limita o valor dentro da faixa esperada
  rawValue = constrain(rawValue, minRawValue, maxRawValue);
  
  // Mapeia para porcentagem (0-100)
  float result = map(rawValue, minRawValue, maxRawValue, 0, 100);
  
  return result;
}
```

## 2. Saídas Analógicas (DAC) e PWM

O ESP32 possui dois conversores digital-analógico (DAC) nos pinos 25 e 26. Além disso, qualquer pino GPIO pode ser usado para PWM.

### Exemplo de DAC

```cpp
// Usando o DAC do ESP32
const int dacPin = 25;

void setup() {
  Serial.begin(115200);
}

void loop() {
  // Loop de 0 a 255 (8 bits)
  for (int value = 0; value <= 255; value++) {
    // Escreve o valor no DAC
    dacWrite(dacPin, value);
    
    Serial.print("Valor DAC: ");
    Serial.println(value);
    
    delay(50);
  }
  
  // Loop decrescente de 255 a 0
  for (int value = 255; value >= 0; value--) {
    dacWrite(dacPin, value);
    
    Serial.print("Valor DAC: ");
    Serial.println(value);
    
    delay(50);
  }
}
```

### Exemplo de PWM (LED com Brilho Variável)

```cpp
// Controlando um LED com PWM
const int ledPin = 16;

// Configurações de PWM
const int freq = 5000;
const int ledChannel = 0;
const int resolution = 8; // 8 bits = 0-255

void setup() {
  // Configuração do PWM
  ledcSetup(ledChannel, freq, resolution);
  
  // Anexa o canal ao pino
  ledcAttachPin(ledPin, ledChannel);
}

void loop() {
  // Aumenta o brilho gradualmente
  for (int dutyCycle = 0; dutyCycle <= 255; dutyCycle++) {
    ledcWrite(ledChannel, dutyCycle);
    delay(15);
  }

  // Diminui o brilho gradualmente
  for (int dutyCycle = 255; dutyCycle >= 0; dutyCycle--) {
    ledcWrite(ledChannel, dutyCycle);
    delay(15);
  }
}
```

## 3. Sensores Digitais

### DHT11/DHT22 (Temperatura e Umidade)

```cpp
#include "DHT.h"

#define DHTPIN 4      // Pino conectado ao sensor
#define DHTTYPE DHT22 // DHT 22 (AM2302)

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  Serial.println("Teste de sensor DHT!");

  dht.begin();
}

void loop() {
  // Aguarda entre leituras
  delay(2000);

  // Lê a umidade
  float h = dht.readHumidity();
  // Lê a temperatura em Celsius
  float t = dht.readTemperature();
  // Lê a temperatura em Fahrenheit
  float f = dht.readTemperature(true);

  // Verifica se há falha de leitura
  if (isnan(h) || isnan(t) || isnan(f)) {
    Serial.println("Falha ao ler do sensor DHT!");
    return;
  }

  // Calcula o índice de calor
  float hic = dht.computeHeatIndex(t, h, false);

  Serial.print("Umidade: ");
  Serial.print(h);
  Serial.print("%  Temperatura: ");
  Serial.print(t);
  Serial.print("°C ");
  Serial.print(f);
  Serial.print("°F  Índice de Calor: ");
  Serial.print(hic);
  Serial.println("°C");
}
```

### Sensor de Distância Ultrassônico HC-SR04

```cpp
const int trigPin = 5;
const int echoPin = 18;

// Define constantes do som
#define SOUND_SPEED 0.034 // em cm/us
#define CM_TO_INCH 0.393701

long duration;
float distanceCm;
float distanceInch;

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  // Limpa o trigPin
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  
  // Aciona o trigPin por 10 microsegundos
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Lê o echoPin e obtém o tempo de viagem da onda
  duration = pulseIn(echoPin, HIGH);
  
  // Calcula a distância
  distanceCm = duration * SOUND_SPEED/2;
  distanceInch = distanceCm * CM_TO_INCH;
  
  // Imprime no Serial Monitor
  Serial.print("Distância (cm): ");
  Serial.println(distanceCm);
  Serial.print("Distância (inch): ");
  Serial.println(distanceInch);
  
  delay(1000);
}
```

## 4. Sensores I²C

O ESP32 suporta a interface I²C, que permite conectar múltiplos dispositivos usando apenas dois pinos.

### BME280 (Temperatura, Umidade e Pressão)

```cpp
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

// Pinos I²C do ESP32
#define SDA_PIN 21
#define SCL_PIN 22

// Endereço I²C do BME280 (0x76 ou 0x77)
#define BME_ADDR 0x76

Adafruit_BME280 bme;

void setup() {
  Serial.begin(115200);
  
  // Inicializa o I²C com os pinos definidos
  Wire.begin(SDA_PIN, SCL_PIN);
  
  // Inicializa o BME280
  bool status = bme.begin(BME_ADDR);
  if (!status) {
    Serial.println("Não foi possível encontrar o sensor BME280!");
    while (1);
  }
  
  Serial.println("Sensor BME280 encontrado!");
}

void loop() {
  // Lê os valores
  float temperature = bme.readTemperature();
  float humidity = bme.readHumidity();
  float pressure = bme.readPressure() / 100.0F; // em hPa
  float altitude = bme.readAltitude(1013.25); // altitude estimada
  
  // Imprime no Serial Monitor
  Serial.print("Temperatura: ");
  Serial.print(temperature);
  Serial.println(" °C");
  
  Serial.print("Umidade: ");
  Serial.print(humidity);
  Serial.println(" %");
  
  Serial.print("Pressão: ");
  Serial.print(pressure);
  Serial.println(" hPa");
  
  Serial.print("Altitude aprox: ");
  Serial.print(altitude);
  Serial.println(" m");
  
  delay(2000);
}
```

## 5. Sensores SPI

A interface SPI (Serial Peripheral Interface) permite comunicação rápida com diversos dispositivos como displays, cartões SD, e sensores.

### Leitor de Cartão SD

```cpp
#include <SPI.h>
#include <SD.h>

// Pino do CS para o módulo SD
#define SD_CS 5

// Nome do arquivo no SD
#define FILENAME "/data.txt"

// Variáveis para simular sensores
float temperatura, umidade;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("Inicializando cartão SD...");
  
  // Inicializa o cartão SD
  if (!SD.begin(SD_CS)) {
    Serial.println("Falha na inicialização do cartão SD!");
    return;
  }
  
  Serial.println("Cartão SD inicializado com sucesso.");
  
  // Cria um cabeçalho no arquivo se ele não existir
  if (!SD.exists(FILENAME)) {
    File dataFile = SD.open(FILENAME, FILE_WRITE);
    if (dataFile) {
      dataFile.println("Time,Temperature,Humidity");
      dataFile.close();
      Serial.println("Arquivo criado com sucesso!");
    } else {
      Serial.println("Erro ao criar arquivo!");
    }
  }
}

void loop() {
  // Simula leituras de sensores
  temperatura = random(2000, 3000) / 100.0;
  umidade = random(4000, 9000) / 100.0;
  
  // Obtém o tempo atual desde o início do programa
  unsigned long currentTime = millis() / 1000; // segundos
  
  // Cria uma string com os dados
  String dataString = String(currentTime) + "," + 
                      String(temperatura) + "," + 
                      String(umidade);
  
  // Abre o arquivo para escrita
  File dataFile = SD.open(FILENAME, FILE_APPEND);
  
  if (dataFile) {
    dataFile.println(dataString);
    dataFile.close();
    Serial.println("Dados gravados: " + dataString);
  } else {
    Serial.println("Erro ao abrir o arquivo!");
  }
  
  delay(5000); // Espera 5 segundos
}
```

## 6. Display OLED I²C

Displays são importantes para visualizar dados sem conexão com um computador.

```cpp
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
#define SCREEN_ADDRESS 0x3C

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

void setup() {
  Serial.begin(115200);

  // Inicializa o display OLED
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("Falha ao alocar SSD1306"));
    for(;;); // Loop infinito
  }

  // Limpa o buffer
  display.clearDisplay();
  
  // Configura o tamanho, cor e posição do texto
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  
  // Adiciona texto ao buffer
  display.println(F("Teste do Display OLED"));
  display.println(F("com ESP32"));
  display.println();
  display.print(F("Temperatura: "));
  display.println(F("25.5 C"));
  display.print(F("Umidade: "));
  display.println(F("60%"));
  
  // Exibe o buffer na tela
  display.display();
}

void loop() {
  // No loop principal, podemos atualizar partes específicas da tela
  // Simulação de um contador
  static int counter = 0;
  
  // Limpa apenas a área onde o contador será exibido
  display.fillRect(0, 48, 128, 16, BLACK);
  display.setCursor(0, 48);
  display.print(F("Contador: "));
  display.println(counter);
  display.display();
  
  counter++;
  delay(1000);
}
```

## 7. Sensores Touch Capacitivos

O ESP32 possui 10 sensores touch capacitivos integrados, o que permite criar interfaces sensíveis ao toque sem componentes adicionais.

```cpp
// Definindo os pinos touch
const int touchPin = 4; // GPIO4 (T0)

// Variável para armazenar o valor da leitura touch
int touchValue;

// Threshold para detecção de toque
const int threshold = 40;

// LED que será controlado pelo touch
const int ledPin = 2;

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  
  delay(1000);
  Serial.println("ESP32 Touch Test");
}

void loop() {
  // Lê o valor do sensor touch
  touchValue = touchRead(touchPin);
  
  Serial.print("Valor Touch: ");
  Serial.println(touchValue);
  
  // Verifica se o valor está abaixo do threshold (quanto menor o valor, mais forte o toque)
  if (touchValue < threshold) {
    digitalWrite(ledPin, HIGH);
    Serial.println("Touch detectado!");
  } else {
    digitalWrite(ledPin, LOW);
  }
  
  delay(500);
}
```

## Projeto Prático: Estação Meteorológica

Combinaremos um sensor BME280 (temperatura, umidade e pressão), um display OLED e um cartão SD para criar uma estação meteorológica que exibe e registra dados ambientais.

```cpp
#include <Wire.h>
#include <SPI.h>
#include <SD.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_BME280.h>

// Configurações do display OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
#define SCREEN_ADDRESS 0x3C

// Pino CS do cartão SD
#define SD_CS 5

// Arquivo de log no SD
#define FILENAME "/clima.csv"

// Intervalo de log em milissegundos
#define LOG_INTERVAL 60000

// Objetos para sensores e display
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Adafruit_BME280 bme;

// Variáveis para armazenar hora da última leitura
unsigned long lastLogTime = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Inicializa o I²C
  Wire.begin();
  
  // Inicializa o display OLED
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("Falha ao inicializar o display OLED"));
    while(1);
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println(F("Estacao Meteorologica"));
  display.println(F("Inicializando..."));
  display.display();
  
  // Inicializa o sensor BME280
  if (!bme.begin(0x76)) {
    Serial.println(F("Erro ao encontrar o sensor BME280!"));
    display.println(F("Erro sensor BME280!"));
    display.display();
    while (1);
  }
  
  // Inicializa o cartão SD
  display.println(F("Inicializando SD..."));
  display.display();
  
  if (!SD.begin(SD_CS)) {
    Serial.println(F("Falha na inicialização do cartão SD!"));
    display.println(F("Erro SD! Logs desabilitados"));
    display.display();
    delay(2000);
  } else {
    // Cria o arquivo de log se não existir
    if (!SD.exists(FILENAME)) {
      File dataFile = SD.open(FILENAME, FILE_WRITE);
      if (dataFile) {
        dataFile.println("Timestamp,Temperatura,Umidade,Pressao,Altitude");
        dataFile.close();
      }
    }
    display.println(F("SD OK!"));
    display.display();
  }
  
  delay(2000);
}

void loop() {
  // Lê os dados do sensor
  float temperatura = bme.readTemperature();
  float umidade = bme.readHumidity();
  float pressao = bme.readPressure() / 100.0F;
  float altitude = bme.readAltitude(1013.25);
  
  // Atualiza o display
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println(F("Estacao Meteorologica"));
  display.println();
  
  display.print(F("Temp: "));
  display.print(temperatura);
  display.println(F(" C"));
  
  display.print(F("Umid: "));
  display.print(umidade);
  display.println(F(" %"));
  
  display.print(F("Pres: "));
  display.print(pressao);
  display.println(F(" hPa"));
  
  display.print(F("Alt: "));
  display.print(altitude);
  display.println(F(" m"));
  
  // Mostra o tempo desde a última gravação no SD
  unsigned long timeNow = millis();
  if (SD.begin(SD_CS)) {
    display.print(F("Prox. log: "));
    if (timeNow - lastLogTime < LOG_INTERVAL) {
      display.print((LOG_INTERVAL - (timeNow - lastLogTime)) / 1000);
      display.println(F(" s"));
    } else {
      display.println(F("Agora!"));
    }
  } else {
    display.println(F("SD desconectado!"));
  }
  
  display.display();
  
  // Verifica se é hora de gravar no SD
  if (timeNow - lastLogTime >= LOG_INTERVAL) {
    if (SD.begin(SD_CS)) {
      // Cria a string de dados
      String dataString = String(timeNow / 1000) + "," + 
                         String(temperatura) + "," + 
                         String(umidade) + "," + 
                         String(pressao) + "," + 
                         String(altitude);
      
      // Abre o arquivo para escrita
      File dataFile = SD.open(FILENAME, FILE_APPEND);
      if (dataFile) {
        dataFile.println(dataString);
        dataFile.close();
        Serial.println("Dados gravados no SD: " + dataString);
      }
    }
    
    // Atualiza o tempo da última gravação
    lastLogTime = timeNow;
  }
  
  delay(1000);
}
```

## Próximos Passos

Na próxima aula, exploraremos o protocolo MQTT, fundamental para a comunicação IoT, permitindo que o ESP32 publique dados e receba comandos através da internet.

**Desafio:** Adapte o projeto da estação meteorológica para incluir um sensor adicional (como um sensor de luz ou de qualidade do ar) e customize a interface do display para mostrar os novos dados.
