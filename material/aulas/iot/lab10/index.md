# Lab 10 - Sensores e Atuadores

## Objetivos

Ao final deste laboratório, você será capaz de:

- Integrar diversos sensores analógicos e digitais
- Controlar atuadores (LEDs, relés, motores)
- Utilizar conversão ADC
- Implementar controle PWM
- Desenvolver sistemas IoT completos

---

## 1. Sensores Analógicos

### 1.1 Conversão ADC

O ESP32 possui conversor analógico-digital (ADC) de 12 bits (0-4095):

```cpp
// Lê valor ADC (0-4095)
int valor = analogRead(GPIO34);

// Converte para tensão
float tensao = valor * 3.3 / 4095.0;

// Converte para temperatura (termistor NTC)
float resistencia = 10000.0 / ((4095.0 / valor) - 1.0);
float temperatura = 1.0 / (1.0 / 298.15 + log(resistencia / 10000.0) / 3435.0) - 273.15;
```

### 1.2 Potenciômetro

```cpp
const uint8_t POT_PIN = 34;

void setup() {
    Serial.begin(115200);
    analogReadResolution(12);  // 12 bits (0-4095)
}

void loop() {
    int valor = analogRead(POT_PIN);
    Serial.printf("ADC: %d, Tensão: %.2fV\n", valor, valor * 3.3 / 4095);
    delay(100);
}
```

### 1.3 LDR (Sensor de Luz)

```cpp
const uint8_t LDR_PIN = 34;
const uint8_t LED_PIN = 2;

void setup() {
    pinMode(LED_PIN, OUTPUT);
    Serial.begin(115200);
}

void loop() {
    int luz = analogRead(LDR_PIN);
    
    if (luz < 1000) {
        digitalWrite(LED_PIN, HIGH);
    } else {
        digitalWrite(LED_PIN, LOW);
    }
    
    Serial.printf("Luz: %d\n", luz);
    delay(100);
}
```

---

## 2. Sensores Digitais

### 2.1 DHT11/DHT22 (Temperatura e Umidade)

```cpp
#include <DHT.h>

#define DHT_PIN 4
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
    Serial.begin(115200);
    dht.begin();
}

void loop() {
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();
    
    if (isnan(temp) || isnan(hum)) {
        Serial.println("Erro na leitura!");
    } else {
        Serial.printf("Temp: %.1f°C, Umidade: %.1f%%\n", temp, hum);
    }
    delay(2000);
}
```

### 2.2 HC-SR501 (Sensor de Movimento PIR)

```cpp
const uint8_t PIR_PIN = 4;
const uint8_t LED_PIN = 2;

void setup() {
    pinMode(PIR_PIN, INPUT);
    pinMode(LED_PIN, OUTPUT);
    Serial.begin(115200);
}

void loop() {
    int movimento = digitalRead(PIR_PIN);
    
    if (movimento == HIGH) {
        Serial.println("Movimento detectado!");
        digitalWrite(LED_PIN, HIGH);
    } else {
        digitalWrite(LED_PIN, LOW);
    }
    delay(100);
}
```

### 2.3 HC-SR04 (Sensor Ultrassônico)

```cpp
const uint8_t TRIG_PIN = 5;
const uint8_t ECHO_PIN = 18;

void setup() {
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    Serial.begin(115200);
}

float medirDistancia() {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    
    long duration = pulseIn(ECHO_PIN, HIGH);
    float distancia = duration * 0.034 / 2;
    return distancia;
}

void loop() {
    float dist = medirDistancia();
    Serial.printf("Distância: %.2f cm\n", dist);
    delay(500);
}
```

---

## 3. Atuadores

### 3.1 LED com PWM

```cpp
const uint8_t LED_PIN = 2;

void setup() {
    pinMode(LED_PIN, OUTPUT);
}

void loop() {
    for (int brilho = 0; brilho <= 255; brilho++) {
        analogWrite(LED_PIN, brilho);
        delay(10);
    }
    
    for (int brilho = 255; brilho >= 0; brilho--) {
        analogWrite(LED_PIN, brilho);
        delay(10);
    }
}
```

### 3.2 Módulo Relé

```cpp
const uint8_t RELAY_PIN = 4;

void setup() {
    pinMode(RELAY_PIN, OUTPUT);
    digitalWrite(RELAY_PIN, LOW);
    Serial.begin(115200);
}

void loop() {
    Serial.println("Relé LIGADO");
    digitalWrite(RELAY_PIN, HIGH);
    delay(2000);
    
    Serial.println("Relé DESLIGADO");
    digitalWrite(RELAY_PIN, LOW);
    delay(2000);
}
```

