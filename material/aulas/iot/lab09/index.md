# Lab 9 - Bluetooth Low Energy (BLE)

## Objetivos

Ao final deste laboratório, você será capaz to:

- Compreender os conceitos de BLE
- Implementar comunicação BLE no ESP32
- Criar um servidor GATT
- Utilizar características e serviços BLE
- Desenvolver apps que se comunicam com dispositivos BLE

---

## 1. Introdução ao Bluetooth LE

### 1.1 O que é BLE?

Bluetooth Low Energy (BLE) é uma tecnologia de comunicação sem fio de baixo consumo, ideal para dispositivos IoT que precisam de bateria de longa duração.

### 1.2 Arquitetura BLE

```
┌─────────────────────────────────────────────────────────────┐
│                    ARQUITETURA BLE                           │
│                                                             │
│   ┌─────────────┐     ┌─────────────┐                      │
│   │   Central   │     │ Peripheral  │                      │
│   │  (Phone)    │◄───►│  (ESP32)    │                      │
│   └─────────────┘     └─────────────┘                      │
│          │                   │                              │
│          │    ┌───────┐      │                              │
│          └───►│ GATT  │◄─────┘                              │
│               │Server │                                     │
│               └───────┘                                     │
│                  │                                           │
│      ┌──────────┼──────────┐                               │
│      ▼          ▼          ▼                                │
│   Service   Characteristic  Descriptor                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Conceitos Importantes

| Conceito | Descrição |
|----------|-----------|
| **Peripheral** | Dispositivo que transmite dados (ESP32) |
| **Central** | Dispositivo que recebe dados (smartphone) |
| **Service** | Coleção de características |
| **Characteristic** | Valor específico com UUID |
| **Descriptor** | Metadados da característica |

---

## 2. BLE no ESP32

### 2.1 Biblioteca

O ESP32 já possui BLE integrado. Use:

```cpp
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
```

### 2.2 Servidor BLE Simples

```cpp
#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLEServer* pServer = nullptr;
BLEService* pService = nullptr;
BLECharacteristic* pCharacteristic = nullptr;
bool deviceConnected = false;

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
        deviceConnected = true;
        Serial.println("Cliente conectado!");
    }

    void onDisconnect(BLEServer* pServer) {
        deviceConnected = false;
        Serial.println("Cliente desconectado!");
    }
};

void setup() {
    Serial.begin(115200);
    
    // Cria o dispositivo BLE
    BLEDevice::init("ESP32-BLE");
    
    // Cria o servidor
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());
    
    // Cria o serviço
    pService = pServer->createService(SERVICE_UUID);
    
    // Cria característica
    pCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_READ |
        BLECharacteristic::PROPERTY_WRITE
    );
    
    pCharacteristic->setValue("Hello BLE!");
    pCharacteristic->setCallbacks(new MyCharacteristicCallbacks());
    
    // Inicia o serviço
    pService->start();
    
    // Inicia publicidade
    BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    BLEDevice::startAdvertising();
    
    Serial.println("Servidor BLE iniciado!");
}

void loop() {
    if (deviceConnected) {
        // Atualiza valor periodicamente
        pCharacteristic->setValue(String(millis()).c_str());
    }
    delay(1000);
}
```

---

## 3. Características com Notificações

### 3.1 Enviando Notificações

```cpp
#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define TEMP_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLECharacteristic* pTempCharacteristic = nullptr;
bool deviceConnected = false;

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
        deviceConnected = true;
    }
    void onDisconnect(BLEServer* pServer) {
        deviceConnected = false;
    }
};

void setup() {
    Serial.begin(115200);
    BLEDevice::init("ESP32-Temp");
    
    BLEServer* pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());
    
    BLEService* pService = pServer->createService(SERVICE_UUID);
    
    pTempCharacteristic = pService->createCharacteristic(
        TEMP_UUID,
        BLECharacteristic::PROPERTY_READ | 
        BLECharacteristic::PROPERTY_NOTIFY
    );
    
    pTempCharacteristic->addDescriptor(new BLE2902());
    
    pService->start();
    
    BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    BLEDevice::startAdvertising();
}

void loop() {
    if (deviceConnected) {
        // Simula temperatura
        float temp = 20.0 + (random(100) / 10.0);
        
        std::string value = std::to_string(temp);
        pTempCharacteristic->setValue(value);
        pTempCharacteristic->notify();
        
        Serial.printf("Notificação enviada: %.1f\n", temp);
    }
    delay(2000);
}
```

---

## 4. Recebendo Comandos via BLE

### 4.1 Característica Escritável

```cpp
#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define LED_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

const uint8_t LED_PIN = 2;

class LEDCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic* pCharacteristic) {
        std::string value = pCharacteristic->getValue();
        
        if (value.length() > 0) {
            Serial.print("Valor recebido: ");
            for (int i = 0; i < value.length(); i++) {
                Serial.print(value[i]);
            }
            Serial.println();
            
            if (value == "ON") {
                digitalWrite(LED_PIN, HIGH);
                Serial.println("LED LIGADO");
            } else if (value == "OFF") {
                digitalWrite(LED_PIN, LOW);
                Serial.println("LED DESLIGADO");
            }
        }
    }
};

void setup() {
    Serial.begin(115200);
    pinMode(LED_PIN, OUTPUT);
    
    BLEDevice::init("ESP32-LED");
    BLEServer* pServer = BLEDevice::createServer();
    
    BLEService* pService = pServer->createService(SERVICE_UUID);
    
    BLECharacteristic* pLED = pService->createCharacteristic(
        LED_UUID,
        BLECharacteristic::PROPERTY_READ |
        BLECharacteristic::PROPERTY_WRITE
    );
    
    pLED->setCallbacks(new LEDCallbacks());
    pLED->setValue("OFF");
    
    pService->start();
    
    BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    BLEDevice::startAdvertising();
}

