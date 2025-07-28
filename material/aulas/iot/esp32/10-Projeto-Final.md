# Projeto Final Integrado com ESP32

Nesta aula final, vamos consolidar todo o conhecimento adquirido ao longo do curso para desenvolver um projeto IoT completo e funcional. Este projeto integrará sensores, conectividade sem fio, comunicação com servidores, interface de usuário e gerenciamento de energia.

## Visão Geral: Sistema de Monitoramento Ambiental Inteligente

Nosso projeto final será um sistema de monitoramento ambiental completo que:

1. Coleta dados de múltiplos sensores ambientais
2. Processa e armazena localmente os dados
3. Transmite informações via WiFi usando MQTT
4. Permite visualização em tempo real através de dashboard 
5. Gera alertas para condições ambientais anormais
6. Opera com baixo consumo de energia para uso com bateria
7. Oferece configuração e monitoramento via Bluetooth

## Componentes Necessários

### Hardware
- ESP32 DevKit ou módulo similar
- Sensor BME280 (temperatura, umidade e pressão)
- Sensor de luminosidade BH1750
- Sensor de qualidade do ar (MQ-135 ou CCS811)
- Display OLED 128x64 (SSD1306)
- LEDs indicadores (2-3)
- Bateria LiPo 3.7V 2000mAh (opcional)
- Módulo de carregamento TP4056 (opcional)
- Painel solar pequeno 5V/1W (opcional)
- Botão para configuração e reset
- Resistores, capacitores e jumpers

### Software
- Arduino IDE com bibliotecas ESP32
- Bibliotecas para os sensores
- Biblioteca PubSubClient para MQTT
- ArduinoJSON para formatação de dados
- Node-RED para dashboard
- Broker MQTT (local ou na nuvem)

## Esquema do Projeto

### Diagrama de Conexão

```
                          +----------+
                          |  ESP32   |
                          +----------+
                               |
         +-------------------+-+------------------+
         |                   |                    |
  +------+------+    +-------+--------+    +-----+------+
  |  Sensores   |    | Comunicação    |    | Interface  |
  +-------------+    +----------------+    +------------+
  | - BME280    |    | - WiFi (MQTT)  |    | - OLED     |
  | - BH1750    |    | - Bluetooth    |    | - LEDs     |
  | - MQ-135    |    |                |    | - Botão    |
  +-------------+    +----------------+    +------------+
                               |
                     +---------+---------+
                     | Energia           |
                     +-------------------+
                     | - Bateria         |
                     | - Deep Sleep      |
                     | - Painel Solar    |
                     +-------------------+
```

### Pinagem do ESP32

| Componente     | Pino ESP32      | Observações                    |
|----------------|-----------------|--------------------------------|
| BME280 (SDA)   | GPIO21          | I²C                            |
| BME280 (SCL)   | GPIO22          | I²C                            |
| BH1750 (SDA)   | GPIO21          | Compartilha I²C com BME280     |
| BH1750 (SCL)   | GPIO22          | Compartilha I²C com BME280     |
| OLED (SDA)     | GPIO21          | Compartilha I²C                |
| OLED (SCL)     | GPIO22          | Compartilha I²C                |
| MQ-135         | GPIO34 (ADC1_6) | Saída analógica                |
| LED Status     | GPIO2           | LED padrão da placa            |
| LED Alerta     | GPIO4           | Vermelho para alertas          |
| Botão Config   | GPIO0           | Também usado para programação  |
| Sensor Bateria | GPIO35 (ADC1_7) | Divisor de tensão para leitura |

## Implementação do Código

Vamos dividir o código em módulos para facilitar a compreensão e manutenção:

### 1. Arquivo Principal