### 3.3 Motor DC com Ponte H

```cpp
const uint8_t IN1 = 4;
const uint8_t IN2 = 5;
const uint8_t ENA = 18;

void setup() {
    pinMode(IN1, OUTPUT);
    pinMode(IN2, OUTPUT);
    pinMode(ENA, OUTPUT);
}

void motorForward(int speed) {
    digitalWrite(IN1, HIGH);
    digitalWrite(IN2, LOW);
    analogWrite(ENA, speed);
}

void motorBackward(int speed) {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, HIGH);
    analogWrite(ENA, speed);
}

void motorStop() {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, LOW);
    analogWrite(ENA, 0);
}

void loop() {
    motorForward(150);
    delay(2000);
    motorStop();
    delay(1000);
    motorBackward(150);
    delay(2000);
    motorStop();
    delay(1000);
}
```

### 3.4 Servomotor

```cpp
#include <Servo.h>

Servo myservo;
const uint8_t SERVO_PIN = 4;

void setup() {
    myservo.attach(SERVO_PIN);
    Serial.begin(115200);
}

void loop() {
    for (int pos = 0; pos <= 180; pos += 10) {
        myservo.write(pos);
        Serial.printf("Ângulo: %d\n", pos);
        delay(15);
    }
    for (int pos = 180; pos >= 0; pos -= 10) {
        myservo.write(pos);
        Serial.printf("Ângulo: %d\n", pos);
        delay(15);
    }
}
```

---

## 4. Sistema Completo: Estufa Automatizada

### 4.1 Arquitetura

```
Sensores:            Atuadores:
- DHT22 (temp)      - Ventilador (PWM)
- LDR (luz)         - LED grow
- Humidade solo     - Bomba água (relé)
```

### 4.2 Código

```cpp
#include <DHT.h>

const uint8_t DHT_PIN = 4;
const uint8_t LDR_PIN = 34;
const uint8_t SOLO_PIN = 35;
const uint8_t VENT_PIN = 18;
const uint8_t LED_PIN = 2;
const uint8_t BOMBA_PIN = 19;

DHT dht(DHT_PIN, DHT22);

const float TEMP_MAX = 30.0;
const float TEMP_MIN = 18.0;
const uint16_t LUZ_MIN = 500;
const uint16_t SOLO_SECO = 2000;

void setup() {
    Serial.begin(115200);
    dht.begin();
    
    pinMode(VENT_PIN, OUTPUT);
    pinMode(LED_PIN, OUTPUT);
    pinMode(BOMBA_PIN, OUTPUT);
    
    digitalWrite(VENT_PIN, LOW);
    digitalWrite(LED_PIN, LOW);
    digitalWrite(BOMBA_PIN, LOW);
}

void loop() {
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();
    uint16_t luz = analogRead(LDR_PIN);
    uint16_t solo = analogRead(SOLO_PIN);
    
    Serial.printf("Temp: %.1f°C, Hum: %.1f%%, Luz: %d, Solo: %d\n",
        temp, hum, luz, solo);
    
    if (temp > TEMP_MAX) {
        digitalWrite(VENT_PIN, HIGH);
    } else if (temp < TEMP_MIN) {
        digitalWrite(VENT_PIN, LOW);
    }
    
    if (luz < LUZ_MIN) {
        digitalWrite(LED_PIN, HIGH);
    } else {
        digitalWrite(LED_PIN, LOW);
    }
    
    if (solo < SOLO_SECO) {
        digitalWrite(BOMBA_PIN, HIGH);
        delay(2000);
        digitalWrite(BOMBA_PIN, LOW);
    }
    
    delay(5000);
}
```

---

## 5. DESAFIOS

### DESAFIO 1: Alarme de Estacionamento

- HC-SR04 medir distância
- LED verde: > 50cm, amarelo: 20-50cm, vermelho: < 20cm

### DESAFIO 2: Controle de Iluminação

- LDR detecta luminosidade
- Potenciômetro define brilho máximo
- PWM controla LED

### DESAFIO 3: Irrigação Automática

- Sensor de umidade do solo
- Bomba d'água via relé
- Display OLED mostra status

### DESAFIO 4: Termostato Digital

- DHT22 mede temperatura
- Potenciômetro ajusta temperatura alvo
- Aquecedor e ventilador controlados

---

## 6. Referências

- [ESP32 ADC Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/api-reference/peripherals/adc.html)
- [ESP32 LEDC PWM](https://docs.espressif.com/projects/esp-idf/en/latest/api-reference/peripherals/ledc.html)
