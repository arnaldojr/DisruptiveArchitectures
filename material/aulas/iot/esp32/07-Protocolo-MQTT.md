# Protocolo MQTT com ESP32

Nesta aula, vamos explorar o protocolo MQTT (Message Queuing Telemetry Transport), um dos protocolos mais utilizados em aplicações IoT devido à sua leveza, eficiência e confiabilidade.

## O que é MQTT?

MQTT é um protocolo de mensagens leve, projetado para dispositivos com recursos limitados e redes de baixa largura de banda, alta latência ou instáveis. Ele utiliza um modelo de comunicação publish/subscribe (publicação/assinatura), que é mais eficiente que o modelo tradicional request/response (requisição/resposta).

### Características Principais do MQTT

- **Leve**: Requer mínimos recursos de hardware
- **Bidirecional**: Permite tanto enviar quanto receber dados
- **Seguro**: Suporta autenticação e criptografia TLS/SSL
- **Desacoplado**: Os clientes não precisam conhecer uns aos outros
- **Escalonável**: Pode suportar milhares de dispositivos conectados
- **Eficiente**: Pouco overhead de protocolo

## Conceitos Fundamentais do MQTT

### Broker

O broker é o servidor central que gerencia todas as mensagens entre os clientes. Ele recebe mensagens publicadas e as encaminha para os clientes que se inscreveram nos tópicos correspondentes.

Brokers MQTT populares:
- Mosquitto
- HiveMQ
- AWS IoT Core
- Azure IoT Hub
- CloudMQTT

### Publish/Subscribe

- **Publish (Publicação)**: Ato de enviar uma mensagem para um tópico específico no broker
- **Subscribe (Assinatura)**: Ato de informar ao broker que você deseja receber mensagens de um tópico específico

### Tópicos (Topics)

Os tópicos são strings que definem canais de comunicação. Eles são organizados em hierarquias, separados por barras (/).

Exemplos:
- `casa/sala/temperatura`
- `casa/quarto/lampada`
- `carro/sensor/velocidade`

### QoS (Quality of Service)

O MQTT oferece três níveis de garantia de entrega:

- **QoS 0** (At most once): A mensagem é enviada no máximo uma vez, sem confirmação
- **QoS 1** (At least once): A mensagem é enviada pelo menos uma vez, com confirmação
- **QoS 2** (Exactly once): A mensagem é entregue exatamente uma vez, através de um handshake de 4 etapas

## Configurando um Broker MQTT Local

Antes de programar o ESP32, vamos configurar um broker MQTT local para testes:

### Instalação do Mosquitto (Broker MQTT)

