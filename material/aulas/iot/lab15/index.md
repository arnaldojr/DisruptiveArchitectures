# Lab 15 - Projeto Final: Fase 2 - Implementação

## Objetivos

Ao final deste laboratório, você será capaz de:

- Implementar hardware do projeto
- Desenvolver software embarcado
- Integrar componentes de software
- Testar sistema completo

---

## 1. Estrutura do Projeto

### 1.1 Organização de Arquivos

```
projeto_final/
├── src/
│   ├── main.cpp           # Loop principal
│   ├── sensors.cpp        # Leitura de sensores
│   ├── actuators.cpp      # Controle de atuadores
│   ├── wifi.cpp           # Conexão WiFi
│   ├── mqtt.cpp           # Comunicação MQTT
│   └── config.h           # Configurações
├── lib/                   # Bibliotecas
├── test/                  # Testes
├── platformio.ini         # Configuração
└── README.md              # Documentação
```

### 1.2 Exemplo: main.cpp

```cpp
#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include "config.h"
#include "sensors.h"
#include "mqtt.h"

void setup() {
    Serial.begin(115200);
    
    // Inicializa hardware
    initSensors();
    initActuators();
    
    // Conecta WiFi
    connectWiFi();
    
    // Conecta MQTT
    connectMQTT();
    
    Serial.println("Sistema iniciado!");
}

void loop() {
    // Mantém conexão MQTT
    if (!mqtt.connected()) {
        reconnectMQTT();
    }
    mqtt.loop();
    
    // Lê sensores
    SensorData data = readSensors();
    
    // Publica dados
    publishData(data);
    
    // Verifica comandos recebidos
    checkCommands();
    
    delay(1000);
}
```

---

## 2. Implementação por Etapas

### 2.1 Etapa 1: Hardware Básico

1. Monte o circuito básico
2. Teste cada sensor individualmente
3. Verifique lecturas no Serial

```cpp
// sensors.h
#ifndef SENSORS_H
#define SENSORS_H

#include <DHT.h>

struct SensorData {
    float temperature;
    float humidity;
    float pressure;
    uint16_t light;
    uint32_t timestamp;
};

void initSensors();
SensorData readSensors();

#endif
```

### 2.2 Etapa 2: Conectividade

1. Configure WiFi
2. Teste conexão
3. Configure MQTT
4. Teste publish/subscribe

```cpp
// mqtt.h
#ifndef MQTT_H
#define MQTT_H

#include <PubSubClient.h>

void connectMQTT();
void reconnectMQTT();
void publishData(SensorData data);
void checkCommands();
void mqttCallback(char* topic, byte* payload, unsigned int length);

#endif
```

### 2.3 Etapa 3: Dashboard

1. Crie fluxos Node-RED
2. Configure MQTT in/out
3. Adicione visualizações
4. Configure alertas

### 2.4 Etapa 4: Integração

1. Una todas as partes
2. Teste fluxo completo
3. Ajuste timings
4. Otimize consumo

---

## 3. Boas Práticas de Código

### 3.1 Modularização

```cpp
// RUIM: tudo em um arquivo
void loop() {
    float temp = readTemp();
    float hum = readHum();
    if (temp > 30) digitalWrite(LED, HIGH);
    mqtt.publish("temp", String(temp).c_str());
    // ... 500 linhas depois
}

// BOM: funções separadas
void loop() {
    SensorData data = readAllSensors();
    processData(data);
    sendToCloud(data);
}
```

### 3.2 Configuração Centralizada

```cpp
// config.h
#ifndef CONFIG_H
#define CONFIG_H

// WiFi
const char* WIFI_SSID = "MinhaRede";
const char* WIFI_PASSWORD = "Senha123";

// MQTT
const char* MQTT_BROKER = "192.168.1.100";
const char* MQTT_TOPIC_PREFIX = "projeto/";

// Hardware
const uint8_t DHT_PIN = 4;
const uint8_t LED_PIN = 2;

// Timings
const uint32_t PUBLISH_INTERVAL = 5000;
const uint32_t SENSOR_READ_INTERVAL = 1000;

#endif
```

### 3.3 Tratamento de Erros

```cpp
bool readSensorWithRetry(float* value) {
    int retries = 3;
    
    while (retries > 0) {
        *value = readSensor();
        
        if (!isnan(*value) && *value > -50 && *value < 150) {
            return true;
        }
        
        retries--;
        delay(100);
    }
    
    Serial.println("Erro: sensor não responde");
    return false;
}
```

---

## 4. Debugging e Testes

### 4.1 Debug Serial

```cpp
#ifdef DEBUG_MODE
    #define DEBUG(x) Serial.print(x)
    #define DEBUGLN(x) Serial.println(x)
#else
    #define DEBUG(x)
    #define DEBUGLN(x)
#endif

void loop() {
    DEBUG("Temperatura: ");
    DEBUGLN(temp);
}
```

### 4.2 Log de Eventos

```cpp
void logEvent(const char* event) {
    unsigned long timestamp = millis();
    Serial.printf("[%lu] %s\n", timestamp, event);
    
    // Também publicar em tópico de log
    mqtt.publish("projeto/log", String(event).c_str());
}
```

---

## 5. Entrega

### 5.1 O que Entregar

| Item | Descrição |
|------|-----------|
| Código | Repositório Git com código |
| Hardware | Fotos/vídeo do sistema |
| Dashboard | Screenshots ou acesso |
| Documentação | README.md completo |

### 5.2 README.md Template

```markdown
# Projeto: [Nome]

## Descrição
[Descrição do projeto]

## Hardware
- ESP32 DevKit v1
- [Lista de componentes]

## Software
- PlatformIO
- [Bibliotecas]

## Como Compilar
1. Clone o repositório
2. Configure WiFi em config.h
3. Compile e grave

## Como Usar
[Instruções]

## Autor
[Nome]
```

---

## 6. Cronograma

| Atividade | Tempo |
|-----------|-------|
| Montagem hardware | 25% |
| Software básico | 25% |
| Conectividade | 20% |
| Integração | 20% |
| Testes | 10% |
