# Bluetooth com ESP32

Nesta aula, vamos explorar as capacidades Bluetooth do ESP32, que oferecem duas tecnologias principais: Bluetooth Clássico (BR/EDR) e Bluetooth Low Energy (BLE). O ESP32 suporta ambos os modos, tornando-o extremamente versátil para diferentes aplicações IoT.

## Bluetooth Clássico vs Bluetooth Low Energy (BLE)

| Característica | Bluetooth Clássico | Bluetooth Low Energy |
|----------------|-------------------|----------------------|
| Consumo de energia | Maior | Muito baixo |
| Taxa de transferência | Até 3 Mbps | Até 1 Mbps |
| Alcance | ~10m | ~100m |
| Aplicações | Streaming de áudio, transferência de arquivos | IoT, sensores, beacons |
| Topologia | Ponto a ponto | Ponto a ponto, broadcast |
| Tempo de conexão | Lento (~100ms) | Rápido (~6ms) |

## 1. Bluetooth Serial (Clássico)

O Bluetooth Serial permite que o ESP32 se comunique como um dispositivo de porta serial Bluetooth, semelhante aos módulos HC-05/HC-06 usados com Arduino.

### Exemplo: ESP32 como Servidor Bluetooth Serial

```cpp
#include "BluetoothSerial.h"

// Verifica se Bluetooth Serial está habilitado
#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
#error Bluetooth não está habilitado! Por favor habilite nas configurações da placa.
#endif

BluetoothSerial SerialBT;
String mensagem = "";
char caractereRecebido;

const int ledPin = 2; // LED interno do ESP32

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  
  SerialBT.begin("ESP32_BT_Serial"); // Nome do dispositivo Bluetooth
  Serial.println("Dispositivo Bluetooth iniciado. Você pode emparelhar agora!");
}

void loop() {
  // Verifica se há dados disponíveis do Bluetooth
  if (SerialBT.available()) {
    caractereRecebido = SerialBT.read();
    
    if (caractereRecebido != '\n'){
      // Acumula os caracteres recebidos na mensagem
      mensagem += caractereRecebido;
    }
    else {
      // Processa a mensagem completa
      mensagem.trim();
      Serial.println("Mensagem recebida: " + mensagem);
      
      // Verifica comandos
      if (mensagem == "ON") {
        digitalWrite(ledPin, HIGH);
        SerialBT.println("LED LIGADO");
        Serial.println("LED LIGADO");
      } 
      else if (mensagem == "OFF") {
        digitalWrite(ledPin, LOW);
        SerialBT.println("LED DESLIGADO");
        Serial.println("LED DESLIGADO");
      }
      else if (mensagem == "STATUS") {
        String status = digitalRead(ledPin) ? "LIGADO" : "DESLIGADO";
        SerialBT.println("Status do LED: " + status);
        Serial.println("Status do LED: " + status);
      }
      else {
        SerialBT.println("Comando não reconhecido. Use ON, OFF ou STATUS");
      }
      
      // Limpa a mensagem para a próxima leitura
      mensagem = "";
    }
  }
  
  // Verifica se há dados do Serial (monitor) para enviar via Bluetooth
  if (Serial.available()) {
    SerialBT.write(Serial.read());
  }
  
  delay(20);
}
```

### Como testar:

1. Carregue o código no ESP32
2. No seu smartphone, instale um aplicativo de terminal Bluetooth, como:
   - "Serial Bluetooth Terminal" (Android)
   - "Bluetooth Terminal" (iOS)
3. Procure por dispositivos Bluetooth e conecte-se ao "ESP32_BT_Serial"
4. Envie comandos: ON, OFF, STATUS

## 2. Bluetooth Low Energy (BLE)

BLE é projetado para aplicações que exigem transmissão de pequenas quantidades de dados com baixo consumo de energia.

### Conceitos Importantes do BLE:

- **Periférico**: Dispositivo que anuncia sua presença e disponibiliza dados (ESP32 neste exemplo)
- **Central**: Dispositivo que se conecta ao periférico (smartphone, tablet)
- **Serviço**: Coleção de características relacionadas
- **Característica**: Valor que pode ser lido, escrito ou notificado
- **UUID**: Identificador único para serviços e características

### Exemplo: ESP32 como Servidor BLE (Periférico)

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// UUIDs para nosso serviço e características
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

// Variáveis para controle do dispositivo
BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
int value = 0;

// Classe para controlar eventos de conexão
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Dispositivo conectado");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("Dispositivo desconectado");
    }
};

