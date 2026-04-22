## MQTT com ESP32

## Visão geral da aula

Já sabemos fazer o ESP32 atuar como **servidor e clienteweb**, servindo páginas, expondo e requisitando dados por HTTP. Nesta aula, a proposta muda novamente de direção: em vez de trabalhar com **requisições HTTP** e **rotas**, o ESP32 passará a atuar com o protocolo **MQTT**, trocando mensagens com um **broker** por meio de **tópicos**.

O objetivo desta aula é apresentar o uso da biblioteca `PubSubClient`, mostrando como o ESP32 pode:

- conectar-se a uma rede Wi-Fi;
- conectar-se a um broker MQTT;
- publicar mensagens em um tópico;
- assinar tópicos para receber comandos;
- reagir a mensagens recebidas, controlando hardware.

> **Como o ESP32 conversa com outros sistemas usando MQTT.**

## O que é MQTT

MQTT é um protocolo de mensagens muito utilizado em IoT. Ao contrário do modelo HTTP, em que um cliente faz uma requisição para um servidor, no MQTT a comunicação acontece por meio de um **broker** e de **tópicos**.

A lógica básica é esta:

- um dispositivo pode **publicar** uma mensagem em um tópico;
- outro dispositivo pode **assinar** esse tópico;
- o broker recebe a mensagem e a entrega para quem estiver inscrito.

Em uma visão prática, pense assim:

- o **broker** é o intermediário;
- o **tópico** é o canal de comunicação;
- **publicar** é enviar uma mensagem;
- **assinar** é ficar ouvindo um canal.

---

## MQTT x HTTP

É importante comparar com o que já vimos anteriormente.

### No HTTP

- existe uma URL;
- um cliente faz uma requisição;
- um servidor responde;
- a comunicação normalmente acontece no formato requisição/resposta.

### No MQTT

- existe um broker;
- os clientes se conectam ao broker;
- as mensagens circulam por tópicos;
- a comunicação é orientada a **publicação** e **assinatura**.

Na prática, isso faz do MQTT uma excelente escolha quando queremos:

- integrar vários dispositivos;
- desacoplar quem envia de quem recebe;
- trabalhar com telemetria;
- enviar comandos para dispositivos IoT.


## Componentes importantes desta aula

### 1. Broker MQTT

O broker é o elemento central do sistema. É ele quem recebe as mensagens publicadas e distribui essas mensagens aos clientes inscritos nos tópicos correspondentes.

### 2. Cliente MQTT

O ESP32 será um cliente MQTT. Ele irá:

- conectar-se ao broker;
- publicar mensagens;
- assinar tópicos;
- receber comandos.

### 3. Tópicos

Os tópicos organizam a comunicação. Nesta aula, vamos trabalhar com os seguintes:

- `fiap/esp32/status`
- `fiap/esp32/comandos`
- `fiap/esp32/telemetria`

Esses nomes não são obrigatórios. São apenas uma convenção para manter a organização da aplicação.


## Biblioteca utilizada

A biblioteca `PubSubClient`, é responsável por:

- conectar o ESP32 ao broker;
- publicar mensagens;
- assinar tópicos;
- registrar a função de callback que será chamada quando uma mensagem chegar.

---

## Preparando o projeto

Clone o repositório do projeto para acessar o código-fonte do servidor web básico `http-client`:

```bash
git clone https://github.com/arnaldojr/esp32-wokwi
cd esp32-wokwi/mqtt-esp
code .
```

Agora, abra o arquivo `mqtt-esp.ino`.

---

## Exemplo 1 — ESP32 como cliente MQTT

Neste primeiro exemplo, faremos com que o ESP32:

1. conecte-se ao Wi-Fi;
2. conecte-se ao broker MQTT;
3. assine um tópico de comandos;
4. publique uma mensagem inicial de status;
5. ligue ou desligue LEDs de acordo com mensagens recebidas;
6. publique periodicamente uma mensagem de telemetria simples.

---

## Código-base

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// =========================
// CONFIGURACAO DO WIFI
// =========================
#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""
#define WIFI_CHANNEL 6


// =========================
// CONFIGURACAO DO BROKER MQTT
// =========================
const char* MQTT_BROKER = "broker.hivemq.com"; // usando o broker hivemq, que nao exige autenticacao
const int MQTT_PORT = 1883;
const char* MQTT_CLIENT_ID = "esp32-fiap-aula-mqtt";

const char* TOPIC_STATUS = "fiap/esp32/status";
const char* TOPIC_COMMANDS = "fiap/esp32/comandos";
const char* TOPIC_TELEMETRY = "fiap/esp32/telemetria";

// =========================
// HARDWARE
// =========================
const int LED1 = 26;
const int LED2 = 27;

bool led1State = false;
bool led2State = false;


