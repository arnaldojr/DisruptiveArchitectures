# Lab 5 - WiFi e HTTP no ESP32

## Objetivos

Ao final deste laboratório, você será capaz to:

- Conectar o ESP32 a redes WiFi
- Implementar modo Station (STA) e Access Point (AP)
- Criar requisições HTTP client
- Implementar um servidor HTTP simples
- Entender os fundamentos de APIs REST

---

## 1. WiFi no ESP32

### 1.1 Bibliotecas Necessárias

O ESP32 já vem com WiFi integrado. Use as bibliotecas nativas:

```cpp
#include <WiFi.h>
```

### 1.2 Modos de Operação

```
┌─────────────────────────────────────────────────────────────┐
│              MODOS DE OPERAÇÃO WIFI                         │
│                                                             │
│   ┌─────────────┐     ┌─────────────┐                       │
│   │    STA     │     │     AP      │                       │
│   │ (Station)  │     │(Access Point│                       │
│   └─────────────┘     └─────────────┘                       │
│        │                    │                               │
│        ▼                    ▼                               │
│   ┌─────────┐          ┌─────────┐                         │
│   │ Conecta │          │ Cria    │                         │
│   │ ao WiFi │          │ rede    │                         │
│   │ Externo │          │ WiFi    │                         │
│   └─────────┘          └─────────┘                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Conexão WiFi Station (STA)

### 2.1 Conectando a uma Rede WiFi

```cpp
#include <Arduino.h>
#include <WiFi.h>

const char* SSID = "SuaRedeWiFi";
const char* PASSWORD = "SuaSenhaWiFi";

void setup() {
    Serial.begin(115200);
    
    // Conecta ao WiFi
    WiFi.begin(SSID, PASSWORD);
    
    Serial.print("Conectando ao WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println("\nConectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
}

void loop() {
    // Verifica se ainda conectado
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("WiFi conectado!");
    } else {
        Serial.println("WiFi desconectado!");
    }
    delay(5000);
}
```

### 2.2 Funções Úteis WiFi

| Função | Descrição |
|--------|-----------|
| `WiFi.begin(ssid, pass)` | Conecta a uma rede |
| `WiFi.status()` | Retorna status da conexão |
| `WiFi.localIP()` | Retorna IP atribuído |
| `WiFi.RSSI()` | Retorna intensidade do sinal (dBm) |
| `WiFi.disconnect()` | Desconecta da rede |

### 2.3 Códigos de Status

| Código | Significado |
|--------|-------------|
| WL_IDLE_STATUS | Não conectado |
| WL_NO_SSID_AVAILABLE | Rede não encontrada |
| WL_CONNECT_FAILED | Senha incorreta |
| WL_CONNECTED | Conectado com sucesso |
| WL_DISCONNECTED | Desconectado |

---

## 3. Modo Access Point (AP)

### 3.1 Criando um Ponto de Acesso

```cpp
#include <Arduino.h>
#include <WiFi.h>

const char* AP_SSID = "ESP32-Config";
const char* AP_PASSWORD = "12345678";

void setup() {
    Serial.begin(115200);
    
    // Configura como Access Point
    WiFi.softAP(AP_SSID, AP_PASSWORD);
    
    Serial.print("Access Point criado!");
    Serial.printf("SSID: %s\n", AP_SSID);
    Serial.print("IP: ");
    Serial.println(WiFi.softAPIP());
}

void loop() {}
```

### 3.2 Access Point com Configuração Personalizada

```cpp
WiFi.softAPConfig(
    IPAddress(192, 168, 4, 1),    // IP do AP
    IPAddress(192, 168, 4, 1),    // Gateway
    IPAddress(255, 255, 255, 0)   // Máscara
);
```

---

## 4. HTTP Client - Fazendo Requisições

### 4.1 Instalando Biblioteca HTTP

Adicione ao `platformio.ini`:

```ini
lib_deps =
    espressif/ESP HTTP Client@^0.2.0
```

### 4.2 GET Request Simples

```cpp
#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>

const char* SSID = "SuaRede";
const char* PASSWORD = "SuaSenha";

