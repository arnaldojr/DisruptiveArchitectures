# Lab 4 - FreeRTOS - Sistemas Operacionais de Tempo Real

## Objetivos

Ao final deste laboratório, você será capaz to:

- Compreender conceitos de sistemas operacionais de tempo real (RTOS)
- Criar e gerenciar múltiplas tarefas (tasks) no ESP32
- Utilizar filas (queues) para comunicação entre tarefas
- Aplicar semáforos para sincronização
- Implementar sistemas multitarefa eficientes

---

## 1. Introdução ao FreeRTOS

### 1.1 O que é FreeRTOS?

FreeRTOS é um sistema operacional de tempo real (RTOS) gratuito e de código aberto, amplamente utilizado em microcontroladores. O ESP32 já vem com FreeRTOS integrado.

### 1.2 Por que usar RTOS?

Em sistemas embarcados complexos, frequentemente precisamos:
- Monitorar sensores em intervalos regulares
- Processar dados em tempo real
- Controlar múltiplos atuadores simultaneamente
- Comunicar via rede

O modelo de super-loop (loop principal) não escala bem para essas necessidades.

### 1.3 Arquitetura: Super-loop vs RTOS

```
┌─────────────────────────────────────────────────────────────┐
│              SUPER-LOOP (sem RTOS)                          │
│                                                             │
│  void loop() {                                              │
│      lerSensor();      // Bloqueia por 10ms               │
│      processar();      // Bloqueia por 50ms               │
│      enviarRede();      // Bloqueia por 100ms              │
│  }  // Total: 160ms por ciclo                              │
│                                                             │
│  Problema: Uma tarefa lenta bloqueia todas as outras!     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              FREE-RTOS (multitarefa)                        │
│                                                             │
│  Task 1: lerSensor()    - Executa a cada 10ms             │
│  Task 2: processar()    - Executa a cada 50ms              │
│  Task 3: enviarRede()   - Executa a cada 100ms             │
│                                                             │
│  Vantagem: Tarefas executam independentemente!            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Tasks - Criando Tarefas

### 2.1 Estrutura de uma Task

```cpp
void minhaTask(void * parameter) {
    while (true) {
        // Código da tarefa
        Serial.println("Task executando!");
        vTaskDelay(1000 / portTICK_PERIOD_MS);  // Espera 1 segundo
    }
}
```

### 2.2 Criando uma Task

```cpp
#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

void blinkLED(void * parameter) {
    pinMode(2, OUTPUT);
    while (true) {
        digitalWrite(2, HIGH);
        vTaskDelay(500 / portTICK_PERIOD_MS);
        digitalWrite(2, LOW);
        vTaskDelay(500 / portTICK_PERIOD_MS);
    }
}

void setup() {
    Serial.begin(115200);
    
    xTaskCreate(
        blinkLED,          // Função da task
        "Blink LED",       // Nome (para debug)
        1000,              // Stack size (bytes)
        NULL,              // Parâmetros
        1,                 // Prioridade
        NULL               // Handle
    );
}

void loop() {}
```

### 2.3 Parâmetros das Tasks

| Parâmetro | Descrição |
|-----------|-----------|
| TaskFunction | Ponteiro para a função |
| Name | Nome descritivo (max 16 chars) |
| StackDepth | Memória alocada em words (4KB = 4096) |
| Parameters | Ponteiro para parâmetros |
| Priority | 0 (mais baixa) a 24 (mais alta) |
| TaskHandle | Handle para controlar a task |

### 2.4 Prioridades

```cpp
// Prioridades (configurável em menuconfig)
// Prioridade 0: idle (sempre executando)
// Prioridade 1:baixa
// Prioridade 10: alta
// Prioridade 24: crítica

xTaskCreate(..., "Task1", 1000, NULL, 1, NULL);  // Baixa
xTaskCreate(..., "Task2", 1000, NULL, 5, NULL);  // Média
xTaskCreate(..., "Task3", 1000, NULL, 10, NULL); // Alta
```

---

## 3. vTaskDelay vs vTaskDelayUntil

### 3.1 vTaskDelay

Espera por um período fixo:

```cpp
void minhaTask(void * parameter) {
    while (true) {
        Serial.println("Executando...");
        vTaskDelay(1000 / portTICK_PERIOD_MS);  // 1 segundo
    }
}
```

### 3.2 vTaskDelayUntil

Espera até um horário específico (mais preciso para periodicidade):

```cpp
void minhaTask(void * parameter) {
    TickType_t previousWakeTime = xTaskGetTickCount();
    const TickType_t period = 1000 / portTICK_PERIOD_MS;
    
    while (true) {
        Serial.println("Executando a cada 1 segundo...");
        vTaskDelayUntil(&previousWakeTime, period);
    }
}
```

---

## 4. Filas (Queues) - Comunicação entre Tasks

### 4.1 O que são Filas?

Filas são buffers FIFO (First In, First Out) para comunicação entre tarefas:

```
┌─────────────────────────────────────────────────────────────┐
│                      FILA (QUEUE)                            │
│                                                             │
│   Task A              Fila              Task B              │
│   ┌───────┐         ┌─────┐            ┌───────┐            │
│   │ dados │────────►│     │───────────►│process│            │
│   └───────┘         │ [1] │            └───────┘            │
│                     │ [2] │                                 │
│   Producer          │ [3] │            Consumer             │
│                     └─────┘                                 │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Exemplo: Producer-Consumer

