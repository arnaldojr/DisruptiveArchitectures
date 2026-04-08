# Lab 6 - MQTT Profissional

## Objetivos

Ao final deste laboratório, você será capaz to:

- Compreender o protocolo MQTT e seus conceitos
- Implementar comunicação publish/subscribe
- Configurar QoS (Quality of Service)
- Utilizar Last Will and Testament (LWT)
- Implementar retain messages
- Criar um sistema de IoT completo com MQTT

---

## 1. Introdução ao MQTT

### 1.1 O que é MQTT?

MQTT (Message Queuing Telemetry Transport) é um protocolo leve de mensagens para dispositivos com recursos limitados. É o padrão mais utilizado em IoT.

### 1.2 Arquitetura Pub/Sub

```
┌─────────────────────────────────────────────────────────────┐
│                   ARQUITETURA MQTT                           │
│                                                             │
│                    ┌─────────┐                              │
│                    │ Broker  │                              │
│                    │  MQTT   │                              │
│                    └────┬────┘                              │
│           ┌──────────────┼──────────────┐                  │
│           │              │              │                  │
│           ▼              ▼              ▼                  │
│     ┌─────────┐    ┌─────────┐    ┌─────────┐            │
│     │ Sensor  │    │ Display │    │  Cloud  │            │
│     │ (Pub)   │    │ (Sub)   │    │ (Sub)   │            │
│     └─────────┘    └─────────┘    └─────────┘            │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  TÓPICO: home/livingroom/temperature              │   │
│   │  MENSAGEM: {"temp": 25.5, "unit": "C"}          │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Componentes

| Componente | Descrição |
|-----------|-----------|
| **Publisher** | Envia mensagens (ex: sensor) |
| **Subscriber** | Recebe mensagens (ex: app) |
| **Broker** | Servidor que distribui mensagens |
| **Topic** | Canal de comunicação |

---

## 2. Instalação do Broker MQTT

### 2.1 Mosquitto (Local)

Para desenvolvimento local, instale o Mosquitto:

**Linux/macOS:**
```bash
sudo apt install mosquitto mosquitto-clients  # Linux
brew install mosquitto  # macOS
```

**Windows:**
Baixe em https://mosquitto.org/download/

### 2.2 Iniciar Broker Local

```bash
# Iniciar broker na porta padrão
mosquitto -v

# Ou em background
mosquitto -p 1883
```

### 2.3 Testar com CLI

```bash
# Terminal 1: Inscreve no tópico
mosquitto_sub -t "teste/msg"

# Terminal 2: Publica mensagem
mosquitto_pub -t "teste/msg" -m "Olá MQTT!"
```

---

## 3. MQTT no ESP32

### 3.1 Biblioteca PubSubClient

Adicione ao `platformio.ini`:

```ini
lib_deps =
    knolleary/PubSubClient@^2.8.0
```

### 3.2 Conexão MQTT Básica

```cpp
#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

// Configurações WiFi
const char* WIFI_SSID = "SuaRede";
const char* WIFI_PASSWORD = "SuaSenha";

// Configurações MQTT
const char* MQTT_BROKER = "192.168.1.100";  // IP do seu broker local
const char* MQTT_CLIENT_ID = "esp32_001";
const char* MQTT_TOPIC = "casa/sala/temperatura";

WiFiClient espClient;
PubSubClient mqtt(espClient);

void setupWifi() {
    delay(10);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi conectado!");
}

void reconnect() {
    while (!mqtt.connected()) {
        Serial.print("Conectando ao MQTT...");
        if (mqtt.connect(MQTT_CLIENT_ID)) {
            Serial.println("Conectado!");
            mqtt.subscribe("casa/comando");
        } else {
            Serial.printf("Falhou! Erro: %d\n", mqtt.state());
            delay(2000);
        }
    }
}

void callback(char* topic, byte* payload, unsigned int length) {
    Serial.printf("Mensagem arrived [%s]: ", topic);
    for (int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
    }
    Serial.println();
}

void setup() {
    Serial.begin(115200);
    setupWifi();
    
    mqtt.setServer(MQTT_BROKER, 1883);
    mqtt.setCallback(callback);
}