```cpp
/**
 * Projeto Final: Sistema de Monitoramento Ambiental Inteligente
 * Curso de IoT com ESP32
 */

#include <WiFi.h>
#include <BluetoothSerial.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <BH1750.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>
#include "config.h"           // Arquivo com configurações
#include "display.h"          // Funções para o display
#include "sensors.h"          // Funções para leitura de sensores
#include "mqtt_handler.h"     // Funções para comunicação MQTT
#include "power_manager.h"    // Funções de gerenciamento de energia

// Objetos globais
Adafruit_BME280 bme;
BH1750 lightMeter;
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
BluetoothSerial SerialBT;
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Variáveis globais
SensorData sensorData;
DeviceConfig config;
bool alertMode = false;
unsigned long lastPublishTime = 0;
unsigned long lastSensorReadTime = 0;
unsigned long lastDisplayUpdateTime = 0;
int failedMqttConnections = 0;

void setup() {
  // Inicializa comunicação serial
  Serial.begin(115200);
  delay(100);
  Serial.println("\n--- Sistema de Monitoramento Ambiental Iniciando ---");
  
  // Configura pinos
  pinMode(LED_STATUS_PIN, OUTPUT);
  pinMode(LED_ALERT_PIN, OUTPUT);
  pinMode(CONFIG_BUTTON_PIN, INPUT_PULLUP);
  
  // LED de status - inicialização
  digitalWrite(LED_STATUS_PIN, HIGH);
  
  // Inicializa I2C
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
  
  // Carrega configurações salvas
  loadConfig();
  
  // Inicializa o display OLED
  if(!initDisplay(display)) {
    Serial.println("Falha ao inicializar o display OLED");
  }
  
  // Exibe tela de inicialização
  showSplashScreen(display);
  
  // Inicializa os sensores
  if(!initSensors(bme, lightMeter)) {
    Serial.println("Falha na inicialização de sensores");
    showError(display, "Erro: Sensores");
    delay(2000);
  }
  
  // Tenta conectar ao WiFi
  connectToWiFi();
  
  // Inicializa MQTT
  setupMqtt(mqttClient, config.mqttServer, config.mqttPort);
  
  // Inicializa Bluetooth se o modo de configuração estiver ativo
  if (isConfigButtonPressed()) {
    enterConfigMode();
  }
  
  // Lê os sensores pela primeira vez
  readAllSensors(bme, lightMeter, sensorData);
  
  // Atualiza o display com leituras iniciais
  updateDisplay(display, sensorData, WiFi.status() == WL_CONNECTED);
  
  // Pisca LED para indicar inicialização completa
  blinkLed(LED_STATUS_PIN, 3, 100);
  digitalWrite(LED_STATUS_PIN, LOW);
  
  Serial.println("Sistema inicializado e pronto");
}

void loop() {
  // Verifica modo de configuração
  if (isConfigButtonPressed()) {
    enterConfigMode();
  }
  
  // Lê sensores periodicamente
  unsigned long currentMillis = millis();
  if (currentMillis - lastSensorReadTime >= SENSOR_READ_INTERVAL) {
    lastSensorReadTime = currentMillis;
    
    // Lê todos os sensores
    readAllSensors(bme, lightMeter, sensorData);
    
    // Verifica condições de alerta
    checkAlertConditions(sensorData);
    
    // Atualiza display se necessário
    if (currentMillis - lastDisplayUpdateTime >= DISPLAY_UPDATE_INTERVAL) {
      lastDisplayUpdateTime = currentMillis;
      updateDisplay(display, sensorData, mqttClient.connected());
    }
  }
  
  // Gerencia conexão MQTT e publicação de dados
  if (WiFi.status() == WL_CONNECTED) {
    // Mantém a conexão MQTT
    if (!mqttClient.connected()) {
      reconnectMqtt(mqttClient, config.mqttUser, config.mqttPassword);
    }
    mqttClient.loop();
    
    // Publica dados periodicamente
    if (currentMillis - lastPublishTime >= MQTT_PUBLISH_INTERVAL) {
      lastPublishTime = currentMillis;
      publishSensorData(mqttClient, sensorData, alertMode);
    }
  } else {
    // Reconecta ao WiFi se necessário
    if (currentMillis % WIFI_RECONNECT_INTERVAL == 0) {
      connectToWiFi();
    }
  }
  
  // Gerenciamento de energia
  if (config.enableDeepSleep && 
      currentMillis - lastSensorReadTime >= config.maxAwakeTime &&
      !alertMode) {
    prepareForSleep();
    goToDeepSleep(config.deepSleepDuration);
  }
  
  // Pequeno delay para estabilidade
  delay(10);
}

bool isConfigButtonPressed() {
  return digitalRead(CONFIG_BUTTON_PIN) == LOW;
}

void enterConfigMode() {
  Serial.println("Entrando no modo de configuração");
  
  // Pisca LED para indicar modo de configuração
  blinkLed(LED_STATUS_PIN, 5, 200);
  
  // Inicializa Bluetooth
  SerialBT.begin("ESP32-Env-Monitor");
  
  // Atualiza display
  showConfigScreen(display);
  
  // Loop de configuração via Bluetooth
  bool exitConfig = false;
  while (!exitConfig) {
    // Processa comandos Bluetooth
    processBluetoothConfig(SerialBT, config);
    
    // Mantém LED piscando para indicar modo de configuração
    digitalWrite(LED_STATUS_PIN, (millis() / 500) % 2);
    
    // Sai do modo de configuração se o botão for pressionado novamente
    if (digitalRead(CONFIG_BUTTON_PIN) == LOW) {
      delay(50);  // Debounce
      if (digitalRead(CONFIG_BUTTON_PIN) == LOW) {
        exitConfig = true;
      }
    }
    
    delay(100);
  }
  
  // Salva configurações e reinicia
  saveConfig();
  SerialBT.end();
  
  // Reinicia o ESP32
  ESP.restart();
}

void checkAlertConditions(SensorData &data) {
  bool previousAlertMode = alertMode;
  alertMode = false;
  
  // Verifica limites para temperatura
  if (data.temperature > config.tempHighLimit || data.temperature < config.tempLowLimit) {
    alertMode = true;
  }
  
  // Verifica limite para umidade
  if (data.humidity > config.humidityHighLimit || data.humidity < config.humidityLowLimit) {
    alertMode = true;
  }
  
  // Verifica limite para qualidade do ar
  if (data.airQuality > config.airQualityLimit) {
    alertMode = true;
  }
  
  // Gerencia LED de alerta
  digitalWrite(LED_ALERT_PIN, alertMode ? HIGH : LOW);
  
  // Se o estado de alerta mudou, envie notificação imediatamente
  if (alertMode != previousAlertMode && mqttClient.connected()) {
    publishAlertStatus(mqttClient, data, alertMode);
  }
}

void connectToWiFi() {
  Serial.print("Conectando ao WiFi");
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println("Conectando WiFi...");
  display.println(config.wifiSSID);
  display.display();
  
  WiFi.begin(config.wifiSSID, config.wifiPassword);
  
  int timeout = WIFI_CONNECTION_TIMEOUT / 500;
  while (WiFi.status() != WL_CONNECTED && timeout > 0) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_STATUS_PIN, !digitalRead(LED_STATUS_PIN));
    timeout--;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi conectado");
    Serial.print("Endereço IP: ");
    Serial.println(WiFi.localIP());
    
    display.println("\nConectado!");
    display.println(WiFi.localIP().toString());
    display.display();
    delay(1000);
  } else {
    Serial.println("\nFalha na conexão WiFi");
    display.println("\nFalha na conexao!");
    display.display();
    delay(2000);
  }
}

void blinkLed(int pin, int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(pin, HIGH);
    delay(delayMs);
    digitalWrite(pin, LOW);
    delay(delayMs);
  }
}
```