// Classe para controlar eventos da característica
class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      std::string value = pCharacteristic->getValue();
      
      if (value.length() > 0) {
        Serial.println("*********");
        Serial.print("Novo valor: ");
        
        for (int i = 0; i < value.length(); i++) {
          Serial.print(value[i]);
        }
        
        Serial.println();
        
        // Verifica comandos
        if (value == "ON") {
          digitalWrite(2, HIGH);
          Serial.println("LED ligado");
        } 
        else if (value == "OFF") {
          digitalWrite(2, LOW);
          Serial.println("LED desligado");
        }
        
        Serial.println("*********");
      }
    }
};

void setup() {
  Serial.begin(115200);
  pinMode(2, OUTPUT);
  
  // Cria o dispositivo BLE
  BLEDevice::init("ESP32_BLE");
  
  // Cria o servidor BLE
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  
  // Cria o serviço BLE
  BLEService *pService = pServer->createService(SERVICE_UUID);
  
  // Cria a característica BLE
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ   |
                      BLECharacteristic::PROPERTY_WRITE  |
                      BLECharacteristic::PROPERTY_NOTIFY
                    );
  
  // Cria um descritor para permitir notificações
  pCharacteristic->addDescriptor(new BLE2902());
  
  // Define os callbacks para a característica
  pCharacteristic->setCallbacks(new MyCallbacks());
  
  // Valor inicial
  pCharacteristic->setValue("Hello BLE");
  
  // Inicia o serviço
  pService->start();
  
  // Começa a anunciar
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);  // Ajuda com iPhone
  BLEDevice::startAdvertising();
  
  Serial.println("BLE pronto, aguardando conexões...");
}

void loop() {
  // Notifica o cliente periodicamente se conectado
  if (deviceConnected) {
    // Converte o valor para string
    char txString[8];
    sprintf(txString, "%d", value);
    
    // Define o valor e notifica
    pCharacteristic->setValue(txString);
    pCharacteristic->notify();
    
    value++;
    delay(1000);
  }
  
  // Lida com a desconexão
  if (!deviceConnected && oldDeviceConnected) {
    delay(500); // Tempo para o BT stack se atualizar
    pServer->startAdvertising(); // Reinicia anúncios
    Serial.println("Reiniciando anúncios");
    oldDeviceConnected = deviceConnected;
  }
  
  // Lida com a conexão
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }
}
```

### Como testar BLE:

1. Carregue o código no ESP32
2. No seu smartphone, instale um aplicativo de teste BLE, como:
   - "nRF Connect" (Android/iOS)
   - "BLE Scanner" (Android/iOS)
3. Escaneie dispositivos BLE disponíveis
4. Conecte-se ao "ESP32_BLE"
5. Procure o serviço com o UUID especificado
6. Interaja com a característica:
   - Leia o valor atual
   - Escreva "ON" ou "OFF" para controlar o LED
   - Ative notificações para receber atualizações periódicas

## 3. Projeto: Sensor de Temperatura BLE

Este projeto combina BLE com um sensor de temperatura para criar um dispositivo que transmite leituras de temperatura via Bluetooth LE.

### Materiais necessários:
- ESP32
- Sensor de temperatura (DHT11, DHT22 ou DS18B20)
- Jumpers
- Resistor pull-up de 4.7kΩ (para DS18B20) ou 10kΩ (para DHT11/22)

### Código para sensor DS18B20:

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Pino do sensor DS18B20
#define ONE_WIRE_BUS 4

// Configuração do BLE
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define TEMP_CHAR_UUID      "beb5483e-36e1-4688-b7f5-ea07361b26a8"

// Configuração do sensor
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// Variáveis BLE
BLEServer* pServer = NULL;
BLECharacteristic* pTemperatureCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// Callbacks de conexão BLE
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Cliente conectado");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("Cliente desconectado");
    }
};

void setup() {
  Serial.begin(115200);
  Serial.println("Iniciando sensor de temperatura BLE");
  
  // Inicializa o sensor
  sensors.begin();
  
  // Configura o BLE
  BLEDevice::init("ESP32 Temp Sensor");
  
  // Cria o servidor BLE
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  
  // Cria o serviço BLE
  BLEService *pService = pServer->createService(SERVICE_UUID);
  
  // Cria a característica de temperatura
  pTemperatureCharacteristic = pService->createCharacteristic(
                      TEMP_CHAR_UUID,
                      BLECharacteristic::PROPERTY_READ   |
                      BLECharacteristic::PROPERTY_NOTIFY
                    );
  
  // Adiciona descritor para notificações
  pTemperatureCharacteristic->addDescriptor(new BLE2902());
  
  // Inicia o serviço
  pService->start();
  
  // Inicia o anúncio
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);
  BLEDevice::startAdvertising();
  
  Serial.println("Sensor de temperatura BLE pronto");
}

void loop() {
  // Lê a temperatura a cada 2 segundos
  if (deviceConnected) {
    // Requisita leitura da temperatura
    sensors.requestTemperatures();
    
    // Obtém a temperatura em Celsius
    float tempC = sensors.getTempCByIndex(0);
    
    // Verifica se a leitura foi bem-sucedida
    if (tempC != DEVICE_DISCONNECTED_C) {
      Serial.print("Temperatura: ");
      Serial.print(tempC);
      Serial.println("°C");
      
      // Converte para string
      char tempString[8];
      sprintf(tempString, "%.2f", tempC);
      
      // Define o valor e notifica
      pTemperatureCharacteristic->setValue(tempString);
      pTemperatureCharacteristic->notify();
    } else {
      Serial.println("Erro ao ler sensor de temperatura!");
    }
  }
  
  // Lida com desconexão
  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    pServer->startAdvertising();
    Serial.println("Reiniciando anúncios");
    oldDeviceConnected = deviceConnected;
  }
  
  // Lida com nova conexão
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }
  
  delay(2000);
}
```