void setup() {
    Serial.begin(115200);
    WiFi.begin(SSID, PASSWORD);
    
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConectado!");
}

void loop() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        
        http.begin("http://httpbin.org/get");
        int httpCode = http.GET();
        
        if (httpCode > 0) {
            String payload = http.getString();
            Serial.printf("HTTP Code: %d\n", httpCode);
            Serial.println(payload);
        } else {
            Serial.printf("Erro: %s\n", http.errorToString(httpCode).c_str());
        }
        
        http.end();
    }
    
    delay(10000);  // 10 segundos
}
```

### 4.3 POST Request com JSON

```cpp
void postJson() {
    HTTPClient http;
    
    http.begin("http://httpbin.org/post");
    http.addHeader("Content-Type", "application/json");
    
    String json = "{\"temperatura\": 25.5, \"umidade\": 60.0}";
    int httpCode = http.POST(json);
    
    if (httpCode > 0) {
        String response = http.getString();
        Serial.println(response);
    }
    
    http.end();
}
```

### 4.4 GET comparâmetros

```cpp
void getWithParams() {
    HTTPClient http;
    
    // API pública de exemplo: Open-Meteo
    String url = "https://api.open-meteo.com/v1/forecast?"
                 "latitude=-23.55&longitude=-46.63&current_weather=true";
    
    http.begin(url);
    int httpCode = http.GET();
    
    if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        Serial.println(payload);
    }
    
    http.end();
}
```

---

## 5. HTTP Server - Criando um Servidor Web

### 5.1 Servidor HTTP Simples

```cpp
#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>

const char* SSID = "SuaRede";
const char* PASSWORD = "SuaSenha";

WebServer server(80);

const char HTML[] = R"rawliteral(
<!DOCTYPE html>
<html>
<head><title>ESP32</title></head>
<body>
    <h1>Meu ESP32!</h1>
    <p>Hello from ESP32 Web Server</p>
</body>
</html>
)rawliteral";

void handleRoot() {
    server.send(200, "text/html", HTML);
}

void handleNotFound() {
    server.send(404, "text/plain", "Not Found");
}

void setup() {
    Serial.begin(115200);
    WiFi.begin(SSID, PASSWORD);
    
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println("\nConectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    
    server.on("/", handleRoot);
    server.onNotFound(handleNotFound);
    
    server.begin();
}

void loop() {
    server.handleClient();
}
```

### 5.2 API REST com LEDs

```cpp
#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>

const char* SSID = "SuaRede";
const char* PASSWORD = "SuaSenha";

WebServer server(80);

const uint8_t LED1 = 2;
const uint8_t LED2 = 4;

void setup() {
    Serial.begin(115200);
    pinMode(LED1, OUTPUT);
    pinMode(LED2, OUTPUT);
    digitalWrite(LED1, LOW);
    digitalWrite(LED2, LOW);
    
    WiFi.begin(SSID, PASSWORD);
    while (WiFi.status() != WL_CONNECTED) delay(500);
    Serial.println(WiFi.localIP());
    
    // Rotas da API
    server.on("/led1/on", HTTP_GET, []() {
        digitalWrite(LED1, HIGH);
        server.send(200, "application/json", "{\"led1\": \"on\"}");
    });
    
    server.on("/led1/off", HTTP_GET, []() {
        digitalWrite(LED1, LOW);
        server.send(200, "application/json", "{\"led1\": \"off\"}");
    });
    
    server.on("/led2/on", HTTP_GET, []() {
        digitalWrite(LED2, HIGH);
        server.send(200, "application/json", "{\"led2\": \"on\"}");
    });
    
    server.on("/led2/off", HTTP_GET, []() {
        digitalWrite(LED2, LOW);
        server.send(200, "application/json", "{\"led2\": \"off\"}");
    });
    
    server.on("/status", HTTP_GET, []() {
        String json = "{";
        json += "\"led1\":" + String(digitalRead(LED1)) + ",";
        json += "\"led2\":" + String(digitalRead(LED2));
        json += "}";
        server.send(200, "application/json", json);
    });
    
    server.begin();
}

void loop() {
    server.handleClient();
}
```

### 5.3 Testando a API

```bash
# Ligar LED 1
curl http://192.168.1.100/led1/on

# Desligar LED 1
curl http://192.168.1.100/led1/off

# Ver status
curl http://192.168.1.100/status
```

---

## 6. Aplicação Prática: Estação Meteorológica Web

### 6.1 Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│           ESTAÇÃO METEOROLÓGICA WEB                         │
│                                                             │
│   BME280 ──► ESP32 ──► WiFi ──► Navegador Web              │
│              (HTTP                                         │
│               Server)                                      │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Código Completo

```cpp
#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_BME280.h>

// Configurações WiFi
const char* SSID = "SuaRede";
const char* PASSWORD = "SuaSenha";

// Sensor
Adafruit_BME280 bme;

// Servidor web na porta 80
WebServer server(80);

void handleRoot() {
    float temp = bme.readTemperature();
    float hum = bme.readHumidity();
    float pres = bme.readPressure() / 100.0F;
    
    String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Estação Meteorológica</title>
    <meta http-equiv="refresh" content="5">
    <style>
        body { font-family: Arial; margin: 40px; }
        .card { background: #f0f0f0; padding: 20px; margin: 10px; border-radius: 10px; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <h1>🌤️ Estação Meteorológica ESP32</h1>
    <div class="card">
        <h2>🌡️ Temperatura: )rawliteral" + String(temp) + R"rawliteral °C</h2>
    </div>
    <div class="card">
        <h2>💧 Umidade: )rawliteral" + String(hum) + R"rawliteral %</h2>
    </div>
    <div class="card">
        <h2>📊 Pressão: )rawliteral" + String(pres) + R"rawliteral hPa</h2>
    </div>
    <p>Atualizado automaticamente a cada 5 segundos</p>