### 2. Arquivo de Configuração (config.h)

```cpp
#ifndef CONFIG_H
#define CONFIG_H

#include <EEPROM.h>

// Definições de pinos
#define I2C_SDA_PIN 21
#define I2C_SCL_PIN 22
#define LED_STATUS_PIN 2
#define LED_ALERT_PIN 4
#define CONFIG_BUTTON_PIN 0
#define MQ135_PIN 34
#define BATTERY_ADC_PIN 35

// Definições do Display OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

// Intervalos de tempo (ms)
#define SENSOR_READ_INTERVAL 5000
#define DISPLAY_UPDATE_INTERVAL 10000
#define MQTT_PUBLISH_INTERVAL 60000
#define WIFI_CONNECTION_TIMEOUT 20000
#define WIFI_RECONNECT_INTERVAL 300000

// Endereço EEPROM para salvar configuração
#define CONFIG_EEPROM_ADDR 0
#define EEPROM_SIZE 512

// Estrutura para armazenar dados dos sensores
struct SensorData {
  float temperature;
  float humidity;
  float pressure;
  float lightLevel;
  int airQuality;
  float batteryVoltage;
  unsigned long timestamp;
};

// Estrutura para armazenar configurações do dispositivo
struct DeviceConfig {
  char deviceName[32];
  char wifiSSID[32];
  char wifiPassword[64];
  char mqttServer[64];
  int mqttPort;
  char mqttUser[32];
  char mqttPassword[32];
  char mqttTopicPrefix[32];
  
  float tempHighLimit;
  float tempLowLimit;
  float humidityHighLimit;
  float humidityLowLimit;
  int airQualityLimit;
  
  bool enableDeepSleep;
  unsigned long deepSleepDuration;
  unsigned long maxAwakeTime;
  
  uint32_t configVersion;
};

// Valores padrão para configuração
void setDefaultConfig(DeviceConfig &config) {
  strncpy(config.deviceName, "ESP32-Env-Monitor", sizeof(config.deviceName));
  strncpy(config.wifiSSID, "SeuWiFi", sizeof(config.wifiSSID));
  strncpy(config.wifiPassword, "SuaSenha", sizeof(config.wifiPassword));
  strncpy(config.mqttServer, "broker.hivemq.com", sizeof(config.mqttServer));
  config.mqttPort = 1883;
  strncpy(config.mqttUser, "", sizeof(config.mqttUser));
  strncpy(config.mqttPassword, "", sizeof(config.mqttPassword));
  strncpy(config.mqttTopicPrefix, "esp32/ambiente", sizeof(config.mqttTopicPrefix));
  
  config.tempHighLimit = 35.0;
  config.tempLowLimit = 5.0;
  config.humidityHighLimit = 80.0;
  config.humidityLowLimit = 20.0;
  config.airQualityLimit = 800;
  
  config.enableDeepSleep = false;
  config.deepSleepDuration = 900; // 15 minutos em segundos
  config.maxAwakeTime = 300000;   // 5 minutos em ms
  
  config.configVersion = 1;
}

// Carrega configuração da EEPROM
void loadConfig() {
  // Inicializa EEPROM
  EEPROM.begin(EEPROM_SIZE);
  
  // Configuração para uso externo
  extern DeviceConfig config;
  
  // Tenta ler da EEPROM
  EEPROM.get(CONFIG_EEPROM_ADDR, config);
  
  // Verifica se é a primeira vez ou se os dados estão corrompidos
  if (config.configVersion != 1) {
    Serial.println("Configuração não encontrada, usando valores padrão");
    setDefaultConfig(config);
    saveConfig();
  } else {
    Serial.println("Configuração carregada da EEPROM");
  }
}

// Salva configuração na EEPROM
void saveConfig() {
  extern DeviceConfig config;
  EEPROM.put(CONFIG_EEPROM_ADDR, config);
  EEPROM.commit();
  Serial.println("Configuração salva na EEPROM");
}

// Processa comandos de configuração via Bluetooth
void processBluetoothConfig(BluetoothSerial &bt, DeviceConfig &config) {
  if (bt.available()) {
    String command = bt.readStringUntil('\n');
    command.trim();
    
    // Formato do comando: SET:parametro:valor
    if (command.startsWith("SET:")) {
      int firstSep = command.indexOf(':', 4);
      if (firstSep > 4) {
        String param = command.substring(4, firstSep);
        String value = command.substring(firstSep + 1);
        
        if (param == "WIFI_SSID") {
          value.toCharArray(config.wifiSSID, sizeof(config.wifiSSID));
          bt.println("WiFi SSID atualizado para: " + value);
        }
        else if (param == "WIFI_PASS") {
          value.toCharArray(config.wifiPassword, sizeof(config.wifiPassword));
          bt.println("Senha WiFi atualizada");
        }
        else if (param == "MQTT_SERVER") {
          value.toCharArray(config.mqttServer, sizeof(config.mqttServer));
          bt.println("Servidor MQTT atualizado para: " + value);
        }
        else if (param == "MQTT_PORT") {
          config.mqttPort = value.toInt();
          bt.println("Porta MQTT atualizada para: " + value);
        }
        else if (param == "TEMP_HIGH") {
          config.tempHighLimit = value.toFloat();
          bt.println("Limite superior de temperatura: " + value);
        }
        else if (param == "TEMP_LOW") {
          config.tempLowLimit = value.toFloat();
          bt.println("Limite inferior de temperatura: " + value);
        }
        else if (param == "HUMIDITY_HIGH") {
          config.humidityHighLimit = value.toFloat();
          bt.println("Limite superior de umidade: " + value);
        }
        else if (param == "HUMIDITY_LOW") {
          config.humidityLowLimit = value.toFloat();
          bt.println("Limite inferior de umidade: " + value);
        }
        else if (param == "AIR_QUALITY") {
          config.airQualityLimit = value.toInt();
          bt.println("Limite de qualidade do ar: " + value);
        }
        else if (param == "DEEP_SLEEP") {
          config.enableDeepSleep = (value == "true" || value == "1");
          bt.println("Deep sleep " + String(config.enableDeepSleep ? "ativado" : "desativado"));
        }
        else if (param == "SLEEP_DURATION") {
          config.deepSleepDuration = value.toInt();
          bt.println("Duração do deep sleep: " + value + " segundos");
        }
        else {
          bt.println("Parâmetro desconhecido: " + param);
        }
      }
    }
    else if (command == "GET:CONFIG") {
      // Envia toda a configuração atual
      bt.println("===== Configuração Atual =====");
      bt.println("WIFI_SSID:" + String(config.wifiSSID));
      bt.println("MQTT_SERVER:" + String(config.mqttServer));
      bt.println("MQTT_PORT:" + String(config.mqttPort));
      bt.println("MQTT_TOPIC:" + String(config.mqttTopicPrefix));
      bt.println("TEMP_HIGH:" + String(config.tempHighLimit));
      bt.println("TEMP_LOW:" + String(config.tempLowLimit));
      bt.println("HUMIDITY_HIGH:" + String(config.humidityHighLimit));
      bt.println("HUMIDITY_LOW:" + String(config.humidityLowLimit));
      bt.println("AIR_QUALITY:" + String(config.airQualityLimit));
      bt.println("DEEP_SLEEP:" + String(config.enableDeepSleep ? "true" : "false"));
      bt.println("SLEEP_DURATION:" + String(config.deepSleepDuration));
      bt.println("==============================");
    }
    else if (command == "SAVE") {
      saveConfig();
      bt.println("Configuração salva na memória");
    }
    else if (command == "RESET") {
      bt.println("Restaurando configurações padrão...");
      setDefaultConfig(config);
      saveConfig();
      bt.println("Configurações padrão restauradas");
    }
    else if (command == "EXIT") {
      bt.println("Saindo do modo de configuração...");
      return;
    }
    else if (command == "HELP") {
      bt.println("===== Comandos Disponíveis =====");
      bt.println("SET:WIFI_SSID:valor - Define SSID WiFi");
      bt.println("SET:WIFI_PASS:valor - Define senha WiFi");
      bt.println("SET:MQTT_SERVER:valor - Define servidor MQTT");
      bt.println("SET:MQTT_PORT:valor - Define porta MQTT");
      bt.println("SET:TEMP_HIGH:valor - Limite superior temp");
      bt.println("SET:TEMP_LOW:valor - Limite inferior temp");
      bt.println("SET:HUMIDITY_HIGH:valor - Limite superior umidade");
      bt.println("SET:HUMIDITY_LOW:valor - Limite inferior umidade");
      bt.println("SET:AIR_QUALITY:valor - Limite qualidade ar");
      bt.println("SET:DEEP_SLEEP:true/false - Ativa/desativa sleep");
      bt.println("SET:SLEEP_DURATION:valor - Tempo de sleep (s)");
      bt.println("GET:CONFIG - Mostra configuração atual");
      bt.println("SAVE - Salva configuração na memória");
      bt.println("RESET - Restaura configurações padrão");
      bt.println("EXIT - Sai do modo de configuração");
      bt.println("================================");
    }
    else {
      bt.println("Comando não reconhecido. Digite HELP para ajuda.");
    }
  }
}

#endif // CONFIG_H
```

