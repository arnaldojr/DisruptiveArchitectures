# Integração do ESP32 com Node-RED

Nesta aula, exploraremos como integrar projetos ESP32 com o Node-RED, uma ferramenta poderosa para criar aplicações IoT de forma visual e com pouca programação.

## O que é o Node-RED?

Node-RED é uma plataforma de desenvolvimento baseada em fluxos que permite conectar dispositivos de hardware, APIs e serviços online de maneira visual. Desenvolvido originalmente pela IBM, é uma ferramenta de código aberto ideal para prototipagem rápida de aplicações IoT.

### Principais características:

- **Interface visual**: Programação baseada em fluxos com editor web
- **Nós pré-construídos**: Componentes prontos para comunicação, processamento e visualização
- **Extensibilidade**: Ecossistema de mais de 3.000 pacotes adicionais
- **Leve**: Pode ser executado em dispositivos como Raspberry Pi
- **Multiplataforma**: Disponível para Windows, macOS e Linux

## Instalação do Node-RED

### No Windows:
1. Instale o Node.js: [nodejs.org](https://nodejs.org/)
2. Abra o prompt de comando como administrador e execute:
   ```
   npm install -g --unsafe-perm node-red
   ```
3. Para iniciar o Node-RED, execute:
   ```
   node-red
   ```

### No macOS:
1. Instale o Node.js: [nodejs.org](https://nodejs.org/)
2. Abra o Terminal e execute:
   ```
   sudo npm install -g --unsafe-perm node-red
   ```
3. Para iniciar o Node-RED, execute:
   ```
   node-red
   ```

### No Linux (Ubuntu/Debian):
1. Instale o Node.js:
   ```
   curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
2. Instale o Node-RED:
   ```
   sudo npm install -g --unsafe-perm node-red
   ```
3. Para iniciar o Node-RED, execute:
   ```
   node-red
   ```

### No Raspberry Pi:
O Raspberry Pi tem um script de instalação específico:
```
bash <(curl -sL https://raw.githubusercontent.com/node-red/linux-installers/master/deb/update-nodejs-and-nodered)
```

## Acessando o Node-RED

Após iniciar o Node-RED, acesse a interface web através do navegador:
```
http://localhost:1880
```

## Instalação de Nós Adicionais

Para trabalhar com MQTT e dashboards, precisamos instalar alguns nós adicionais:

1. No Node-RED, clique no menu (superior direito) > Manage palette
2. Na aba "Install", pesquise e instale:
   - `node-red-dashboard` (para criar interfaces de usuário)
   - `node-red-contrib-ui-led` (para LEDs virtuais)
   - `node-red-contrib-mqtt-broker` (broker MQTT local opcional)

Alternativamente, você pode instalar via linha de comando:
```
cd ~/.node-red
npm install node-red-dashboard node-red-contrib-ui-led node-red-contrib-mqtt-broker
```

## Integração ESP32 com Node-RED via MQTT

Usaremos o protocolo MQTT para conectar o ESP32 ao Node-RED, aproveitando o que aprendemos na aula anterior.

### 1. Configurando um Fluxo Básico com MQTT

Vamos criar um fluxo simples que recebe dados de um ESP32 e os exibe em um dashboard:

1. **Adicione um nó MQTT Subscriber**:
   - Arraste um nó `mqtt in` do painel esquerdo para o editor
   - Dê um duplo clique para configurá-lo
   - Configure um novo broker MQTT clicando no ícone de lápis
   - Informe o endereço do broker (por exemplo: `localhost` ou o IP do seu broker)
   - Configure o tópico como `esp32/sensor/data`
   - Clique em "Done"

2. **Adicione um nó JSON**:
   - Arraste um nó `json` para o editor
   - Conecte-o ao nó MQTT
   - Configure-o para converter a string JSON em um objeto JavaScript

3. **Adicione nós de debug**:
   - Arraste um nó `debug` para o editor
   - Conecte-o ao nó JSON
   - Configure-o para mostrar a mensagem completa

4. **Implante o fluxo**:
   - Clique no botão "Deploy" no canto superior direito

![Fluxo Básico de MQTT](https://raw.githubusercontent.com/node-red/node-red.github.io/master/images/node-red-screenshot.png)

### 2. Criando um Dashboard para o ESP32

Vamos criar um dashboard para visualizar os dados do ESP32 e controlar um LED:

1. **Configure o Dashboard**:
   - No painel direito, selecione a aba Dashboard
   - Crie uma nova aba chamada "ESP32 Monitor"
   - Dentro desta aba, crie dois grupos: "Sensores" e "Controles"

2. **Adicione gráficos para temperatura e umidade**:
   - Arraste um nó `chart` para o editor
   - Conecte-o após o nó JSON
   - Configure-o para o grupo "Sensores"
   - Defina o caminho do valor como `msg.payload.temperature`
   - Configure o título, eixos e aparência

3. **Repita para umidade**:
   - Adicione outro nó `chart`
   - Configure-o para exibir `msg.payload.humidity`

4. **Adicione um switch para controlar o LED**:
   - Arraste um nó `switch` para o editor
   - Configure-o para o grupo "Controles"
   - Configure as opções:
     - Tipo: Switch
     - Rótulo: "LED Control"
     - On Payload: "ON"
     - Off Payload: "OFF"

5. **Adicione um nó MQTT Publisher**:
   - Arraste um nó `mqtt out` para o editor
   - Conecte-o ao nó switch
   - Configure-o para publicar no tópico `esp32/control/led`

6. **Implante o fluxo atualizado**:
   - Clique em "Deploy"

7. **Acesse o Dashboard**:
   - Clique no ícone de inicialização do dashboard no painel direito
   - Ou acesse: `http://localhost:1880/ui`

## Exemplo de Código para o ESP32

Este é o código que o ESP32 deve executar para comunicar-se com o Node-RED via MQTT, baseado no que aprendemos na aula anterior:

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// Configurações do WiFi
const char* ssid = "SuaRedeWiFi";
const char* password = "SuaSenhaWiFi";

// Configurações do MQTT
const char* mqttServer = "SEU_IP_DO_BROKER"; // Endereço do broker MQTT
const int mqttPort = 1883;
const char* mqttUser = "";
const char* mqttPassword = "";
const char* mqttClientId = "ESP32Client";

// Tópicos MQTT
const char* topicData = "esp32/sensor/data";    // Para enviar dados dos sensores
const char* topicLed = "esp32/control/led";     // Para controlar o LED
const char* topicStatus = "esp32/status";       // Status do dispositivo

// Configuração dos pinos
const int ledPin = 2;   // LED interno do ESP32 ou LED externo
#define DHTPIN 4        // Pino do sensor DHT
#define DHTTYPE DHT22   // Tipo do sensor (DHT22 ou DHT11)

// Instanciar o sensor DHT
DHT dht(DHTPIN, DHTTYPE);

// Objetos WiFi e MQTT
WiFiClient espClient;
PubSubClient client(espClient);

// Variáveis para controle de tempo
unsigned long lastMsg = 0;
const int publishInterval = 5000;  // Intervalo de 5 segundos

void setup() {
  Serial.begin(115200);
  
  // Configurar o pino do LED
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  
  // Inicializar o sensor DHT
  dht.begin();
  
  // Conectar ao WiFi
  setupWifi();
  
  // Configurar o servidor MQTT
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);
}

void loop() {
  // Verificar conexão com MQTT e reconectar se necessário
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Publicar dados periodicamente
  unsigned long now = millis();
  if (now - lastMsg > publishInterval) {
    lastMsg = now;
    publishSensorData();
  }
}

void setupWifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando-se à rede ");
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
  
  // Criar uma string a partir do payload
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);
  
  // Verificar o tópico e agir
  if (String(topic) == topicLed) {
    if (message == "ON") {
      digitalWrite(ledPin, HIGH);
      Serial.println("LED LIGADO");
      client.publish(topicStatus, "LED ligado");
    } else if (message == "OFF") {
      digitalWrite(ledPin, LOW);
      Serial.println("LED DESLIGADO");
      client.publish(topicStatus, "LED está desligado");
    }
  }
}

