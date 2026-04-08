# Lab 3 - Comunicação I2C e SPI

## Objetivos

Ao final deste laboratório, você será capaz de:

- Compreender os protocolos de comunicação I2C e SPI
- Conectar múltiplos dispositivos usando barramento I2C
- Utilizar o sensor BME280 (temperatura, umidade, pressão)
- Controlar displays OLED via I2C
- Implementar comunicação SPI com periféricos

---

## 1. Protocolo I2C (Inter-Integrated Circuit)

### 1.1 O que é I2C?

I2C é um protocolo de comunicação serial síncrona que permite conectar múltiplos dispositivos usando apenas 2 fios:

```
┌─────────────────────────────────────────────────────────────┐
│                    BARRAMENTO I2C                            │
│                                                             │
│    SCL (Clock) ───────────────────────────────────────►     │
│    SDA (Data)  ◄───────────────────────────────────────     │
│                                                             │
│    ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐        │
│    │ ESP32  │   │ Sensor │   │  OLED  │   │  RTC   │        │
│    │ Master │   │  0x76  │   │  0x3C  │   │  0x68  │        │
│    └────────┘   └────────┘   └────────┘   └────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Pinos I2C no ESP32

| Função | GPIO |
|--------|------|
| SCL    | 22   |
| SDA    | 21   |

### 1.3 Endereços I2C

Cada dispositivo I2C possui um endereço único (7 bits). Exemplos comuns:

| Dispositivo       | Endereço Hex |
|-------------------|--------------|
| BME280            | 0x76 ou 0x77 |
| OLED SSD1306      | 0x3C         |
| MPU6050           | 0x68         |
| DS3231 (RTC)      | 0x68         |
| BH1750 (Luz)      | 0x23         |

### 1.4 Escanear Dispositivos I2C

Código para descobrir endereços conectados:

```cpp
#include <Wire.h>

void setup() {
    Serial.begin(115200);
    Wire.begin(21, 22);  // SDA, SCL
    
    Serial.println("Escaneando dispositivos I2C...");
    
    for (uint8_t address = 1; address < 127; address++) {
        Wire.beginTransmission(address);
        uint8_t error = Wire.endTransmission();
        
        if (error == 0) {
            Serial.printf("Dispositivo encontrado em: 0x%02X\n", address);
        }
    }
    Serial.println("Escaneamento completo!");
}

void loop() {}
```

---

## 2. Sensor BME280

### 2.1 Características

O BME280 é um sensor digital que mede:
- **Temperatura**: -40°C a +85°C
- **Umidade**: 0% a 100%
- **Pressão**: 300 a 1100 hPa

### 2.2 Biblioteca

Instale a biblioteca "Adafruit BME280 Library" via PlatformIO:

No arquivo `platformio.ini`, adicione:

```ini
lib_deps =
    adafruit/Adafruit BME280 Library@^2.2.4
```

### 2.3 Wiring

```
BME280    ESP32
──────    ─────
VIN  ───► 3.3V
GND  ───► GND
SCL  ───► GPIO 22
SDA  ───► GPIO 21
```

### 2.4 Código Completo

```cpp
#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_BME280.h>

#define SEALEVELPRESSURE_HPA (1013.25)

Adafruit_BME280 bme;

void setup() {
    Serial.begin(115200);
    
    bool status = bme.begin(0x76);
    if (!status) {
        Serial.println("Sensor BME280 não encontrado!");
        while (1);
    }
    
    Serial.println("BME280 inicializado com sucesso!");
}

void loop() {
    Serial.printf("Temperatura: %.2f °C\n", bme.readTemperature());
    Serial.printf("Umidade: %.2f %%\n", bme.readHumidity());
    Serial.printf("Pressão: %.2f hPa\n", bme.readPressure() / 100.0F);
    Serial.printf("Altitude: %.2f m\n", bme.readAltitude(SEALEVELPRESSURE_HPA));
    Serial.println("---");
    delay(2000);
}
```

---

## 3. Display OLED SSD1306

### 3.1 Características

- Resolução: 128 x 64 pixels
- Interface: I2C
- Endereço: 0x3C

### 3.2 Biblioteca

```ini
lib_deps =
    adafruit/Adafruit GFX Library@^1.11.9
    adafruit/Adafruit SSD1306@^2.5.9
```

### 3.3 Wiring

```
OLED     ESP32
────     ─────
VCC  ───► 3.3V
GND  ───► GND
SCL  ───► GPIO 22
SDA  ───► GPIO 21
```

### 3.4 Código com OLED

```cpp
#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define OLED_ADDR 0x3C

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

void setup() {
    Serial.begin(115200);
    
    if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
        Serial.println("OLED não encontrado!");
        while (1);
    }
    
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.println("Hello, IoT!");
    display.display();
}

void loop() {
    display.clearDisplay();
    display.setCursor(0, 0);
    display.printf("Tempo: %lu s\n", millis() / 1000);
    display.display();
    delay(1000);
}
```

---

## 4. Múltiplos Dispositivos I2C

### 4.1 Desafio: BME280 + OLED

Conecte ambos os dispositivos ao mesmo barramento I2C:

```
ESP32
  │
  ├─► BME280 (0x76)
  │
  └─► OLED (0x3C)