### 3. Arquivo de Funções para Display (display.h)

```cpp
#ifndef DISPLAY_H
#define DISPLAY_H

#include <Adafruit_SSD1306.h>
#include "config.h"

// Inicializa o display OLED
bool initDisplay(Adafruit_SSD1306 &display) {
  // Inicializa o display SSD1306
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("Falha ao alocar SSD1306"));
    return false;
  }
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.display();
  return true;
}

// Exibe tela de inicialização
void showSplashScreen(Adafruit_SSD1306 &display) {
  display.clearDisplay();
  
  // Logo ou título
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(5, 5);
  display.println("ESP32");
  display.setTextSize(1);
  display.setCursor(5, 25);
  display.println("Sistema de");
  display.setCursor(5, 35);
  display.println("Monitoramento");
  display.setCursor(5, 45);
  display.println("Ambiental");
  
  display.display();
  delay(2000);
}

// Exibe tela de erro
void showError(Adafruit_SSD1306 &display, String errorMsg) {
  display.clearDisplay();
  
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println("ERRO!");
  display.println();
  display.println(errorMsg);
  
  display.display();
}

// Atualiza o display com os dados dos sensores
void updateDisplay(Adafruit_SSD1306 &display, SensorData &data, bool connected) {
  display.clearDisplay();
  
  // Linha superior - status
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(connected ? "Conectado" : "Offline");
  
  // Hora do dia ou tempo de operação
  unsigned long uptime = millis() / 1000;
  int hours = uptime / 3600;
  int minutes = (uptime % 3600) / 60;
  int seconds = uptime % 60;
  
  char timeStr[9];
  sprintf(timeStr, "%02d:%02d:%02d", hours, minutes, seconds);
  
  display.setCursor(128 - 6*8, 0); // Alinha à direita
  display.print(timeStr);
  
  // Linha de separação
  display.drawLine(0, 9, 128, 9, WHITE);
  
  // Dados dos sensores
  display.setCursor(0, 12);
  display.print("Temp: ");
  display.print(data.temperature, 1);
  display.print(" C");
  
  display.setCursor(0, 22);
  display.print("Umid: ");
  display.print(data.humidity, 1);
  display.print(" %");
  
  display.setCursor(0, 32);
  display.print("Pres: ");
  display.print(data.pressure, 0);
  display.print(" hPa");
  
  display.setCursor(0, 42);
  display.print("Luz: ");
  display.print(data.lightLevel, 0);
  display.print(" lx");
  
  display.setCursor(0, 52);
  display.print("Ar: ");
  display.print(data.airQuality);
  
  // Status da bateria, se disponível
  if (data.batteryVoltage > 0) {
    display.setCursor(80, 52);
    display.print("Bat:");
    display.print(data.batteryVoltage, 1);
    display.print("V");
  }
  
  display.display();
}

// Exibe tela de configuração
void showConfigScreen(Adafruit_SSD1306 &display) {
  display.clearDisplay();
  
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("MODO CONFIGURACAO");
  display.drawLine(0, 9, 128, 9, WHITE);
  
  display.setCursor(0, 15);
  display.println("Conecte via Bluetooth");
  display.setCursor(0, 25);
  display.println("Nome: ESP32-Env-Monitor");
  
  display.setCursor(0, 45);
  display.println("Pressione o botao");
  display.setCursor(0, 55);
  display.println("novamente para sair");
  
  display.display();
}

#endif // DISPLAY_H
```