void loop() {
    delay(1000);
}
```

---

## 5. GATT Service Completo

### 5.1 Múltiplas Características

```cpp
#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

// UUIDs
#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define TEMP_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define HUM_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a9"
#define LED_UUID "beb5483e-36e1-4688-b7f5-ea07361b26aa"

const uint8_t LED_PIN = 2;

bool deviceConnected = false;

class ServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
        deviceConnected = true;
        Serial.println("Conectado!");
    }
    void onDisconnect(BLEServer* pServer) {
        deviceConnected = false;
        Serial.println("Desconectado!");
    }
};

class LEDCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic* pCharacteristic) {
        std::string value = pCharacteristic->getValue();
        if (value == "ON") digitalWrite(LED_PIN, HIGH);
        else if (value == "OFF") digitalWrite(LED_PIN, LOW);
    }
};

void setup() {
    Serial.begin(115200);
    pinMode(LED_PIN, OUTPUT);
    
    BLEDevice::init("ESP32-IoT");
    BLEServer* pServer = BLEDevice::createServer();
    pServer->setCallbacks(new ServerCallbacks());
    
    BLEService* pService = pServer->createService(SERVICE_UUID);
    
    // Temperatura
    BLECharacteristic* pTemp = pService->createCharacteristic(
        TEMP_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
    );
    pTemp->addDescriptor(new BLE2902());
    
    // Umidade
    BLECharacteristic* pHum = pService->createCharacteristic(
        HUM_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
    );
    pHum->addDescriptor(new BLE2902());
    
    // LED Control
    BLECharacteristic* pLED = pService->createCharacteristic(
        LED_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE
    );
    pLED->setCallbacks(new LEDCallbacks());
    pLED->setValue("OFF");
    
    pService->start();
    
    BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    BLEDevice::startAdvertising();
}

void loop() {
    if (deviceConnected) {
        float temp = 20.0 + random(100) / 10.0;
        float hum = 50.0 + random(300) / 10.0;
        
        pTemp->setValue(std::to_string(temp));
        pTemp->notify();
        
        pHum->setValue(std::to_string(hum));
        pHum->notify();
    }
    delay(2000);
}
```

---

## 6. Aplicação Mobile

### 6.1 Apps para Testar BLE

| App | Plataforma | Link |
|-----|-------------|------|
| **nRF Connect** | Android/iOS | Play Store/App Store |
| **BLE Scanner** | Android | Play Store |
| **LightBlue** | iOS | App Store |

### 6.2 Usando nRF Connect

1. Instale o app
2. Escaneie dispositivos
3. Encontre "ESP32-IoT"
4. Conecte e veja os serviços
5. Leia/escreva características

---

## 7. Beacon BLE

### 7.1 O que é Beacon?

Beacon é um dispositivo que transmite sinais BLE periodicamente, usado para localização indoor.

```cpp
#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEBeacon.h>

void setup() {
    Serial.begin(115200);
    
    BLEDevice::init("ESP32-Beacon");
    BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
    
    BLEBeacon myBeacon;
    myBeacon.setManufacturerId(0x004C);  // Apple
    myBeacon.setProximityUUID(BLEUUID("8ec76f45-8a07-403a-b3d5-3d9a552a08b5"));
    myBeacon.setMajor(1);
    myBeacon.setMinor(100);
    myBeacon.setSignalPower(0xC8);  // -55 dBm
    
    BLEAdvertisementData advertisementData;
    advertisementData.setFlags(0x06);  // LE General Discoverable
    std::string beaconData = myBeacon.getData();
    advertisementData.addData(beaconData);
    
    pAdvertising->setAdvertisementData(advertisementData);
    pAdvertising->setScanResponseData(advertisementData);
    
    pAdvertising->start();
    Serial.println("Beacon iniciado!");
}

void loop() {
    delay(1000);
}
```

---

## 8. DESAFIOS

### DESAFIO 1: Termômetro BLE

**Objetivo**: Criar um termômetro que envia dados via BLE.

### Requisitos:
- Característica de temperatura com notificação
- Simular temperatura entre 20-30°C
- Notificar a cada 2 segundos
- App mostra valor em tempo real

---

### DESAFIO 2: Controle via BLE

**Objetivo**: Controlar LED via app.

### Requisitos:
- Característica para comando
- "ON"/"OFF" para controlar LED
- Leitura retorna estado atual

---

### DESAFIO 3: Estação BLE Completa

**Objetivo**: Múltiplas características.

### Requisitos:
- Temperatura (notify)
- Umidade (notify)
- LED (read/write)
- Botão (notify ao pressionar)

---

### DESAFIO 4: Economizador de Bateria

**Objetivo**: Implementar modo de economia.

### Requisitos:
- Desligar BLE quando não conectado
- Ligar BLE periodicamente para advertising
- Medir consumo (se possível)

---

## 9. Boas Práticas BLE

1. **Segurança**: Use BLE seguro em produção (BLE whitelist)
2. **Bateria**: Desative BLE quando não necessário
3. **RSSI**: Monitore intensidade do sinal
4. **UUIDs**: Use UUIDs únicos para serviços

---

## 10. Referências

- [ESP32 BLE Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/api-reference/bluetooth/esp_nimble.html)
- [BLE Arduino Examples](https://github.com/nkolban/esp32-snippets)
- [BLE GATT Spec](https://www.bluetooth.com/specifications/gatt/)