```

### 4.2 Código Integrado

```cpp
#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_BME280.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_ADDR 0x3C

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
Adafruit_BME280 bme;

void setup() {
    Serial.begin(115200);
    display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
    bme.begin(0x76);
}

void loop() {
    float temp = bme.readTemperature();
    float umid = bme.readHumidity();
    float press = bme.readPressure() / 100.0F;
    
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.printf("Temp: %.1f C\n", temp);
    display.printf("Umid: %.1f %%\n", umid);
    display.printf("Press: %.0f hPa", press);
    display.display();
    
    delay(2000);
}
```

---

## 5. Protocolo SPI (Serial Peripheral Interface)

### 5.1 O que é SPI?

SPI é um protocolo de comunicação serial síncrona mais rápido que I2C, mas usa mais pinos:

```
┌─────────────────────────────────────────────────────────────┐
│                    BARRAMENTO SPI                            │
│                                                             │
│    SCK (Clock)  ───────────────────────────────────►       │
│    MOSI (Data)  ───────────────────────────────────►       │
│    MISO (Data)  ◄───────────────────────────────────       │
│    CS (Chip Select) ◄─────────────────────────────         │
│                                                             │
│    ┌────────┐   ┌────────┐   ┌────────┐                   │
│    │ ESP32  │   │  SD    │   │ Sensor │                   │
│    │ Master │◄──►│ Card   │◄──►│  SPI   │                   │
│    └────────┘   └────────┘   └────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Pinos SPI no ESP32

| Função | GPIO (VSPI) | GPIO (HSPI) |
|--------|-------------|-------------|
| SCK    | 18          | 14          |
| MISO   | 19          | 12          |
| MOSI   | 23          | 13          |
| CS     | 5           | 15          |

### 5.3 Exemplo: Leitor de Cartão SD

Instale a biblioteca SD:

```ini
lib_deps =
    espressif/esp32-snippets@^0.5.0
    ; ou use a biblioteca nativa
```

Código para listar arquivos no cartão SD:

```cpp
#include <Arduino.h>
#include "SD.h"
#include "SPI.h"

#define SD_CS 5
#define SD_SCK 18
#define SD_MISO 19
#define SD_MOSI 23

void setup() {
    Serial.begin(115200);
    
    SPI.begin(SD_SCK, SD_MISO, SD_MOSI, SD_CS);
    
    if (!SD.begin(SD_CS, SPI)) {
        Serial.println("Cartão SD não encontrado!");
        return;
    }
    
    uint8_t cardType = SD.cardType();
    Serial.printf("Tipo do cartão: %d\n", cardType);
    
    Serial.println("Arquivos no cartão:");
    listDir(SD, "/", 0);
}

void loop() {}

void listDir(fs::FS &fs, const char * dirname, uint8_t levels) {
    Serial.printf("Listando diretório: %s\n", dirname);
    File root = fs.open(dirname);
    File file = root.openNextFile();
    
    while (file) {
        if (file.isDirectory()) {
            Serial.printf("  DIR: %s\n", file.name());
            if (levels) {
                listDir(fs, file.name(), levels - 1);
            }
        } else {
            Serial.printf("  FILE: %s (%d bytes)\n", file.name(), file.size());
        }
        file = root.openNextFile();
    }
}
```

---

## 6. DESAFIOS

### DESAFIO 1: Monitor de Temperatura Completo

**Objetivo**: Exibir dados do BME280 no OLED.

### Requisitos:
- Conectar BME280 e OLED no mesmo barramento I2C
- Exibir temperatura, umidade e pressão no OLED
- Atualizar a cada 2 segundos

---

### DESAFIO 2: Logger de Dados

**Objetivo**: Salvar dados do sensor em cartão SD.

### Requisitos:
- Ler dados do BME280
- Salvar em arquivo CSV no cartão SD
- Formato: timestamp, temperatura, umidade, pressão
- Uma leitura por segundo

---

### DESAFIO 3: Sistema de Alarme Visual

**Objetivo**: Alarme que ativa quando temperatura ultrapassa limite.

### Requisitos:
- Usar BME280 para medir temperatura
- Definir temperatura limite (ex: 30°C)
- Quando acima do limite:
  - Mostrar alerta no OLED
  - LED onboard pisca
- Quando abaixo:
  - Mostrar "Normal" no OLED

---

### DESAFIO 4: Interface de Menu

**Objetivo**: Criar menu navegável com botões.

### Requisitos:
- OLED mostra opções de menu
- Botão 1 (GPIO 4): Próxima opção
- Botão 2 (GPIO 5): Selecionar opção
- Opções: "Temp", "Umid", "Press", "Alt"
- Ao selecionar, mostra valor correspondente

---

## 7. Referências

- [ESP32 I2C Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/api-reference/peripherals/i2c.html)
- [ESP32 SPI Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/api-reference/peripherals/spi.html)
- [Adafruit BME280 Library](https://github.com/adafruit/Adafruit_BME280_Library)
- [Adafruit SSD1306 Library](https://github.com/adafruit/Adafruit_SSD1306)