// =========================
// CONTROLE DE TEMPO
// =========================
unsigned long lastPublishTime = 0;
const unsigned long PUBLISH_INTERVAL = 5000;


// =========================
// FUNCOES AUXILIARES
// =========================
String boolToText(bool value) {
  return value ? "ON" : "OFF";
}

void updateLeds() {
  digitalWrite(LED1, led1State);
  digitalWrite(LED2, led2State);
}

void processCommand(const String& command) {
  if (command == "led1_on") {
    led1State = true;
  } else if (command == "led1_off") {
    led1State = false;
  } else if (command == "led2_on") {
    led2State = true;
  } else if (command == "led2_off") {
    led2State = false;
  } else if (command == "all_on") {
    led1State = true;
    led2State = true;
  } else if (command == "all_off") {
    led1State = false;
    led2State = false;
  } else {
    Serial.println("Comando desconhecido.");
    return;
  }

  updateLeds();
}

// =========================
// FUNÇOES DE REDE
// =========================

void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD, WIFI_CHANNEL);

  Serial.print("Conectando ao WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(100);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void ensureWiFiConnected() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado. Tentando reconectar...");
    connectWiFi();
  }
}

void connectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Conectando ao broker MQTT...");

    if (mqttClient.connect(MQTT_CLIENT_ID)) {
      Serial.println(" conectado!");

      mqttClient.subscribe(TOPIC_COMMANDS);
      Serial.print("Inscrito no topico: ");
      Serial.println(TOPIC_COMMANDS);

      publishTelemetry();
    } else {
      Serial.print(" falhou. Codigo = ");
      Serial.println(mqttClient.state());
      Serial.println("Tentando novamente em 2 segundos...");
      delay(2000);  // por enquanto podemos usar esse delay
    }
  }
}

void ensureMQTTConnected() {
  if (!mqttClient.connected()) {
    connectMQTT();
  }
}


// =========================
// MQTT - PUBLICA 
// =========================
void publishTelemetry() {
  StaticJsonDocument<128> doc;
  doc["led1"] = led1State;
  doc["led2"] = led2State;

  char buffer[128];
  serializeJson(doc, buffer);

  mqttClient.publish(TOPIC_TELEMETRY, buffer);

  Serial.print("Publicado em ");
  Serial.print(TOPIC_TELEMETRY);
  Serial.print(": ");
  Serial.println(buffer);
}

// =========================
// MQTT - CALLBACK DE MENSAGENS RECEBIDAS 
// =========================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Mensagem recebida no topico: ");
  Serial.println(topic);

  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print("Conteudo bruto da mensagem: ");
  Serial.println(message);

  if (String(topic) == TOPIC_COMMANDS) {
    StaticJsonDocument<128> doc;
    DeserializationError error = deserializeJson(doc, message);

    if (error) {
      Serial.print("Erro ao interpretar JSON: ");
      Serial.println(error.c_str());
      return;
    }

    if (!doc.containsKey("command")) {
      Serial.println("Campo 'command' nao encontrado no JSON.");
      return;
    }

    String command = doc["command"].as<String>();

    Serial.print("Comando interpretado: ");
    Serial.println(command);

    processCommand(command);
  }
}

// =========================
// FUNÇOES PRINCIPAIS
// =========================

void setup() {
  Serial.begin(115200);

  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);
  updateLeds();

  connectWiFi();

  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);

}

void loop() {

  ensureWiFiConnected();
  ensureMQTTConnected();
  mqttClient.loop();

  unsigned long now = millis();
  if (now - lastPublishTime >= PUBLISH_INTERVAL) {
    lastPublishTime = now;
    publishTelemetry();
  }

}
```



## Desafio 1

Crie um novo tópico chamado:

```text
fiap/esp32/heartbeat
```

Faça o ESP32 publicar periodicamente nesse tópico uma mensagem indicando que ele continua ativo.

Exemplo:

```text
alive
```

---

## Desafio 2

Modifique a aplicação para que o ESP32 publique também o tempo de execução do sistema em milissegundos.

Sugestão de tópico:

```text
fiap/esp32/uptime
```

---

## Desafio 3

Adicione um sensor de temperatura ao circuito e publique o valor em um tópico específico.

Sugestão de tópico:

```text
fiap/esp32/temperatura
```

---

## Desafio 4

Em vez de publicar apenas texto simples, publique a telemetria em formato JSON com mais informações.

Exemplo:

```json
{
  "led1": "ON",
  "led2": "OFF",
  "uptime": 12345
}
```

---

## Desafio 5

Crie novos comandos MQTT para controlar os LEDs com mensagens mais estruturadas.

Por exemplo:

- `led1_toggle`
- `led2_toggle`
- `status`

Quando o comando `status` for recebido, o ESP32 deve publicar imediatamente uma mensagem no tópico `fiap/esp32/status`.

---