void loop() {
    if (!mqtt.connected()) {
        reconnect();
    }
    mqtt.loop();
    
    // Publica mensagem
    mqtt.publish(MQTT_TOPIC, "25.5");
    delay(5000);
}
```

---

## 4. QoS (Quality of Service)

### 4.1 Níveis de QoS

| QoS | Descrição | Uso |
|-----|-----------|-----|
| 0 | At most once (fire and forget) | Dados não críticos |
| 1 | At least once (acknowledged) | Dados importantes |
| 2 | Exactly once (assured) | Dados críticos |

### 4.2 Implementando QoS

```cpp
// QoS 0 - Entrega mais rápida
mqtt.publish("topic", "mensagem", false);  // retain=false

// QoS 1 - Garante entrega
mqtt.publish("topic", "mensagem", false, 1);  // QoS 1

// QoS 2 - Garante entrega única
mqtt.publish("topic", "mensagem", false, 2);  // QoS 2

// Inscrever com QoS
mqtt.subscribe("topic", 1);
```

---

## 5. Last Will and Testament (LWT)

### 5.1 O que é LWT?

LWT é uma mensagem que o broker envía quando o cliente desconecta inesperadamente.

### 5.2 Configurando LWT

```cpp
void reconnect() {
    while (!mqtt.connected()) {
        Serial.print("Conectando ao MQTT...");
        
        // Configura LWT
        mqtt.setWill("casa/online", "0", true, 1);
        
        if (mqtt.connect(MQTT_CLIENT_ID)) {
            Serial.println("Conectado!");
            mqtt.publish("casa/online", "1", true);  // Online = true
            mqtt.subscribe("casa/comando");
        } else {
            Serial.printf("Falhou! Erro: %d\n", mqtt.state());
            delay(2000);
        }
    }
}
```

---

## 6. Retain Messages

### 6.1 O que são Retain Messages?

Mensagens retidas ficam armazenadas no broker e são enviadas imediatamente para novos subscribers.

```cpp
// Publicar com retain
mqtt.publish("casa/sala/temperatura", "25.5", true);
```

### 6.2 Aplicação Prática

```
┌─────────────────────────────────────────────────────────────┐
│              RETAIN MESSAGES                                 │
│                                                             │
│   10:00 - Publica "temperatura: 25" (retain)             │
│                                                             │
│   10:30 - Novo subscriber conecta                         │
│          → Broker envia "25" imediatamente!               │
│                                                             │
│   11:00 - Publica "temperatura: 26" (retain)              │
│                                                             │
│   Cliente sempre recebe último valor ao conectar           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Wildcards

### 7.1 Wildcards

| Wildcard | Significado | Exemplo |
|----------|-------------|---------|
| `#` | Multi-nível | `casa/#` recebe tudo em `casa` |
| `+` | Single-level | `casa/+/temperatura` |

### 7.2 Exemplos

```cpp
// Recebe todas as temperaturas de todos os cômodos
mqtt.subscribe("casa/+/temperatura");

// Recebe tudo
mqtt.subscribe("#");

// Recebe todos os sensores
mqtt.subscribe("casa/sensor/#");
```

---

## 8. Sistema Completo: Monitor de Temperatura MQTT

### 8.1 Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│           SISTEMA DE MONITORAMENTO MQTT                      │
│                                                             │
│   BME280 ──► ESP32 ──► MQTT Broker ──► Node-RED           │
│                   │                  │                      │
│                   │                  ▼                      │
│                   │            Dashboard                   │
│                   │                                         │
│                   └─────────► Telegram (alertas)            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Código ESP32