```cpp
#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"

QueueHandle_t fila;
const uint8_t LED_PIN = 2;

void producerTask(void * parameter) {
    uint8_t counter = 0;
    while (true) {
        counter++;
        xQueueSend(fila, &counter, pdMS_TO_TICKS(100));
        Serial.printf("Produzido: %d\n", counter);
        vTaskDelay(2000 / portTICK_PERIOD_MS);
    }
}

void consumerTask(void * parameter) {
    uint8_t valor;
    while (true) {
        if (xQueueReceive(fila, &valor, pdMS_TO_TICKS(1000))) {
            Serial.printf("Recebido: %d\n", valor);
            
            // Piscar LED conforme valor
            for (int i = 0; i < valor; i++) {
                digitalWrite(LED_PIN, HIGH);
                vTaskDelay(100 / portTICK_PERIOD_MS);
                digitalWrite(LED_PIN, LOW);
                vTaskDelay(100 / portTICK_PERIOD_MS);
            }
        }
    }
}

void setup() {
    Serial.begin(115200);
    pinMode(LED_PIN, OUTPUT);
    
    fila = xQueueCreate(10, sizeof(uint8_t));
    
    xTaskCreate(producerTask, "Producer", 2000, NULL, 1, NULL);
    xTaskCreate(consumerTask, "Consumer", 2000, NULL, 1, NULL);
}

void loop() {}
```

---

## 5. Semáforos - Sincronização

### 5.1 Binary Semaphore

Sinaliza eventos:

```cpp
#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

SemaphoreHandle_t semaforo;
const uint8_t LED_PIN = 2;
const uint8_t BUTTON_PIN = 4;

void IRAM_ATTR buttonISR() {
    xSemaphoreGiveFromISR(semaforo, NULL);
}

void buttonTask(void * parameter) {
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    attachInterrupt(BUTTON_PIN, buttonISR, FALLING);
    
    while (true) {
        if (xSemaphoreTake(semaforo, portMAX_DELAY)) {
            Serial.println("Botão pressionado!");
            digitalWrite(LED_PIN, HIGH);
            vTaskDelay(200 / portTICK_PERIOD_MS);
            digitalWrite(LED_PIN, LOW);
        }
    }
}

void setup() {
    Serial.begin(115200);
    pinMode(LED_PIN, OUTPUT);
    
    semaforo = xSemaphoreCreateBinary();
    xTaskCreate(buttonTask, "Button", 2000, NULL, 1, NULL);
}

void loop() {}
```

### 5.2 Mutex

Protege recursos compartilhados:

```cpp
SemaphoreHandle_t mutex;
uint8_t recurso_compartilhado = 0;

void tarefa1(void * parameter) {
    while (true) {
        xSemaphoreTake(mutex, portMAX_DELAY);
        recurso_compartilhado++;
        Serial.printf("Tarefa 1: %d\n", recurso_compartilhado);
        xSemaphoreGive(mutex);
        vTaskDelay(500 / portTICK_PERIOD_MS);
    }
}

void tarefa2(void * parameter) {
    while (true) {
        xSemaphoreTake(mutex, portMAX_DELAY);
        recurso_compartilhado += 10;
        Serial.printf("Tarefa 2: %d\n", recurso_compartilhado);
        xSemaphoreGive(mutex);
        vTaskDelay(500 / portTICK_PERIOD_MS);
    }
}
```

---

## 6. Aplicação Prática: Sistema de Monitoramento

### 6.1 Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│              SISTEMA DE MONITORAMENTO                       │
│                                                             │
│   Task Sensores    Task Processamento    Task Display      │
│   (1s)             (2s)                  (500ms)          │
│       │                │                      │             │
│       ▼                ▼                      ▼             │
│   ┌───────┐       ┌─────────┐           ┌─────────┐        │
│   │ Queue │──────►│  Queue  │──────────►│  Queue  │        │
│   └───────┘       └─────────┘           └─────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Código Completo