#### Windows
1. Baixe o instalador em [mosquitto.org/download](https://mosquitto.org/download/)
2. Execute o instalador e siga as instruções
3. Adicione mosquitto ao PATH do sistema

#### macOS
```bash
brew install mosquitto
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install mosquitto mosquitto-clients
```

### Iniciando o Mosquitto
```bash
mosquitto -v
```

Isso inicia o broker na porta padrão 1883.

## Programando o ESP32 com MQTT

### Bibliotecas Necessárias

Na IDE do Arduino, instale a biblioteca PubSubClient:
1. Ferramentas > Gerenciar Bibliotecas
2. Procure por "PubSubClient"
3. Instale a biblioteca PubSubClient por Nick O'Leary

### Exemplo 1: Publicando Dados do ESP32

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

// Configurações do WiFi
const char* ssid = "SuaRedeWiFi";
const char* password = "SuaSenhaWiFi";

// Configurações do MQTT
const char* mqttServer = "192.168.1.100"; // Endereço IP do seu broker
const int mqttPort = 1883;
const char* mqttUser = ""; // Se o broker requer autenticação
const char* mqttPassword = ""; // Se o broker requer autenticação
const char* mqttClientId = "ESP32Client";

// Tópicos MQTT
const char* topicTemperature = "esp32/temperature";
const char* topicHumidity = "esp32/humidity";

// Variáveis para armazenar leituras simuladas
float temperature;
float humidity;

// Objetos WiFi e MQTT
WiFiClient espClient;
PubSubClient client(espClient);

// Timestamp da última publicação
unsigned long lastPublish = 0;
const int publishInterval = 5000; // Intervalo de publicação (5 segundos)

void setup() {
  Serial.begin(115200);
  
  // Conecta ao WiFi
  setupWiFi();
  
  // Configura o servidor MQTT
  client.setServer(mqttServer, mqttPort);
  
  // Configura o callback para recepção de mensagens (não utilizado neste exemplo)
  client.setCallback(callback);
}

void loop() {
  // Verifica e mantém a conexão com o broker MQTT
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Publica a cada intervalo definido
  unsigned long now = millis();
  if (now - lastPublish > publishInterval) {
    lastPublish = now;
    
    // Simula leituras de sensores
    temperature = random(2000, 3000) / 100.0;
    humidity = random(4000, 8000) / 100.0;
    
    // Publica os dados
    publishData();
  }
}

void setupWiFi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.println("Endereço IP: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  // Este callback é chamado quando uma mensagem é recebida em tópicos inscritos
  // Não é utilizado neste exemplo, mas é necessário para a biblioteca
  Serial.print("Mensagem recebida [");
  Serial.print(topic);
  Serial.print("] ");
  
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void reconnect() {
  // Loop até reconectar
  while (!client.connected()) {
    Serial.print("Tentando conexão MQTT...");
    
    // Tenta conectar
    if (client.connect(mqttClientId, mqttUser, mqttPassword)) {
      Serial.println("conectado");
      
      // Uma vez conectado, publica uma mensagem...
      client.publish("esp32/status", "online");
      
      // ... e se inscreve em tópicos (neste exemplo não há inscrição)
      
    } else {
      Serial.print("falhou, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5 segundos");
      delay(5000);
    }
  }
}

void publishData() {
  // Converte os valores para strings
  char tempString[8];
  char humString[8];
  dtostrf(temperature, 1, 2, tempString);
  dtostrf(humidity, 1, 2, humString);
  
  // Publica a temperatura
  Serial.print("Publicando temperatura: ");
  Serial.println(tempString);
  client.publish(topicTemperature, tempString);
  
  // Publica a umidade
  Serial.print("Publicando umidade: ");
  Serial.println(humString);
  client.publish(topicHumidity, humString);
}
```

### Exemplo 2: Subscrevendo-se a um Tópico e Controlando um LED

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

// Configurações do WiFi
const char* ssid = "SuaRedeWiFi";
const char* password = "SuaSenhaWiFi";

// Configurações do MQTT
const char* mqttServer = "192.168.1.100"; // Endereço IP do seu broker
const int mqttPort = 1883;
const char* mqttUser = ""; // Se o broker requer autenticação
const char* mqttPassword = ""; // Se o broker requer autenticação
const char* mqttClientId = "ESP32Client";

// Tópicos MQTT
const char* topicLED = "esp32/led";
const char* topicStatus = "esp32/status";

// Pino do LED
const int ledPin = 2;

// Objetos WiFi e MQTT
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  
  // Configura o pino do LED
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  
  // Conecta ao WiFi
  setupWiFi();
  
  // Configura o servidor MQTT
  client.setServer(mqttServer, mqttPort);
  
  // Configura o callback para recepção de mensagens
  client.setCallback(callback);
}

void loop() {
  // Verifica e mantém a conexão com o broker MQTT
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}

void setupWiFi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.println("Endereço IP: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Mensagem recebida [");
  Serial.print(topic);
  Serial.print("] ");
  
  // Converte o payload para uma string
  char message[length + 1];
  for (int i = 0; i < length; i++) {
    message[i] = (char)payload[i];
    Serial.print(message[i]);
  }
  message[length] = '\0';
  Serial.println();
  
  // Verifica se a mensagem é para o tópico do LED
  if (String(topic) == topicLED) {
    if (String(message) == "ON") {
      digitalWrite(ledPin, HIGH);
      Serial.println("LED ligado");
      client.publish(topicStatus, "LED está ON");
    } else if (String(message) == "OFF") {
      digitalWrite(ledPin, LOW);
      Serial.println("LED desligado");
      client.publish(topicStatus, "LED está OFF");
    }
  }
}

void reconnect() {
  // Loop até reconectar
  while (!client.connected()) {
    Serial.print("Tentando conexão MQTT...");
    
    // Tenta conectar
    if (client.connect(mqttClientId, mqttUser, mqttPassword)) {
      Serial.println("conectado");
      
      // Publica uma mensagem informando que está online
      client.publish(topicStatus, "ESP32 online");
      
      // Se inscreve no tópico do LED
      client.subscribe(topicLED);
      
    } else {
      Serial.print("falhou, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5 segundos");
      delay(5000);
    }
  }
}
```

## Testando a Comunicação MQTT

Após carregar o código no ESP32, podemos testar a comunicação MQTT usando ferramentas de linha de comando ou aplicativos gráficos.

### Usando Ferramentas de Linha de Comando

#### Subscribing (Recebendo Mensagens)
```bash
mosquitto_sub -h 192.168.1.100 -t "esp32/temperature" -v
```

#### Publishing (Enviando Mensagens)
```bash
mosquitto_pub -h 192.168.1.100 -t "esp32/led" -m "ON"
```

### Usando Ferramentas Gráficas

Existem várias ferramentas GUI para MQTT, como:

- **MQTT Explorer**: [mqtt-explorer.com](http://mqtt-explorer.com/)
- **MQTT.fx**: [mqttfx.jensd.de](https://mqttfx.jensd.de/)
- **MQTTLens**: Extensão para o Google Chrome

## Exemplo 3: Projeto de Monitoramento com ESP32 e MQTT

Vamos criar um projeto que combina um sensor DHT22 com MQTT para monitorar temperatura e umidade, e também permite controlar um relé via MQTT.

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// Configurações do WiFi
const char* ssid = "SuaRedeWiFi";
const char* password = "SuaSenhaWiFi";

// Configurações do MQTT
const char* mqttServer = "192.168.1.100";
const int mqttPort = 1883;
const char* mqttUser = "";
const char* mqttPassword = "";
const char* mqttClientId = "ESP32Client";

// Tópicos MQTT
const char* topicSensor = "esp32/sensor";
const char* topicRelay = "esp32/relay";
const char* topicStatus = "esp32/status";

// Configurações do sensor DHT
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Pino do relé
const int relayPin = 16;

// Objetos WiFi e MQTT
WiFiClient espClient;
PubSubClient client(espClient);

// Timestamp da última publicação
unsigned long lastPublish = 0;
const int publishInterval = 30000; // 30 segundos

void setup() {
  Serial.begin(115200);
  
  // Inicializa o sensor DHT
  dht.begin();
  
  // Configura o pino do relé
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW);
  
  // Conecta ao WiFi
  setupWiFi();
  
  // Configura o servidor MQTT
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);
}

void loop() {
  // Verifica e mantém a conexão com o broker MQTT
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Publica a cada intervalo definido
  unsigned long now = millis();
  if (now - lastPublish > publishInterval) {
    lastPublish = now;
    publishSensorData();
  }
}

void setupWiFi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.println("Endereço IP: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Mensagem recebida [");
  Serial.print(topic);
  Serial.print("] ");
  
  // Converte o payload para uma string
  char message[length + 1];
  for (int i = 0; i < length; i++) {
    message[i] = (char)payload[i];
    Serial.print(message[i]);
  }
  message[length] = '\0';
  Serial.println();
  
  // Verifica se a mensagem é para o tópico do relé
  if (String(topic) == topicRelay) {
    if (String(message) == "ON") {
      digitalWrite(relayPin, HIGH);
      Serial.println("Relé ligado");
      client.publish(topicStatus, "Relé está ON");
    } else if (String(message) == "OFF") {
      digitalWrite(relayPin, LOW);
      Serial.println("Relé desligado");
      client.publish(topicStatus, "Relé está OFF");
    }
  }
}

void reconnect() {
  // Loop até reconectar
  while (!client.connected()) {
    Serial.print("Tentando conexão MQTT...");
    
    // Tenta conectar
    if (client.connect(mqttClientId, mqttUser, mqttPassword)) {
      Serial.println("conectado");
      
      // Publica uma mensagem informando que está online
      client.publish(topicStatus, "ESP32 online");
      
      // Se inscreve no tópico do relé
      client.subscribe(topicRelay);
      
    } else {
      Serial.print("falhou, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5 segundos");
      delay(5000);
    }
  }
}

void publishSensorData() {
  // Lê os dados do sensor DHT
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  
  // Verifica se as leituras são válidas
  if (isnan(h) || isnan(t)) {
    Serial.println("Falha ao ler do sensor DHT!");
    return;
  }
  
  // Cria um documento JSON
  StaticJsonDocument<200> doc;
  doc["device_id"] = mqttClientId;
  doc["temperature"] = t;
  doc["humidity"] = h;
  doc["timestamp"] = millis();
  
  // Serializa para JSON
  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer);
  
  // Publica a mensagem
  Serial.println("Publicando dados do sensor:");
  Serial.println(jsonBuffer);
  client.publish(topicSensor, jsonBuffer);
}
```

## MQTT com Segurança (TLS/SSL)

Para aplicações de produção, é importante usar MQTT com segurança. Isso envolve configurar o broker com certificados SSL/TLS e modificar o cliente para usar conexões seguras.

### Exemplo de Conexão Segura (Esboço)

```cpp
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