### 4. Arquivo de Funções para Sensores (sensors.h)

```cpp
#ifndef SENSORS_H
#define SENSORS_H

#include <Adafruit_BME280.h>
#include <BH1750.h>
#include "config.h"

// Inicializa todos os sensores
bool initSensors(Adafruit_BME280 &bme, BH1750 &lightMeter) {
  bool status = true;
  
  // Inicializa BME280
  if (!bme.begin(0x76)) {
    Serial.println("Não foi possível encontrar o sensor BME280!");
    status = false;
  }
  
  // Inicializa BH1750
  if (!lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("Não foi possível encontrar o sensor BH1750!");
    status = false;
  }
  
  return status;
}

// Lê o sensor MQ135 (qualidade do ar)
int readMQ135() {
  // Faz múltiplas leituras para estabilidade
  int sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(MQ135_PIN);
    delay(10);
  }
  return sum / 10;
}

// Lê a tensão da bateria
float readBatteryVoltage() {
  // Faz múltiplas leituras para estabilidade
  int sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(BATTERY_ADC_PIN);
    delay(10);
  }
  int rawValue = sum / 10;
  
  // Converte para tensão - ajuste estes valores conforme seu circuito
  float voltage = rawValue * (3.3 / 4095.0);
  
  // Se houver um divisor de tensão (ex: duas resistências iguais)
  // voltage = voltage * 2.0;
  
  return voltage;
}

// Lê todos os sensores e atualiza a estrutura de dados
void readAllSensors(Adafruit_BME280 &bme, BH1750 &lightMeter, SensorData &data) {
  // Lê temperatura, umidade e pressão do BME280
  data.temperature = bme.readTemperature();
  data.humidity = bme.readHumidity();
  data.pressure = bme.readPressure() / 100.0F; // hPa
  
  // Lê luminosidade do BH1750
  data.lightLevel = lightMeter.readLightLevel();
  
  // Lê qualidade do ar do MQ135
  data.airQuality = readMQ135();
  
  // Lê a tensão da bateria
  data.batteryVoltage = readBatteryVoltage();
  
  // Adiciona timestamp
  data.timestamp = millis();
  
  // Exibe no Serial para debug
  Serial.println("--- Leitura de Sensores ---");
  Serial.print("Temperatura: "); Serial.print(data.temperature); Serial.println(" °C");
  Serial.print("Umidade: "); Serial.print(data.humidity); Serial.println(" %");
  Serial.print("Pressão: "); Serial.print(data.pressure); Serial.println(" hPa");
  Serial.print("Luminosidade: "); Serial.print(data.lightLevel); Serial.println(" lx");
  Serial.print("Qualidade do ar: "); Serial.println(data.airQuality);
  Serial.print("Bateria: "); Serial.print(data.batteryVoltage); Serial.println(" V");
  Serial.println("--------------------------");
}

#endif // SENSORS_H
```

