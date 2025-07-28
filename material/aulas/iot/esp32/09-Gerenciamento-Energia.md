# Gerenciamento de Energia com ESP32

Nesta aula, vamos explorar técnicas de gerenciamento de energia para o ESP32, fundamentais para projetos IoT alimentados por bateria. O ESP32 possui diversos modos de economia de energia que podem estender significativamente a vida útil da bateria.

## Importância do Gerenciamento de Energia

Em muitas aplicações IoT, os dispositivos:
- São instalados em locais remotos
- Funcionam com baterias ou energia solar
- Precisam operar por meses ou anos sem manutenção

Um ESP32 funcionando continuamente consome aproximadamente:
- 160-260mA durante transmissão WiFi
- 100-150mA durante processamento intenso
- 20-30mA em modo ativo leve

Com uma bateria de 1000mAh, isso significa apenas algumas horas de operação. Com gerenciamento de energia eficiente, podemos estender isso para semanas, meses ou até anos.

## Modos de Economia de Energia do ESP32

O ESP32 possui vários modos de operação com diferentes níveis de consumo:

| Modo | Consumo típico | CPU | WiFi/BT | RTC | Memória |
|------|---------------|-----|--------|-----|---------|
| Ativo | 160-260mA | Ativo | Ativo | Ativo | Todas ativas |
| Modem Sleep | 20-30mA | Ativo | Desligado | Ativo | Todas ativas |
| Light Sleep | 0.8mA | Pausado | Desligado | Ativo | Preservada |
| Deep Sleep | 10µA | Desligado | Desligado | Ativo | RTC retida |
| Hibernação | 5µA | Desligado | Desligado | Timer apenas | Nada |

## 1. Deep Sleep (Sono Profundo)

O Deep Sleep é o modo mais utilizado para economizar energia em projetos IoT. O ESP32 desliga a maioria dos sistemas, mantendo apenas o timer RTC para acordar o dispositivo após um tempo determinado.

### Exemplo Básico de Deep Sleep

```cpp
#define uS_TO_S_FACTOR 1000000  // Fator de conversão de micro segundos para segundos
#define TIME_TO_SLEEP  60       // Tempo de sleep em segundos

void setup() {
  Serial.begin(115200);
  
  // Configura o timer para acordar
  esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);
  
  Serial.println("ESP32 entrará em deep sleep por " + String(TIME_TO_SLEEP) + " segundos");
  Serial.flush(); 
  
  // Entra em deep sleep
  esp_deep_sleep_start();
}

void loop() {
  // Nunca será executado no deep sleep
}
```

### Obtendo a Causa do Despertar

```cpp
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Verifica a causa do despertar
  esp_sleep_wakeup_cause_t wakeup_reason;
  wakeup_reason = esp_sleep_get_wakeup_cause();

  switch(wakeup_reason) {
    case ESP_SLEEP_WAKEUP_EXT0 : 
      Serial.println("Despertar causado por sinal externo (RTC_IO)"); 
      break;
    case ESP_SLEEP_WAKEUP_EXT1 : 
      Serial.println("Despertar causado por sinal externo (RTC_CNTL)"); 
      break;
    case ESP_SLEEP_WAKEUP_TIMER : 
      Serial.println("Despertar causado pelo timer"); 
      break;
    case ESP_SLEEP_WAKEUP_TOUCHPAD : 
      Serial.println("Despertar causado por touchpad"); 
      break;
    case ESP_SLEEP_WAKEUP_ULP : 
      Serial.println("Despertar causado pelo programa ULP"); 
      break;
    default : 
      Serial.println("Despertar não causado por deep sleep"); 
      break;
  }
  
  // Configura deep sleep novamente
  esp_sleep_enable_timer_wakeup(60 * uS_TO_S_FACTOR);
  
  // Executa a lógica do programa aqui
  // ...
  
  Serial.println("Voltando ao deep sleep");
  esp_deep_sleep_start();
}

void loop() {
  // Nunca será executado
}
```

## 2. Despertar por Pino Externo

O ESP32 pode acordar do deep sleep quando um pino específico muda de estado.

```cpp
// Pino RTC GPIO usado para despertar (apenas os pinos RTC podem ser usados)
#define WAKEUP_PIN GPIO_NUM_33

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Configura despertar por pino externo
  esp_sleep_enable_ext0_wakeup(WAKEUP_PIN, 1); // 1 = HIGH, 0 = LOW
  
  // Também configura timer como backup
  esp_sleep_enable_timer_wakeup(3600 * uS_TO_S_FACTOR); // 1 hora
  
  Serial.println("ESP32 configurado para despertar com pino HIGH ou após 1 hora");
  Serial.flush();
  
  esp_deep_sleep_start();
}

void loop() {
  // Nunca será executado
}
```

## 3. Despertar por Touchpad

O ESP32 pode acordar quando um sensor touch capacitivo é tocado.