// Certificado CA do servidor (substitua pelo seu)
const char* root_ca = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIDSjCCAjKgAwIBAgIQRK+wgNajJ7qJMDmGLvhAazANBgkqhkiG9w0BAQUFADA/\n" \
"... o restante do certificado ... \n" \
"-----END CERTIFICATE-----\n";

WiFiClientSecure espClient;
PubSubClient client(espClient);

void setup() {
  // Configurar certificado CA
  espClient.setCACert(root_ca);
  
  // Configurar servidor MQTT seguro (porta 8883 é padrão para MQTT com TLS)
  client.setServer(mqttServer, 8883);
  
  // ... resto do código
}
```

## Brokers MQTT Públicos para Testes

Para testar suas aplicações sem configurar um broker local ou se você não tem um servidor em casa, existem brokers públicos:

- **test.mosquitto.org**: Broker público mantido pelos desenvolvedores do Mosquitto
- **broker.hivemq.com**: Broker público mantido por HiveMQ
- **broker.emqx.io**: Broker público mantido por EMQX

Observe que esses brokers são para testes e não devem ser usados em produção, pois qualquer pessoa pode se inscrever e publicar nos tópicos.

## Próximos Passos

Na próxima aula, integraremos o ESP32 com o Node-RED, uma plataforma de fluxo visual que facilita a conexão de dispositivos de hardware, APIs e serviços online para criar aplicações IoT completas.

**Desafio:** Implemente um sistema que usa MQTT para controlar múltiplos dispositivos - por exemplo, diferentes LEDs que podem ser controlados individualmente por tópicos como `esp32/led/1`, `esp32/led/2`, etc.