```cpp
#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_BME280.h>

// Configurações WiFi
const char* WIFI_SSID = "SuaRede";
const char* WIFI_PASSWORD = "SuaSenha";

// Configurações MQTT
const char* MQTT_BROKER = "192.168.1.100";
const char* MQTT_CLIENT_ID = "estacao_meteo_001";
const char* MQTT_TOPIC_TEMP = "casa/sala/temperatura";
const char* MQTT_TOPIC_HUM = "casa/sala/umidade";
const char* MQTT_TOPIC_PRESS = "casa/sala/pressao";
const char* MQTT_TOPIC_STATUS = "casa/online";

// Sensor
Adafruit_BME280 bme;

// Cliente WiFi e MQTT
WiFiClient espClient;
PubSubClient mqtt(espClient);

unsigned long lastMsg = 0;
float temp = 0, hum = 0, pres = 0;

void setupWifi() {
    delay(10);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi conectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
}

void reconnect() {
    while (!mqtt.connected()) {
        Serial.print("Conectando ao MQTT...");
        
        // LWT: сообщает о выходе из сети
        mqtt.setWill(MQTT_TOPIC_STATUS, "0", true, 1);
        
        if (mqtt.connect(MQTT_CLIENT_ID)) {
            Serial.println("Conectado!");
            mqtt.publish(MQTT_TOPIC_STATUS, "1", true);
            mqtt.subscribe("casa/sala/comando");
        } else {
            Serial.printf(" Erro: %d\n", mqtt.state());
            delay(2000);
        }
    }
}

void callback(char* topic, byte* payload, unsigned int length) {
    Serial.printf("Comando arrived [%s]: ", topic);
    for (int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
    }
    Serial.println();
}

void setup() {
    Serial.begin(115200);
    
    // Inicializa sensor
    if (!bme.begin(0x76)) {
        Serial.println("BME280 não encontrado!");
    }
    
    setupWifi();
    mqtt.setServer(MQTT_BROKER, 1883);
    mqtt.setCallback(callback);
}

void loop() {
    if (!mqtt.connected()) {
        reconnect();
    }
    mqtt.loop();
    
    unsigned long now = millis();
    if (now - lastMsg > 5000) {  // A cada 5 segundos
        lastMsg = now;
        
        // Lê sensor
        temp = bme.readTemperature();
        hum = bme.readHumidity();
        pres = bme.readPressure() / 100.0F;
        
        // Publica com QoS 1 e retain
        mqtt.publish(MQTT_TOPIC_TEMP, String(temp, 1).c_str(), true, 1);
        mqtt.publish(MQTT_TOPIC_HUM, String(hum, 1).c_str(), true, 1);
        mqtt.publish(MQTT_TOPIC_PRESS, String(pres, 0).c_str(), true, 1);
        
        Serial.printf("Publicado: Temp=%.1f, Hum=%.1f, Press=%.0f\n", 
            temp, hum, pres);
    }
}
```

---

## 9. DESAFIOS

### DESAFIO 1: Publicador de Sensores

**Objetivo**: Publicar dados de sensores via MQTT.

### Requisitos:
- Usar DHT11 ou BME280
- Publicar a cada 10 segundos
- Usar retain messages

---

### DESAFIO 2: Assinante de Comandos

**Objetivo**: Receber comandos via MQTT.

### Requisitos:
- Assinar tópico de comandos
- Controlar LED conforme comando recebido
- "ON" = liga, "OFF" = desliga

---

### DESAFIO 3: QoS Diferenciado

**Objetivo**: Testar diferentes níveis de QoS.

### Requisitos:
- Publicar com QoS 0, 1 e 2
- Observar diferenças no comportamento
- Usar Serial para debug

---

### DESAFIO 4: Sistema Completo

**Objetivo**: Criar sistema de automação.

### Requisitos:
- Múltiplos sensores (temperatura, luz)
- Atuadores (LED, relay)
- Controle via MQTT
- Status online/offline via LWT

---

## 10. Boas Práticas MQTT

1. **Nomeclatura de Tópicos**: Use hierarquia clara
   - `casa/quarto/temperatura` (bom)
   - `dados_sensor_temp_casa` (ruim)

2. **QoS Adequado**: Use QoS 0 para dados frequentes, QoS 1 para críticos

3. **Retain**: Use para estados (não para eventos frequentes)

4. **LWT**: Sempre configure para monitoramento de saúde

5. **QoS 2**: Use apenas quando realmente necessário (mais lento)

---

## 11. Referências

- [MQTT.org Documentation](https://mqtt.org/documentation/)
- [PubSubClient Library](https://pubsubclient.knolleary.net/)
- [HiveMQ MQTT Topics](https://www.hivemq.com/blog/mqtt-essentials-part-5-mqtt-topics-best-practices)
