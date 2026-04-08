# Lab 12 - Segurança e OTA

## Objetivos

Ao final deste laboratório, você será capaz de:

- Implementar segurança em comunicações IoT
- Configurar TLS/SSL
- Implementar OTA (Over-The-Air) updates
- Gerenciar energia do ESP32
- Aplicar boas práticas de segurança

---

## 1. Segurança em IoT

### 1.1 Principais Ameaças

```
┌─────────────────────────────────────────────────────────────┐
│                AMEAÇAS EM IOT                                │
│                                                             │
│   1. Comunicação não criptografada                          │
│   2. Senhas fracas/padrão                                   │
│   3. Firmware desatualizado                                 │
│   4. Sem autenticação                                       │
│   5. Vulnerabilidades conhecidas                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Camadas de Segurança

| Camada | Proteção |
|--------|----------|
| Rede | Firewall, VPN |
| Transporte | TLS/SSL |
| Aplicação | Autenticação, Autorização |
| Dispositivo | Secure Boot, Criptografia |

---

## 2. TLS/SSL no ESP32

### 2.1 MQTT com TLS

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

// Certificados (em bytes[])
#include "cert.h"

WiFiClientSecure espClient;
PubSubClient mqtt(espClient);

void setup() {
    Serial.begin(115200);
    
    // Configurar certificado
    espClient.setCACert(test_ca_cert);
    
    // Conectar WiFi
    WiFi.begin(ssid, password);
    
    // Configurar MQTT com TLS
    mqtt.setServer("mqtt.example.com", 8883);
}

void loop() {
    if (!mqtt.connected()) {
        reconnect();
    }
    mqtt.loop();
}
```

### 2.2 Certificado CA

Gere certificados com Let's Encrypt ou use:

```cpp
// Exemplo de certificado auto-assinado (para teste)
const char* test_ca_cert = R"CERT(
-----BEGIN CERTIFICATE-----
MIIDdzCCAl+gAwIBAgIEAgAAuTANBgkqhkiG9w0BAQUFADBa...
-----END CERTIFICATE-----
)CERT";
```

---

## 3. Autenticação

### 3.1 Basic Auth em HTTP

```cpp
#include <WebServer.h>
#include <Base64.h>

const char* USERNAME = "admin";
const char* PASSWORD = "senha123";

bool checkAuth() {
    if (!server.hasHeader("Authorization")) {
        return false;
    }
    
    String authHeader = server.header("Authorization");
    String authCredentials = authHeader.substring(6);
    
    String decoded = Base64.decode(authCredentials);
    
    int colonIndex = decoded.indexOf(':');
    String user = decoded.substring(0, colonIndex);
    String pass = decoded.substring(colonIndex + 1);
    
    return (user == USERNAME && pass == PASSWORD);
}

void handleProtected() {
    if (!checkAuth()) {
        server.send(401, "text/plain", "Unauthorized");
        return;
    }
    server.send(200, "text/plain", "Protected content");
}
```

### 3.2 Token JWT

```cpp
// Simplificado - use biblioteca em produção
String createToken(String payload) {
    // Header
    String header = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
    // Payload (base64 do JSON)
    String encodedPayload = "";
    // Signature
    String signature = "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    
    return header + "." + encodedPayload + "." + signature;
}
```

---

## 4. OTA (Over-The-Air)

### 4.1 Atualização via HTTP

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <Update.h>

const char* firmwareURL = "http://192.168.1.100/firmware.bin";

void performOTA() {
    HTTPClient http;
    http.begin(firmwareURL);
    
    int httpCode = http.GET();
    
    if (httpCode == 200) {
        int contentLength = http.getSize();
        
        if (Update.begin(contentLength)) {
            WiFiClient* stream = http.getStreamPtr();
            
            size_t written = Update.writeStream(*stream);
            
            if (Update.end(true)) {
                Serial.println("Atualização completa!");
                ESP.restart();
            }
        }
    }
    http.end();
}
```

### 4.2 Servidor de Firmware

Para testar, crie um servidor simples:

```python
# server.py
from http.server import HTTPServer, BaseHTTPRequestHandler

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/firmware.bin':
            self.send_response(200)
            self.send_header('Content-Type', 'application/octet-stream')
            self.end_headers()
            with open('firmware.bin', 'rb') as f:
                self.wfile.write(f.read())