### 5. Arquivo de Funções para MQTT (mqtt_handler.h)

```cpp
#ifndef MQTT_HANDLER_H
#define MQTT_HANDLER_H

#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "config.h"

// Configura o cliente MQTT
void setupMqtt(PubSubClient &client, const char* server, int port) {
  client.setServer(server, port);
}

// Reconecta ao servidor MQTT
bool reconnectMqtt(PubSubClient &client, const char* username, const char* password) {
  extern DeviceConfig config;
  
  Serial.print("Tentando conectar ao MQTT...");
  
  // Cria um ID de cliente aleatório
  String clientId = "ESP32Client-";
  clientId += String(random(0xffff), HEX);
  
  // Tenta conectar
  if (client.connect(clientId.c_str(), username, password)) {
    Serial.println("conectado");
    
    // Tópico para receber comandos
    String commandTopic = String(config.mqttTopicPrefix) + "/command";
    client.subscribe(commandTopic.c_str());
    
    // Publica mensagem informando que está online
    String statusTopic = String(config.mqttTopicPrefix) + "/status";
    client.publish(statusTopic.c_str(), "online", true);
    
    return true;
  } else {
    Serial.print("falhou, rc=");
    Serial.print(client.state());
    return false;
  }
}

// Publica dados dos sensores via MQTT
void publishSensorData(PubSubClient &client, SensorData &data, bool alert) {
  extern DeviceConfig config;
  
  if (!client.connected()) return;
  
  // Cria o JSON com os dados
  StaticJsonDocument<512> doc;
  
  doc["device_id"] = config.deviceName;
  doc["temperature"] = data.temperature;
  doc["humidity"] = data.humidity;
  doc["pressure"] = data.pressure;
  doc["light"] = data.lightLevel;
  doc["air_quality"] = data.airQuality;
  doc["battery"] = data.batteryVoltage;
  doc["alert"] = alert;
  doc["timestamp"] = data.timestamp;
  
  // Serializa para JSON
  char buffer[512];
  serializeJson(doc, buffer);
  
  // Tópico para dados
  String dataTopic = String(config.mqttTopicPrefix) + "/data";
  
  // Publica
  bool success = client.publish(dataTopic.c_str(), buffer);
  Serial.print("Publicação MQTT: ");
  Serial.println(success ? "OK" : "FALHA");
}

// Publica status de alerta via MQTT
void publishAlertStatus(PubSubClient &client, SensorData &data, bool isAlert) {
  extern DeviceConfig config;
  
  if (!client.connected()) return;
  
  // Cria o JSON com os dados
  StaticJsonDocument<256> doc;
  
  doc["device_id"] = config.deviceName;
  doc["alert"] = isAlert;
  doc["temperature"] = data.temperature;
  doc["humidity"] = data.humidity;
  doc["air_quality"] = data.airQuality;
  doc["timestamp"] = data.timestamp;
  
  // Razão do alerta
  if (isAlert) {
    String reason = "";
    if (data.temperature > config.tempHighLimit)
      reason += "Temperatura alta, ";
    if (data.temperature < config.tempLowLimit)
      reason += "Temperatura baixa, ";
    if (data.humidity > config.humidityHighLimit)
      reason += "Umidade alta, ";
    if (data.humidity < config.humidityLowLimit)
      reason += "Umidade baixa, ";
    if (data.airQuality > config.airQualityLimit)
      reason += "Qualidade do ar ruim, ";
    
    // Remove a última vírgula e espaço
    if (reason.length() > 0)
      reason.remove(reason.length() - 2);
    
    doc["reason"] = reason;
  }
  
  // Serializa para JSON
  char buffer[256];
  serializeJson(doc, buffer);
  
  // Tópico para alertas
  String alertTopic = String(config.mqttTopicPrefix) + "/alert";
  
  // Publica
  client.publish(alertTopic.c_str(), buffer);
}

#endif // MQTT_HANDLER_H
```