## 4. Bluetooth Beacon (iBeacon)

Os beacons são dispositivos BLE que transmitem continuamente seus identificadores. São usados para serviços baseados em localização, rastreamento de ativos e marketing de proximidade.

### Exemplo de iBeacon com ESP32:

```cpp
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEBeacon.h>

// Defina seu próprio UUID para o beacon
#define BEACON_UUID "8ec76ea3-6668-48da-9866-75be8bc86f4d"

// Configuração do beacon
uint16_t beaconUUID = 0xFFFF; // ID do fabricante para Apple iBeacon
uint16_t major = 1;           // Valor Major - usado para agrupar beacons
uint16_t minor = 100;         // Valor Minor - identifica um beacon específico
int txPower = -59;            // Potência do sinal a 1 metro (calibrado)

BLEAdvertising *pAdvertising;
BLEAdvertisementData advertisementData;

void setup() {
  Serial.begin(115200);
  Serial.println("Iniciando ESP32 iBeacon");

  // Inicializa o BLE
  BLEDevice::init("ESP32 iBeacon");
  
  // Obtém o objeto de advertising
  pAdvertising = BLEDevice::getAdvertising();
  
  // Configura os dados do iBeacon
  setBeacon();
  
  // Inicia o advertising
  pAdvertising->start();
  
  Serial.println("iBeacon iniciado");
}

void setBeacon() {
  BLEBeacon oBeacon = BLEBeacon();
  oBeacon.setManufacturerId(beaconUUID);
  oBeacon.setProximityUUID(BLEUUID(BEACON_UUID));
  oBeacon.setMajor(major);
  oBeacon.setMinor(minor);
  oBeacon.setSignalPower(txPower);
  
  BLEAdvertisementData oAdvertisementData = BLEAdvertisementData();
  BLEAdvertisementData oScanResponseData = BLEAdvertisementData();
  
  oAdvertisementData.setFlags(0x04); // BR_EDR_NOT_SUPPORTED 0x04
  
  std::string strServiceData = "";
  strServiceData += (char)26;     // Tamanho dos dados em bytes
  strServiceData += (char)0xFF;   // Tipo de dados (FF = dados do fabricante)
  strServiceData += oBeacon.getData(); 
  
  oAdvertisementData.addData(strServiceData);
  
  pAdvertising->setAdvertisementData(oAdvertisementData);
  pAdvertising->setScanResponseData(oScanResponseData);
}

void loop() {
  // Para beacons, não é necessário fazer nada no loop
  // O BLE se encarrega de transmitir constantemente
  delay(1000);
}
```

### Como usar o iBeacon:

1. Carregue o código no ESP32
2. Use um aplicativo de beacon scanner como:
   - "Beacon Scanner" (Android)
   - "Locate Beacon" (iOS)
3. O ESP32 será detectado como um iBeacon com os identificadores definidos

## Considerações de Bateria e Energia

O Bluetooth Low Energy foi projetado para consumir muito menos energia que o Bluetooth clássico:

- Use o modo BLE para dispositivos alimentados por bateria
- Para reduzir ainda mais o consumo:
  - Aumente o intervalo de advertising (menos frequente)
  - Diminua a potência de transmissão
  - Use o Deep Sleep entre transmissões

## Próximos Passos

Na próxima aula, vamos explorar como trabalhar com sensores e atuadores comuns em projetos IoT com o ESP32, expandindo as possibilidades de seus projetos.

**Desafio:** Modifique o exemplo do sensor de temperatura para incluir também umidade (com um DHT22) e adicione uma característica de LED que possa ser controlada pelo smartphone.
