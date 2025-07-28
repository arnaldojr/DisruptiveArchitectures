# Conectividade WiFi com ESP32

Nesta aula, exploraremos um dos recursos mais importantes do ESP32 para IoT: a conectividade WiFi. Aprenderemos a conectar o ESP32 a redes WiFi, implementar um servidor web simples, realizar requisições HTTP e trabalhar com serviços online.

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

## Criando um Servidor Web Simples

O ESP32 pode funcionar como um servidor web, permitindo o controle e monitoramento através de uma página web.

### Código do Servidor Web Básico

```cpp
#include <WiFi.h>
#include <WebServer.h>

const char* ssid     = "SuaRedeWiFi";
const char* password = "SuaSenhaWiFi";

// Define a porta do servidor web (80 é a porta padrão HTTP)
WebServer server(80);

// Pino do LED interno
const int ledPin = 2;
bool ledStatus = false;

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  
  // Conecta ao WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando ao WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.println("Endereço IP: ");
  Serial.println(WiFi.localIP());
  
  // Configurar as rotas do servidor
  server.on("/", handleRoot);
  server.on("/toggle", handleToggle);
  
  // Iniciar o servidor
  server.begin();
  Serial.println("Servidor HTTP iniciado");
}

void loop() {
  // Manipula as requisições do cliente
  server.handleClient();
}

// Função para página principal
void handleRoot() {
  String html = "<!DOCTYPE html><html>";
  html += "<head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">";
  html += "<style>body { font-family: Arial; text-align: center; margin: 0px auto; padding: 20px; }";
  html += "button { background-color: #4CAF50; color: white; padding: 15px 32px; font-size: 16px; margin: 4px; cursor: pointer; border: none; border-radius: 4px; }";
  html += "</style></head><body>";
  html += "<h1>ESP32 Web Server</h1>";
  
  if (ledStatus) {
    html += "<p>Status do LED: LIGADO</p>";
    html += "<button onclick=\"window.location.href='/toggle'\">DESLIGAR</button>";
  } else {
    html += "<p>Status do LED: DESLIGADO</p>";
    html += "<button onclick=\"window.location.href='/toggle'\">LIGAR</button>";
  }
  
  html += "</body></html>";
  server.send(200, "text/html", html);
}

// Função para alternar o estado do LED
void handleToggle() {
  ledStatus = !ledStatus;
  digitalWrite(ledPin, ledStatus ? HIGH : LOW);
  server.sendHeader("Location", "/");
  server.send(303);
}
```

## Fazendo Requisições HTTP (Cliente)

O ESP32 também pode atuar como cliente, realizando requisições HTTP para serviços web.

### Código para Requisições GET

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid     = "SuaRedeWiFi";
const char* password = "SuaSenhaWiFi";