```cpp
#define TOUCH_THRESHOLD 40

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Configura despertar por touchpad (pino 4 = T0)
  touchSleepWakeUpEnable(T0, TOUCH_THRESHOLD);
  
  Serial.println("ESP32 entrará em deep sleep, toque no pino T0 para acordar");
  Serial.flush();
  
  esp_deep_sleep_start();
}

void loop() {
  // Nunca será executado
}
```

## 4. Light Sleep (Sono Leve)

No Light Sleep, a CPU é pausada, mas a memória é preservada. É útil quando você precisa despertar rapidamente.

```cpp
void setup() {
  Serial.begin(115200);
}

void loop() {
  // Executa alguma tarefa
  Serial.println("Executando tarefa...");
  
  // Aguarda na serial
  Serial.flush();
  
  // Configura light sleep
  esp_sleep_enable_timer_wakeup(5 * 1000000); // 5 segundos
  
  Serial.println("Entrando em light sleep");
  Serial.flush();
  
  // Entra em light sleep
  esp_light_sleep_start();
  
  // Código continua daqui quando o dispositivo acorda
  Serial.println("ESP32 acordou do light sleep");
}
```

## 5. Modo Modem Sleep

No Modem Sleep, o processador continua funcionando, mas o WiFi e o Bluetooth são desligados.

```cpp
#include <WiFi.h>

const char* ssid     = "SuaRedeWiFi";
const char* password = "SuaSenhaWiFi";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi conectado");
}

void loop() {
  // Desliga o WiFi para economizar energia
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  Serial.println("WiFi desligado");
  
  // Executa tarefas locais que não precisam de WiFi
  delay(10000);
  
  // Reativa o WiFi quando necessário
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi reconectado");
  
  // Executa tarefas que precisam de conexão
  delay(5000);
}
```

## 6. Sensores de Baixo Consumo

Para projetos de energia ultra baixa, considere usar sensores que consomem pouca energia:

1. **Sensores Digitais de Baixo Consumo**:
   - BME280 (temperatura, umidade, pressão): 3.6µA em standby
   - DS18B20 (temperatura): 1µA em standby
   - PIR Motion (movimento): ~10µA em standby

2. **Reduzindo Consumo de Sensores Analógicos**:
   - Ligue os sensores analógicos apenas quando necessário
   - Use pinos GPIO para controlar a alimentação dos sensores

```cpp
#define SENSOR_POWER_PIN 13
#define SENSOR_INPUT_PIN 34

void setup() {
  Serial.begin(115200);
  
  // Configura o pino de alimentação do sensor
  pinMode(SENSOR_POWER_PIN, OUTPUT);
  
  // Configura o pino de leitura
  pinMode(SENSOR_INPUT_PIN, INPUT);
}

void loop() {
  // Liga o sensor
  digitalWrite(SENSOR_POWER_PIN, HIGH);
  
  // Pequeno delay para estabilização do sensor
  delay(10);
  
  // Lê o valor
  int sensorValue = analogRead(SENSOR_INPUT_PIN);
  
  // Desliga o sensor para economizar energia
  digitalWrite(SENSOR_POWER_PIN, LOW);
  
  Serial.print("Valor do sensor: ");
  Serial.println(sensorValue);
  
  // Entra em deep sleep
  esp_sleep_enable_timer_wakeup(60 * 1000000); // 60 segundos
  esp_deep_sleep_start();
}
```

## 7. Projeto: Estação Meteorológica de Baixo Consumo

Este projeto combina várias técnicas de economia de energia:

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_BME280.h>
#include <ArduinoJson.h>

// Configurações
const char* ssid = "SuaRedeWiFi";
const char* password = "SuaSenhaWiFi";
const char* mqttServer = "seuservidormqtt.com";
const int mqttPort = 1883;
const char* mqttUser = "seu_usuario";
const char* mqttPassword = "sua_senha";
const char* mqttTopic = "esp32/clima";

// Pinos
#define I2C_SDA 21
#define I2C_SCL 22
#define BATT_ADC_PIN 35

// Tempo entre leituras (15 minutos)
#define SLEEP_TIME_SECONDS 900

// Objetos
Adafruit_BME280 bme;
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Função para leitura da bateria
float getBatteryVoltage() {
  // Lê o valor (ajuste os valores conforme seu divisor de tensão)
  float adc = analogRead(BATT_ADC_PIN);
  float voltage = adc / 4095.0 * 3.3 * 2.0; // Assumindo um divisor de tensão de 1:1
  return voltage;
}

// Conecta ao WiFi
void connectWiFi() {
  WiFi.begin(ssid, password);
  
  // Timeout de 20 segundos
  int timeout = 20;
  while (WiFi.status() != WL_CONNECTED && timeout > 0) {
    delay(1000);
    Serial.print(".");
    timeout--;
  }
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Falha na conexão WiFi. Entrando em deep sleep.");
    esp_deep_sleep_start();
    return;
  }
  
  Serial.println("WiFi conectado");
}