</body>
</html>
)rawliteral";
    
    server.send(200, "text/html", html);
}

void handleApi() {
    float temp = bme.readTemperature();
    float hum = bme.readHumidity();
    float pres = bme.readPressure() / 100.0F;
    
    String json = "{";
    json += "\"temperatura\":" + String(temp, 1) + ",";
    json += "\"umidade\":" + String(hum, 1) + ",";
    json += "\"pressao\":" + String(pres, 0);
    json += "}";
    
    server.send(200, "application/json", json);
}

void setup() {
    Serial.begin(115200);
    
    // Inicializa sensor
    if (!bme.begin(0x76)) {
        Serial.println("BME280 não encontrado!");
    }
    
    // Conecta WiFi
    WiFi.begin(SSID, PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    
    // Configura rotas
    server.on("/", handleRoot);
    server.on("/api", handleApi);
    
    server.begin();
}

void loop() {
    server.handleClient();
}
```

---

## 7. DESAFIOS

### DESAFIO 1: Cliente HTTP com LEDs

**Objetivo**: Controlar LEDs via requisições HTTP.

### Requisitos:
- Conectar ao WiFi
- Criar endpoints para:
  - `/led/on` - Liga LED
  - `/led/off` - Desliga LED
  - `/status` - Retorna estado atual

---

### DESAFIO 2: Leitor de API

**Objetivo**: Consumir dados de uma API externa.

### Requisitos:
- Usar API pública (ex: Open-Meteo)
- Exibir dados no Serial Monitor
- Atualizar a cada 30 segundos

---

### DESAFIO 3: Formulário Web

**Objetivo**: Criar interface web para configurar WiFi.

### Requisitos:
- Página HTML com formulário
- Campos: SSID e Senha
- Ao submeter, salvar configurações

---

### DESAFIO 4: Monitor Serial via Web

**Objetivo**: Acessar Serial Monitor pelo navegador.

### Requisitos:
- Endpoint `/serial` retorna últimas mensagens
- Endpoint `/execute` executa comando e retorna resultado

---

## 8. Referências

- [ESP32 WiFi Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/api-reference/network/esp_wifi.html)
- [ESP32 HTTP Server](https://docs.espressif.com/projects/esp-idf/en/latest/api-reference/protocols/esp_http_server.html)
- [Arduino HTTP Client](https://github.com/espressif/arduino-esp32/tree/master/libraries/HTTPClient)