HTTPServer(('', 8000), Handler).serve_forever()
```

### 4.3OTA com Versão

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <Update.h>
#include <ArduinoJson.h>

const char* versionURL = "http://192.168.1.100/version.json";
const char* currentVersion = "1.0.0";

void checkForUpdate() {
    HTTPClient http;
    http.begin(versionURL);
    
    if (http.GET() == 200) {
        String payload = http.getString();
        
        StaticJsonDocument<256> doc;
        deserializeJson(doc, payload);
        
        const char* latestVersion = doc["version"];
        
        if (strcmp(latestVersion, currentVersion) > 0) {
            Serial.printf("Nova versão disponível: %s\n", latestVersion);
            performOTA(doc["url"]);
        } else {
            Serial.println("Você já tem a versão mais recente.");
        }
    }
    http.end();
}
```

---

## 5. Gerenciamento de Energia

### 5.1 Modos de Sleep

```cpp
// Light Sleep
void lightSleep() {
    esp_light_sleep_start();
    // Continua após wakeup
}

// Deep Sleep - mais economia
void deepSleep() {
    esp_deep_sleep_start();
    // Não retorna - reinicia
}
```

### 5.2 Wake-up Sources

```cpp
#include <esp_sleep.h>

void setupSleep() {
    // Timer wake-up (5 minutos)
    esp_sleep_enable_timer_wakeup(5 * 60 * 1000000);
    
    // GPIO wake-up
    esp_sleep_enable_gpio_wakeup();
    
    // RTC IO wake-up
    esp_sleep_enable_ext0_wakeup(GPIO_NUM_4, LOW);
}

void loop() {
    Serial.println("Entrando em light sleep...");
    delay(1000);
    esp_light_sleep_start();
    Serial.println("Acordei!");
}
```

### 5.3 Bateria - Cálculo de Autonomia

```
┌─────────────────────────────────────────────────────────────┐
│              CONSUMO TÍPICO ESP32                            │
│                                                             │
│   Modo Ativo (WiFi):     80-170 mA                         │
│   Modo Light Sleep:       0.8 mA                           │
│   Modo Deep Sleep:       10-20 µA                         │
│                                                             │
│   Bateria 2000mAh:                                        │
│   - Ativo (100mA):    ~20 horas                          │
│   - Deep Sleep (15µA): ~15 anos!                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Exemplo: Sensor com Deep Sleep

```cpp
#include <esp_sleep.h>

const uint64_t SLEEP_TIME = 60 * 1000000; // 60 segundos
const uint8_t WAKE_PIN = 4;

void setup() {
    Serial.begin(115200);
    
    // Seu código aqui
    Serial.println("Iniciando...");
    
    // Medir sensor
    float temp = 20.5; // simulado
    
    // Enviar dados (implementar MQTT/WiFi)
    
    // Configurar próximo wake-up
    esp_sleep_enable_timer_wakeup(SLEEP_TIME);
    
    Serial.printf("Dormindo por %d segundos...\n", SLEEP_TIME / 1000000);
    delay(100);
    
    esp_deep_sleep_start();
}

void loop() {
    // Não usado em deep sleep
}
```

---

## 6. DESAFIOS

### DESAFIO 1: MQTT TLS

**Objetivo**: Implementar MQTT seguro.

### Requisitos:
- Usar porta 8883 (MQTTS)
- Configurar certificado CA
- Verificar conexão TLS

---

### DESAFIO 2: OTA Automático

**Objetivo**: Sistema de atualização automática.

### Requisitos:
- Verificar versão ao iniciar
- Baixar e aplicar update
- Reiniciar após update

---

### DESAFIO 3: Sensor Battery

**Objetivo**: Sistema com bateria.

### Requisitos:
- Deep sleep entre leituras
- MQTT após acordar
- LED indica status de bateria

---

### DESAFIO 4: Protegendo API

**Objetivo**: API segura com autenticação.

### Requisitos:
- Endpoint com Basic Auth
- Token JWT para sessões
- HTTPS (se possível)

---

## 7. Boas Práticas de Segurança

1. **Sempre use TLS** para comunicações
2. **Não exponha** credenciais no código
3. **Atualize firmware** regularmente
4. **Use senhas fortes** e únicas
5. **Implemente** secure boot em produção
6. **Monitore** dispositivos em produção

---

## 8. Referências

- [ESP32 TLS Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/api-reference/protocols/esp_tls.html)
- [ESP32 OTA Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/api-reference/system/ota.html)
- [ESP32 Sleep Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/api-reference/system/sleep_modes.html)