// Conecta ao broker MQTT
bool connectMQTT() {
  mqttClient.setServer(mqttServer, mqttPort);
  
  Serial.println("Conectando ao MQTT...");
  if (mqttClient.connect("ESP32WeatherStation", mqttUser, mqttPassword)) {
    Serial.println("Conectado ao MQTT");
    return true;
  } else {
    Serial.print("Falha na conexão MQTT, rc=");
    Serial.println(mqttClient.state());
    return false;
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("Estação Meteorológica de Baixo Consumo");
  
  // Inicializa I2C
  Wire.begin(I2C_SDA, I2C_SCL);
  
  // Inicializa o sensor
  if (!bme.begin(0x76)) {
    Serial.println("Não foi possível encontrar o sensor BME280!");
    esp_deep_sleep_start();
  }
  
  // Lê dados do sensor
  float temperature = bme.readTemperature();
  float humidity = bme.readHumidity();
  float pressure = bme.readPressure() / 100.0F; // hPa
  float voltage = getBatteryVoltage();
  
  Serial.printf("Temperatura: %.2f°C, Umidade: %.2f%%, Pressão: %.2fhPa, Bateria: %.2fV\n", 
                temperature, humidity, pressure, voltage);
  
  // Conecta ao WiFi
  connectWiFi();
  
  // Conecta ao MQTT
  if (connectMQTT()) {
    // Cria o JSON com os dados
    StaticJsonDocument<200> doc;
    doc["device"] = "ESP32_Weather";
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["pressure"] = pressure;
    doc["battery"] = voltage;
    
    // Serializa o JSON
    char buffer[256];
    serializeJson(doc, buffer);
    
    // Publica no MQTT
    if (mqttClient.publish(mqttTopic, buffer)) {
      Serial.println("Dados publicados com sucesso");
    } else {
      Serial.println("Falha ao publicar dados");
    }
    
    // Aguarda finalização do envio
    mqttClient.loop();
    delay(100);
  }
  
  // Desconecta para limpar
  mqttClient.disconnect();
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  
  // Configura alarme para próxima leitura
  esp_sleep_enable_timer_wakeup(SLEEP_TIME_SECONDS * 1000000ULL);
  
  Serial.printf("Entrando em deep sleep por %d segundos\n", SLEEP_TIME_SECONDS);
  Serial.flush();
  
  // Entra em deep sleep
  esp_deep_sleep_start();
}

void loop() {
  // Nunca será executado
}
```

## 8. Calculando o Consumo de Energia

Para estimar a duração da bateria, use a seguinte fórmula:

```
Duração da bateria (horas) = Capacidade da bateria (mAh) / Consumo médio (mA)
```

Para o consumo médio, você precisa considerar:

1. **Tempo em cada estado**:
   - Tempo ativo (ta)
   - Tempo em sleep (ts)

2. **Corrente em cada estado**:
   - Corrente ativa (Ia)
   - Corrente em sleep (Is)

```
Consumo médio = (ta * Ia + ts * Is) / (ta + ts)
```

### Exemplo de cálculo:

Se seu ESP32:
- Fica ativo por 2 segundos (consumindo 150mA)
- Dorme por 58 segundos (consumindo 10µA)
- Repete este ciclo a cada minuto
- Usa uma bateria de 2000mAh

O consumo médio seria:
```
(2s * 150mA + 58s * 0.01mA) / 60s = (300mA*s + 0.58mA*s) / 60s = 5.01mA
```

Duração estimada:
```
2000mAh / 5.01mA = 399 horas ≈ 16.6 dias
```

## Dicas Adicionais para Economia de Energia

1. **Otimize o Código**:
   - Evite loops de espera ocupada (busy waiting)
   - Minimize operações matemáticas complexas
   - Use variáveis de tamanho adequado

2. **Hardware**:
   - Use baterias LiPo ou Li-Ion para projetos prolongados
   - Considere adicionar painéis solares para recarregar
   - Use reguladores de tensão eficientes (como LDO)

3. **Comunicação**:
   - Minimize a quantidade de dados transmitidos
   - Reduza a frequência das transmissões
   - Use protocolos leves como MQTT

4. **Técnicas Avançadas**:
   - Use ULP (Ultra Low Power) coprocessor para monitoramento contínuo
   - Implemente lógica adaptativa (mais tempo de sleep quando as condições são estáveis)
   - Monitore o nível da bateria e ajuste o comportamento

## Próximos Passos

Na próxima aula, abordaremos um projeto final integrado que utiliza tudo o que aprendemos nas aulas anteriores, combinando conectividade, sensores, e gerenciamento de energia para criar uma solução IoT completa.

**Desafio:** Modifique o projeto da Estação Meteorológica para incluir algum tipo de energia alternativa (como painel solar) e adaptação dinâmica do tempo de sono com base no nível da bateria.