void reconnect() {
  // Loop até reconectar
  while (!client.connected()) {
    Serial.print("Tentando conexão MQTT...");
    
    // Tentar conectar
    if (client.connect(mqttClientId, mqttUser, mqttPassword)) {
      Serial.println("conectado");
      
      // Publicar mensagem informando que está online
      client.publish(topicStatus, "ESP32 conectado");
      
      // Inscrever no tópico de controle do LED
      client.subscribe(topicLed);
    } else {
      Serial.print("falhou, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5 segundos");
      delay(5000);
    }
  }
}

void publishSensorData() {
  // Ler temperatura e umidade
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  // Verificar se as leituras são válidas
  if (isnan(h) || isnan(t)) {
    Serial.println("Falha ao ler do sensor DHT!");
    return;
  }

  // Criar um objeto JSON
  StaticJsonDocument<200> doc;
  doc["device"] = mqttClientId;
  doc["temperature"] = t;
  doc["humidity"] = h;
  
  // Adicionar status do LED
  doc["led"] = digitalRead(ledPin) ? "ON" : "OFF";
  
  // Serializar para JSON
  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);
  
  // Publicar no tópico
  Serial.print("Publicando: ");
  Serial.println(jsonBuffer);
  client.publish(topicData, jsonBuffer);
}
```

## Fluxo Completo no Node-RED (exemplo)

Você pode importar este fluxo completo para o Node-RED. Vá para menu > Import > Clipboard e cole o seguinte JSON:

```json
[
    {
        "id": "e36406da.8d2938",
        "type": "tab",
        "label": "ESP32 Dashboard",
        "disabled": false,
        "info": ""
    },
    {
        "id": "8ddfcd77.4e175",
        "type": "mqtt in",
        "z": "e36406da.8d2938",
        "name": "ESP32 Sensor Data",
        "topic": "esp32/sensor/data",
        "qos": "0",
        "datatype": "auto",
        "broker": "35b83581.2d44ca",
        "x": 140,
        "y": 180,
        "wires": [
            [
                "523a4560.84ed3c",
                "bcc7c29c.45c03"
            ]
        ]
    },
    {
        "id": "523a4560.84ed3c",
        "type": "json",
        "z": "e36406da.8d2938",
        "name": "",
        "property": "payload",
        "action": "obj",
        "pretty": false,
        "x": 310,
        "y": 180,
        "wires": [
            [
                "5c5950e3.a8a13",
                "5a29a2ad.bbebfc",
                "6ca8dcc6.c0dd64"
            ]
        ]
    },
    {
        "id": "bcc7c29c.45c03",
        "type": "debug",
        "z": "e36406da.8d2938",
        "name": "Raw MQTT Data",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "x": 350,
        "y": 120,
        "wires": []
    },
    {
        "id": "5c5950e3.a8a13",
        "type": "debug",
        "z": "e36406da.8d2938",
        "name": "Parsed JSON",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "x": 490,
        "y": 120,
        "wires": []
    },
    {
        "id": "5a29a2ad.bbebfc",
        "type": "ui_chart",
        "z": "e36406da.8d2938",
        "name": "Temperature",
        "group": "b33ad5c5.80d188",
        "order": 1,
        "width": "0",
        "height": "0",
        "label": "Temperature (°C)",
        "chartType": "line",
        "legend": "false",
        "xformat": "HH:mm:ss",
        "interpolate": "linear",
        "nodata": "",
        "dot": false,
        "ymin": "0",
        "ymax": "50",
        "removeOlder": 1,
        "removeOlderPoints": "",
        "removeOlderUnit": "3600",
        "cutout": 0,
        "useOneColor": false,
        "useUTC": false,
        "colors": [
            "#1f77b4",
            "#aec7e8",
            "#ff7f0e",
            "#2ca02c",
            "#98df8a",
            "#d62728",
            "#ff9896",
            "#9467bd",
            "#c5b0d5"
        ],
        "outputs": 1,
        "x": 510,
        "y": 180,
        "wires": [
            []
        ]
    },
    {
        "id": "6ca8dcc6.c0dd64",
        "type": "ui_chart",
        "z": "e36406da.8d2938",
        "name": "Humidity",
        "group": "b33ad5c5.80d188",
        "order": 2,
        "width": "0",
        "height": "0",
        "label": "Humidity (%)",
        "chartType": "line",
        "legend": "false",
        "xformat": "HH:mm:ss",
        "interpolate": "linear",
        "nodata": "",
        "dot": false,
        "ymin": "0",
        "ymax": "100",
        "removeOlder": 1,
        "removeOlderPoints": "",
        "removeOlderUnit": "3600",
        "cutout": 0,
        "useOneColor": false,
        "useUTC": false,
        "colors": [
            "#1f77b4",
            "#aec7e8",
            "#ff7f0e",
            "#2ca02c",
            "#98df8a",
            "#d62728",
            "#ff9896",
            "#9467bd",
            "#c5b0d5"
        ],
        "outputs": 1,
        "x": 500,
        "y": 240,
        "wires": [
            []
        ]
    },
    {
        "id": "7aeebb91.789c94",
        "type": "ui_switch",
        "z": "e36406da.8d2938",
        "name": "LED Control",
        "label": "LED Control",
        "tooltip": "",
        "group": "71f6d4b5.4c0cbc",
        "order": 1,
        "width": 0,
        "height": 0,
        "passthru": true,
        "decouple": "false",
        "topic": "",
        "style": "",
        "onvalue": "ON",
        "onvalueType": "str",
        "onicon": "",
        "oncolor": "",
        "offvalue": "OFF",
        "offvalueType": "str",
        "officon": "",
        "offcolor": "",
        "x": 130,
        "y": 320,
        "wires": [
            [
                "92e36c6f.20c87"
            ]
        ]
    },
    {
        "id": "92e36c6f.20c87",
        "type": "mqtt out",
        "z": "e36406da.8d2938",
        "name": "LED Control",
        "topic": "esp32/control/led",
        "qos": "",
        "retain": "",
        "broker": "35b83581.2d44ca",
        "x": 330,
        "y": 320,
        "wires": []
    },
    {
        "id": "35b83581.2d44ca",
        "type": "mqtt-broker",
        "name": "Local Broker",
        "broker": "localhost",
        "port": "1883",
        "clientid": "",
        "usetls": false,
        "compatmode": false,
        "keepalive": "60",
        "cleansession": true,
        "birthTopic": "",
        "birthQos": "0",
        "birthPayload": "",
        "closeTopic": "",
        "closeQos": "0",
        "closePayload": "",
        "willTopic": "",
        "willQos": "0",
        "willPayload": ""
    },
    {
        "id": "b33ad5c5.80d188",
        "type": "ui_group",
        "name": "Sensores",
        "tab": "a2e1584c.deb448",
        "order": 1,
        "disp": true,
        "width": "6",
        "collapse": false
    },
    {
        "id": "71f6d4b5.4c0cbc",
        "type": "ui_group",
        "name": "Controles",
        "tab": "a2e1584c.deb448",
        "order": 2,
        "disp": true,
        "width": "6",
        "collapse": false
    },
    {
        "id": "a2e1584c.deb448",
        "type": "ui_tab",
        "name": "ESP32 Monitor",
        "icon": "dashboard",
        "disabled": false,
        "hidden": false
    }
]
```

## Aplicações Avançadas do Node-RED com ESP32

### 1. Armazenamento de Dados Históricos

O Node-RED pode armazenar dados históricos do seu ESP32:

1. Use o nó `node-red-contrib-influxdb` para armazenar dados em um banco InfluxDB
2. Use os nós `file` para gravar dados em arquivos CSV
3. Integre com outros bancos de dados como MySQL ou MongoDB

### 2. Notificações e Alertas

Configure alertas baseados nos dados do ESP32:

1. Envio de e-mails quando valores ultrapassarem limites
2. Notificações push para smartphones
3. Mensagens SMS ou integração com serviços de mensagens

### 3. Integrações com Serviços de Nuvem

Node-RED facilita a integração do ESP32 com serviços de nuvem:

1. AWS IoT
2. Google Cloud IoT
3. Microsoft Azure IoT
4. ThingSpeak, Adafruit IO ou outras plataformas IoT

### 4. Controle por Voz

Integre seu ESP32 com assistentes de voz:

1. Use nós Node-RED para Google Assistant
2. Integração com Amazon Alexa
3. Controle por voz via IFTTT

## Exemplo: Dashboard Completo com Node-RED

Um dashboard completo para monitoramento do ESP32 pode incluir:

1. **Gráficos em tempo real**:
   - Temperatura e umidade
   - Níveis de bateria
   - Outros sensores

2. **Controles**:
   - Botões para ligar/desligar LEDs
   - Sliders para controlar motores ou servos
   - Campos de texto para enviar mensagens

3. **Indicadores de Status**:
   - LEDs virtuais para mostrar status de conexão
   - Medidores para visualização de valores
   - Timestamp da última atualização

4. **Funcionalidades Avançadas**:
   - Programação de tarefas
   - Regras condicionais
   - Histórico de eventos

## Próximos Passos

Na próxima aula, exploraremos técnicas de gerenciamento de energia para o ESP32, permitindo que seus projetos IoT funcionem com baterias por longos períodos.

**Desafio:** Expanda o dashboard Node-RED para incluir um painel de controle completo para seu ESP32, com gráficos históricos, controles para vários pinos e alertas baseados em limites de temperatura ou umidade.