### 6. Arquivo de Funções para Gerenciamento de Energia (power_manager.h)

```cpp
#ifndef POWER_MANAGER_H
#define POWER_MANAGER_H

#include "config.h"

// Prepara o dispositivo para entrar em deep sleep
void prepareForSleep() {
  extern PubSubClient mqttClient;
  extern DeviceConfig config;
  
  Serial.println("Preparando para entrar em deep sleep...");
  
  // Notifica que vai entrar em sleep, se conectado ao MQTT
  if (mqttClient.connected()) {
    String statusTopic = String(config.mqttTopicPrefix) + "/status";
    mqttClient.publish(statusTopic.c_str(), "sleeping", true);
    mqttClient.disconnect();
  }
  
  // Desliga WiFi
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  
  // Desliga outros componentes que consomem energia
  // ...
  
  Serial.flush();
}

// Entra em deep sleep por um tempo determinado
void goToDeepSleep(unsigned long sleepTimeSeconds) {
  Serial.println("Entrando em deep sleep por " + String(sleepTimeSeconds) + " segundos");
  
  // Configura o timer para acordar
  esp_sleep_enable_timer_wakeup(sleepTimeSeconds * 1000000ULL);
  
  // Opcional: habilitar wake-up por pino externo (ex: sensor de movimento)
  // esp_sleep_enable_ext0_wakeup(GPIO_NUM_33, 1);
  
  // Entra em deep sleep
  esp_deep_sleep_start();
}

#endif // POWER_MANAGER_H
```