// URL para a qual faremos a requisição
const char* serverUrl = "http://jsonplaceholder.typicode.com/todos/1";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  Serial.print("Conectando ao WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.println("Endereço IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Verifica se está conectado ao WiFi
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    Serial.print("Realizando requisição HTTP GET para: ");
    Serial.println(serverUrl);
    
    // Inicia a conexão com o servidor
    http.begin(serverUrl);
    
    // Envia a requisição HTTP GET
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
      Serial.print("Código de resposta HTTP: ");
      Serial.println(httpResponseCode);
      
      if (httpResponseCode == HTTP_CODE_OK) {
        String payload = http.getString();
        Serial.println("Resposta:");
        Serial.println(payload);
      }
    } else {
      Serial.print("Erro na requisição HTTP. Código de erro: ");
      Serial.println(httpResponseCode);
    }
    
    // Libera os recursos
    http.end();
  } else {
    Serial.println("Erro na conexão WiFi");
  }
  
  // Espera 60 segundos para a próxima requisição
  delay(60000);
}
```

## Enviando Dados para um Serviço Web (POST)

### Código para Requisições POST

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid     = "SuaRedeWiFi";
const char* password = "SuaSenhaWiFi";

// URL para onde enviaremos os dados
const char* serverUrl = "http://jsonplaceholder.typicode.com/posts";

// Simulação de leitura de sensores
float getTemperature() {
  return random(2000, 3000) / 100.0; // Simula temperatura entre 20-30°C
}

float getHumidity() {
  return random(4000, 8000) / 100.0; // Simula umidade entre 40-80%
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  Serial.print("Conectando ao WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.println("Endereço IP: ");
  Serial.println(WiFi.localIP());

  // Inicializa o gerador de números aleatórios
  randomSeed(analogRead(0));
}

void loop() {
  // Verifica se está conectado ao WiFi
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Cria um objeto JSON para armazenar os dados
    StaticJsonDocument<200> doc;
    
    // Adiciona os dados dos "sensores"
    doc["deviceId"] = "ESP32-" + String((uint32_t)ESP.getEfuseMac(), HEX);
    doc["temperature"] = getTemperature();
    doc["humidity"] = getHumidity();
    doc["timestamp"] = millis();
    
    // Serializa o JSON para uma String
    String jsonString;
    serializeJson(doc, jsonString);
    
    Serial.println("Enviando dados via POST:");
    Serial.println(jsonString);
    
    // Inicia a conexão com o servidor
    http.begin(serverUrl);
    
    // Especifica o tipo de conteúdo
    http.addHeader("Content-Type", "application/json");
    
    // Envia a requisição HTTP POST com os dados JSON
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      Serial.print("Código de resposta HTTP: ");
      Serial.println(httpResponseCode);
      
      String response = http.getString();
      Serial.println("Resposta:");
      Serial.println(response);
    } else {
      Serial.print("Erro na requisição HTTP POST. Código de erro: ");
      Serial.println(httpResponseCode);
    }
    
    // Libera os recursos
    http.end();
  } else {
    Serial.println("Erro na conexão WiFi");
  }
  
  // Espera 30 segundos para a próxima requisição
  delay(30000);
}
```

## Utilizando WiFiManager para Configuração Fácil

O WiFiManager permite configurar as credenciais WiFi sem precisar recompilar o código.

### Instalação da Biblioteca WiFiManager

1. Na IDE do Arduino, acesse **Sketch > Incluir Biblioteca > Gerenciar Bibliotecas...**
2. Pesquise por "WiFiManager"
3. Instale a biblioteca "WiFiManager by tzapu"

### Código com WiFiManager

```cpp
#include <WiFiManager.h>

void setup() {
  Serial.begin(115200);
  
  // Inicializa o WiFiManager
  WiFiManager wifiManager;
  
  // Mensagem informativa
  Serial.println("Conectando à rede WiFi...");
  Serial.println("Se não conectar automaticamente, conecte-se à rede 'ESP32-AutoConnectAP'");
  Serial.println("e acesse 192.168.4.1 no navegador para configurar");
  
  // Define o timeout para modo de configuração (30 segundos)
  wifiManager.setConfigPortalTimeout(180);
  
  // Tenta se conectar ou inicia o portal de configuração
  bool res = wifiManager.autoConnect("ESP32-AutoConnectAP", "password123");

  if(!res) {
    Serial.println("Falha ao conectar");
    // Reset e tenta novamente
    ESP.restart();
  } 
  else {
    // Conectado com sucesso
    Serial.println("WiFi conectado");
    Serial.print("Endereço IP: ");
    Serial.println(WiFi.localIP());
  }
}

void loop() {
  // Seu código principal aqui
  delay(1000);
}
```

## Projeto Prático: Monitor de Temperatura e Umidade com Dashboard Web

Combine os exemplos anteriores para criar um projeto que:
1. Lê dados de um sensor DHT22
2. Fornece uma interface web para visualização em tempo real
3. Armazena leituras recentes para exibir um gráfico

O código completo para este projeto está disponível no repositório de exemplos.

## Próximos Passos

Na próxima aula, exploraremos a conectividade Bluetooth do ESP32, outro recurso importante para aplicações IoT que requerem comunicação de curto alcance.

**Desafio:** Modifique o servidor web para incluir mais funcionalidades, como controlar múltiplos LEDs ou exibir dados de diferentes sensores.
