# Lab 13 - Checkpoint 2: Avaliação Prática

## Instruções Gerais

- **Duração**: 90 minutos
- **Plataforma**: Wokwi
- **Nota**: 10,0 pontos
- **Permitido**: Apenas código escrito à mão

---

## Parte 1: I2C e Sensores (3,0 pontos)

### Exercício 1.1: Escanear I2C (1,0 ponto)

Implemente um scanner de dispositivos I2C.

```c
#include <Wire.h>

void setup() {
    Serial.begin(115200);
    Wire.begin(21, 22);  // SDA, SCL
    
    Serial.println("Escaneando I2C...");
    
    for (uint8_t addr = 1; addr < 127; addr++) {
        // Implemente o escaneamento
    }
}

void loop() {}
```

### Exercício 1.2: Ler BME280 (2,0 pontos)

Configure e leia o sensor BME280 via I2C.

```c
#include <Wire.h>
// Adicione biblioteca BME280

// Endereço BME280
const uint8_t BME_ADDR = 0x76;

void setup() {
    Serial.begin(115200);
    Wire.begin(21, 22);
    
    // Inicialize o BME280
}

void loop() {
    // Leia temperatura, umidade e pressão
    // Imprima no Serial
    delay(2000);
}
```

---

## Parte 2: WiFi e HTTP (3,0 pontos)

### Exercício 2.1: Conectar WiFi (1,5 pontos)

Conecte o ESP32 a uma rede WiFi.

```c
#include <WiFi.h>

const char* SSID = "TestNetwork";
const char* PASSWORD = "password123";

void setup() {
    Serial.begin(115200);
    
    WiFi.begin(SSID, PASSWORD);
    
    // Aguarde conexão e imprima IP
}

void loop() {}
```

### Exercício 2.2: HTTP GET (1,5 ponto)

Faça uma requisição HTTP GET.

```c
#include <HTTPClient.h>

void makeRequest() {
    HTTPClient http;
    http.begin("http://httpbin.org/get");
    
    int code = http.GET();
    
    if (code > 0) {
        String payload = http.getString();
        Serial.println(payload);
    }
    
    http.end();
}
```

---

## Parte 3: MQTT e FreeRTOS (4,0 pontos)

### Exercício 3.1: MQTT Publish (2,0 pontos)

Publique dados via MQTT.

```c
#include <PubSubClient.h>

const char* BROKER = "192.168.1.100";
const char* TOPIC = "teste/dados";

WiFiClient espClient;
PubSubClient mqtt(espClient);

void setup() {
    Serial.begin(115200);
    // Conecte WiFi e MQTT
    mqtt.setServer(BROKER, 1883);
}

void loop() {
    // Publique "Hello MQTT" a cada 5 segundos
}
```

### Exercício 3.2: Task FreeRTOS (2,0 pontos)

Crie duas tasks independentes.

```c
#include <freertos/FreeRTOS.h>
#include <task.h>

const uint8_t LED1 = 2;
const uint8_t LED2 = 4;

void task1(void* param) {
    while(true) {
        digitalWrite(LED1, HIGH);
        vTaskDelay(500 / portTICK_PERIOD_MS);
        digitalWrite(LED1, LOW);
        vTaskDelay(500 / portTICK_PERIOD_MS);
    }
}

// Crie task2 (LED2) com 1 segundo de intervalo
// Crie ambas as tasks no setup
```

---

## Parte 4: Questões Teóricas (Tempo Extra)

1. Qual a vantagem de usar deep sleep? (0,5 pontos)

2. Para que serve LWT em MQTT? (0,5 pontos)

---

## Rubrica

| Parte | Pontos |
|-------|--------|
| I2C/Sensores | 3,0 |
| WiFi/HTTP | 3,0 |
| MQTT/FreeRTOS | 4,0 |
| **Total** | **10,0** |

Boa sorte!
