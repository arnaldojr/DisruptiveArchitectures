# Introdução ao ESP32

## O que é o ESP32?

O ESP32 é um microcontrolador de baixo custo e baixo consumo de energia que integra Wi-Fi e Bluetooth em um único chip. Desenvolvido pela Espressif Systems, o ESP32 se tornou um dos componentes mais populares para projetos de Internet das Coisas (IoT) devido à sua versatilidade e poder computacional.

## Características Principais

- **Processador**: Dual-core Tensilica Xtensa LX6 de 32 bits (até 240MHz)
- **Memória**: 520 KB de SRAM
- **Conectividade**: Wi-Fi 802.11 b/g/n (2.4 GHz) e Bluetooth 4.2 (BLE)
- **GPIO**: Até 36 pinos
- **Periféricos**: ADC, DAC, I²C, SPI, UART, CAN, PWM, etc.
- **Segurança**: Criptografia por hardware

## Diferenças entre ESP32 e Arduino

| Característica | ESP32 | Arduino UNO |
|----------------|-------|-------------|
| Processador | Dual-core 32-bit até 240MHz | Single-core 8-bit 16MHz |
| Memória RAM | 520 KB | 2 KB |
| WiFi | Integrado | Necessita shield |
| Bluetooth | Integrado | Necessita shield |
| GPIO | Até 36 pinos | 14 pinos digitais, 6 analógicos |
| Preço | $3-$10 | $20-$25 |

## Modelos Comuns de ESP32

1. **ESP32-DevKitC**: Placa de desenvolvimento básica
2. **ESP32-WROOM-32**: Módulo com antena PCB integrada
3. **ESP32-WROVER**: Módulo com antena externa e memória PSRAM adicional
4. **TTGO T-Display**: ESP32 com display LCD colorido
5. **M5Stack**: ESP32 em formato modular com display e sensores

## Por que usar ESP32 para IoT?

- **Conectividade Integrada**: WiFi e Bluetooth prontos para uso
- **Baixo Consumo**: Modos de deep sleep para aplicações com bateria
- **Alto Desempenho**: Processador dual-core permite aplicações mais complexas
- **Baixo Custo**: Excelente custo-benefício para projetos IoT
- **Ecossistema Rico**: Ampla comunidade e muitas bibliotecas disponíveis

## Aplicações Comuns

- Automação residencial
- Monitoramento remoto
- Controle industrial
- Wearables e dispositivos médicos
- Estações meteorológicas
- Sistemas de segurança

---

Conectando o ESP32 a redes WiFi, implementar um servidor web simples, realizar requisições HTTP e trabalhar com serviços online.

## Conectando o ESP32 a uma Rede WiFi

### Código Básico de Conexão WiFi

```cpp
#include <WiFi.h>

const char* ssid     = "SuaRedeWiFi";
const char* password = "SuaSenhaWiFi";

void setup() {
  Serial.begin(115200);
  delay(10);

  // Mensagem inicial
  Serial.println();
  Serial.println("Conectando a:");
  Serial.println(ssid);

  // Inicia a conexão WiFi
  WiFi.begin(ssid, password);

  // Aguarda a conexão
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  // Conexão estabelecida
  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.println("Endereço IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Verifica periodicamente o status da conexão
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Conexão WiFi perdida. Reconectando...");
    WiFi.begin(ssid, password);
    
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    
    Serial.println("Reconectado ao WiFi");
  }
  
  delay(30000); // Verifica a cada 30 segundos
}
```
---

## Criando um Servidor Web Simples

O ESP32 pode funcionar como um servidor web, permitindo o controle e monitoramento através de uma página web.

### Código do Servidor Web Básico

```cpp

#include <WiFi.h>
#include <WiFiClient.h>
#include <WebServer.h>
#include <uri/UriBraces.h>

#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""
// Defining the WiFi channel speeds up the connection:
#define WIFI_CHANNEL 6

WebServer server(80);

const int LED1 = 26;
const int LED2 = 27;

bool led1State = false;
bool led2State = false;

void sendHtml() {
  String response = R"(
    <!DOCTYPE html><html>
      <head>
        <title>ESP32 Web Server Demo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          html { font-family: sans-serif; text-align: center; }
          body { display: inline-flex; flex-direction: column; }
          h1 { margin-bottom: 1.2em; } 
          h2 { margin: 0; }
          div { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; grid-auto-flow: column; grid-gap: 1em; }
          .btn { background-color: #5B5; border: none; color: #fff; padding: 0.5em 1em;
                 font-size: 2em; text-decoration: none }
          .btn.OFF { background-color: #333; }
        </style>
      </head>
            
      <body>
        <h1>ESP32 Web Server</h1>

        <div>
          <h2>LED 1</h2>
          <a href="/toggle/1" class="btn LED1_TEXT">LED1_TEXT</a>
          <h2>LED 2</h2>
          <a href="/toggle/2" class="btn LED2_TEXT">LED2_TEXT</a>
        </div>
      </body>
    </html>
  )";
  response.replace("LED1_TEXT", led1State ? "ON" : "OFF");
  response.replace("LED2_TEXT", led2State ? "ON" : "OFF");
  server.send(200, "text/html", response);
}

void setup(void) {
  Serial.begin(115200);
  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD, WIFI_CHANNEL);
  Serial.print("Connecting to WiFi ");
  Serial.print(WIFI_SSID);
  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(100);
    Serial.print(".");
  }
  Serial.println(" Connected!");

  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  server.on("/", sendHtml);

  server.on(UriBraces("/toggle/{}"), []() {
    String led = server.pathArg(0);
    Serial.print("Toggle LED #");
    Serial.println(led);

    switch (led.toInt()) {
      case 1:
        led1State = !led1State;
        digitalWrite(LED1, led1State);
        break;
      case 2:
        led2State = !led2State;
        digitalWrite(LED2, led2State);
        break;
    }

    sendHtml();
  });

  server.begin();
  Serial.println("HTTP server started");
}

void loop(void) {
  server.handleClient();
  delay(2);
}

```