```cpp
#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include <Wire.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_BME280.h>

// Filas
QueueHandle_t sensorQueue;
QueueHandle_t displayQueue;

// OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// BME280
Adafruit_BME280 bme;

// Estrutura de dados do sensor
typedef struct {
    float temperatura;
    float umidade;
    float pressao;
} SensorData;

void sensorTask(void * parameter) {
    bme.begin(0x76);
    SensorData data;
    
    while (true) {
        data.temperatura = bme.readTemperature();
        data.umidade = bme.readHumidity();
        data.pressao = bme.readPressure() / 100.0F;
        
        xQueueSend(sensorQueue, &data, pdMS_TO_TICKS(100));
        Serial.printf("Sensor: %.1fC, %.1f%%, %.0fhPa\n",
            data.temperatura, data.umidade, data.pressao);
        
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}

void processTask(void * parameter) {
    SensorData data;
    SensorData processed;
    
    while (true) {
        if (xQueueReceive(sensorQueue, &data, pdMS_TO_TICKS(2000))) {
            // Processamento (ex: converter unidades)
            processed.temperatura = data.temperatura * 9/5 + 32; // Fahrenheit
            processed.umidade = data.umidade;
            processed.pressao = data.pressao;
            
            xQueueSend(displayQueue, &processed, pdMS_TO_TICKS(100));
        }
    }
}

void displayTask(void * parameter) {
    display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
    display.clearDisplay();
    
    SensorData data;
    
    while (true) {
        if (xQueueReceive(displayQueue, &data, pdMS_TO_TICKS(1000))) {
            display.clearDisplay();
            display.setTextSize(1);
            display.setCursor(0, 0);
            display.printf("Temp: %.1f F\n", data.temperatura);
            display.printf("Umid: %.1f %%\n", data.umidade);
            display.printf("Press: %.0f hPa", data.pressao);
            display.display();
        }
    }
}

void setup() {
    Serial.begin(115200);
    
    sensorQueue = xQueueCreate(5, sizeof(SensorData));
    displayQueue = xQueueCreate(5, sizeof(SensorData));
    
    xTaskCreate(sensorTask, "Sensor", 3000, NULL, 2, NULL);
    xTaskCreate(processTask, "Process", 2000, NULL, 1, NULL);
    xTaskCreate(displayTask, "Display", 2000, NULL, 1, NULL);
}

void loop() {}
```

---

## 7. DESAFIOS

### DESAFIO 1: LEDs com Tasks Independentes

**Objetivo**: Controlar múltiplos LEDs com frequências diferentes.

### Requisitos:
- LED 1 (GPIO 2): Pisca a cada 500ms
- LED 2 (GPIO 4): Pisca a cada 1s
- LED 3 (GPIO 5): Pisca a cada 2s
- Cada LED em uma task separada

---

### DESAFIO 2: Contador com Semáforo

**Objetivo**: Controlar acesso a variável compartilhada.

### Requisitos:
- 3 tarefas que incrementam um contador
- Usar mutex para proteger o acesso
- Exibir o valor final no Serial

---

### DESAFIO 3: Sistema de Alarme RTOS

**Objetivo**: Sistema de alarme multitarefa.

### Requisitos:
- Task 1: Lê sensor (botão) - alta prioridade
- Task 2: Verifica limiar - média prioridade
- Task 3: Ativa alarme (LED + Serial) - baixa prioridade
- Usar filas para comunicação

---

### DESAFIO 4: Dashboard Serial

**Objetivo**: Exibir status de todas as tasks.

### Requisitos:
- Criar 4 tarefas com contadores
- Task monitora exibe:
  - Nome de cada task
  - Tempo de execução
  - Estado (Running, Ready, Blocked)

---

## 8. Boas Práticas FreeRTOS

1. **Tamanho de stack**: Sempre use stack suficiente (verifique comuxTaskGetStackHighWaterMark)
2. **Prioridades**: Atribua prioridades corretamente (tempo real = maior)
3. **Delay**: Sempre use vTaskDelay() ou vTaskDelayUntil()
4. **ISRs**: Use xSemaphoreGiveFromISR() em interrupções
5. **Mutex vs Semaphore**: Use mutex para recursos, binary semaphore para eventos

---

## 9. Referências

- [FreeRTOS ESP32 Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/api-reference/system/freertos.html)
- [FreeRTOS API Reference](https://www.freertos.org/a00106.html)
- [ESP32 FreeRTOS Examples](https://github.com/espressif/esp-idf/tree/master/examples/system/freertos)