## Configuração do Node-RED

Para completar este projeto, crie um dashboard no Node-RED que inclua:

1. **Gráficos para Dados Ambientais**:
   - Temperatura e umidade em um gráfico de linha
   - Pressão atmosférica
   - Nível de luminosidade
   - Qualidade do ar

2. **Indicadores de Status**:
   - LED virtual para mostrar se o dispositivo está online/offline
   - Indicador de nível de bateria
   - Tempo desde a última atualização

3. **Alertas**:
   - Área para exibir alertas ativos
   - Histórico de alertas
   - Configuração de notificações

4. **Controles**:
   - Opções para ajustar limites de alerta
   - Botão para forçar leitura imediata
   - Opções de configuração remota

## Expansões e Personalizações Possíveis

Este projeto pode ser expandido e personalizado de várias maneiras:

1. **Adicionar Mais Sensores**:
   - Sensor de CO2 (MH-Z19)
   - Sensor de Material Particulado (PMS5003)
   - Sensor de Movimento (PIR HC-SR501)
   - Sensor de Ruído

2. **Expandir Conectividade**:
   - Integração com plataformas na nuvem (AWS IoT, Google Cloud IoT)
   - Backup de dados para cartão SD
   - Conexão com outros serviços web (IFTTT, Webhooks)

3. **Melhorar a Interface Física**:
   - Adicionar um display LCD maior
   - Adicionar botões para navegação
   - Caixa à prova d'água para uso externo

4. **Otimizar Energia**:
   - Sistema de energia solar completo
   - Adaptação dinâmica do ciclo de sono baseada na carga da bateria
   - Usar ULP (Ultra Low Power coprocessor) para verificações contínuas

## Conclusão

Este projeto final integra todos os conceitos aprendidos ao longo do curso:
- Programação do ESP32
- Uso de sensores analógicos e digitais
- Conectividade WiFi e Bluetooth
- Comunicação MQTT
- Visualização de dados com Node-RED
- Gerenciamento de energia
- Configuração e diagnóstico remotos

A estrutura modular permite que você adapte o sistema às suas necessidades específicas, adicionando mais sensores, alterando a lógica de alerta ou implementando novas formas de visualização dos dados.

Essa estação de monitoramento ambiental é apenas o começo - com os conhecimentos adquiridos neste curso, você está preparado para desenvolver uma infinidade de projetos IoT usando o ESP32 como plataforma principal.

Bom desenvolvimento!
