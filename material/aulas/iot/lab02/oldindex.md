# Lab 2 - GPIO e Interrupções no ESP32

## Objetivos

Ao final deste laboratório, você será capaz de:

- Compreender o conceito de interrupções e sua importância em sistemas embarcados
- Diferenciar polling (consulta) de interrupções (evento)
- Implementar rotinas de interrupção no ESP32 usando `attachInterrupt()`
- Desenvolver aplicações reativas mais eficientes

---

## 1. O Problema: Limitações do Polling

Nos laboratórios anteriores, você aprendeu a monitorar botões usando `digitalRead()` dentro da função `loop()`. Essa técnica é chamada de **polling** (consulta contínua).

```cpp
void loop() {
    int botao = digitalRead(2);  // Verifica o botão a cada ciclo
    if (botao == LOW) {
        // Ação quando pressionado
    }
}
```

### Problemas do Polling

1. **Desperdício de recursos**: O processador fica verificando algo que raramente acontece
2. **Latência variável**: O tempo entre o evento e a resposta depende de quanto tempo o loop demora
3. **Impossibilidade de detectar eventos muito rápidos**: Se o evento durar menos que um ciclo do loop, será perdido

---

## 2. O que são Interrupções?

Uma **interrupção** é um sinal que faz o processador pausar imediatamente o que está fazendo e executar uma rotina especial chamada **ISR** (Interrupt Service Routine).

```
┌─────────────────────────────────────────────────────────────┐
│                    MODO POLLING                              │
│                                                             │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│   │  Faz    │ -> │  Faz    │ -> │  Faz    │ -> ...      │
│   │ outra   │    │ outra   │    │ outra   │              │
│   │coisa 1  │    │coisa 2  │    │coisa 3  │              │
│   └──────────┘    └──────────┘    └──────────┘             │
│        ▲                                                    │
│        │   O processador fica "esperando"                  │
│        │   o tempo todo, mesmo sem necessidade              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 MODO INTERRUPÇÃO                            │
│                                                             │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│   │  Faz    │    │  Faz    │    │  Faz    │               │
│   │ outra   │ ──►│ outra   │ ──►│ outra   │ ──► ...     │
│   │coisa 1  │    │coisa 2  │    │coisa 3  │              │
│   └──────────┘    └──────────┘    └──────────┘             │
│                          ▲                                  │
│                          │                                  │
│   ┌─────────────┐       │                                  │
│   │ BOTÃO       │───────┘  O processador só trabalha       │
│   │ PRESSIONADO │          quando realmente precisa!        │
│   └─────────────┘                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Interrupções no ESP32

### 3.1 Pinos de Interrupção

O ESP32 possui pinos específicos que suportam interrupções. Qualquer pino GPIO pode ser usado para interrupção (diferente do Arduino UNO que tem pinos limitados).

### 3.2 A função attachInterrupt()

```cpp
attachInterrupt(digitalPinToInterrupt(pino), ISR, modo);
```

Parâmetros:
- **pino**: Número do pino GPIO
- **ISR**: Nome da função a ser executada (sem parênteses)
- **modo**: Quando a interrupção ocorre

### 3.3 Modos de Interrupção

| Modo       | Descrição                                              |
|------------|--------------------------------------------------------|
| LOW        | Interrupção ocorre quando pino está em nível LOW     |
| RISING     | Interrupção ocorre na transição de LOW para HIGH      |
| FALLING    | Interrupção ocorre na transição de HIGH para LOW     |
| CHANGE     | Interrupção ocorre em qualquer transição              |

---

## 4. Exemplo Prático: LED com Interrupção

### 4.1 Hardware

Monte o circuito:
- Botão no pino 4 (com resistor pull-up interno)
- LED no pino 2 (LED onboard do ESP32)

### 4.2 Código

```cpp
#include <Arduino.h>

const int LED_BUILTIN = 2;
const int BUTTON_PIN = 4;

volatile bool ledState = false;
volatile unsigned long lastInterruptTime = 0;
const unsigned long DEBOUNCE_DELAY = 50;

void IRAM_ATTR handleButton() {
    unsigned long currentTime = millis();
    
    if (currentTime - lastInterruptTime > DEBOUNCE_DELAY) {
        lastInterruptTime = currentTime;
        ledState = !ledState;
    }
}

void setup() {
    Serial.begin(115200);
    pinMode(LED_BUILTIN, OUTPUT);
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    
    attachInterrupt(digitalPinToInterrupt(BUTTON_PIN), handleButton, FALLING);
}

void loop() {
    digitalWrite(LED_BUILTIN, ledState ? HIGH : LOW);
    Serial.printf("LED State: %d\n", ledState);
    delay(100);
}
```

### 4.3 Por que usar `volatile` e `IRAM_ATTR`?

- **`volatile`**: Informa ao compilador que a variável pode mudar a qualquer momento, sem aviso. Isso impede otimizações incorretas.

```cpp
volatile bool ledState = false;
```

- **`IRAM_ATTR`**: No ESP32, garante que a ISR fique na RAM (IRAM) para acesso mais rápido. Sem isso, a ISR pode causar problemas.

```cpp
void IRAM_ATTR handleButton() {
    // Código da ISR
}
```

---

## 5. Debounce em Interrupções

Botões mecânicos "tremem" eletricamente ao pressionar/soltar (bounce), causando múltiplas interrupções indesejadas.

### Solução: Debounce por Software

```cpp
volatile unsigned long lastInterruptTime = 0;
const unsigned long DEBOUNCE_DELAY = 50;

void IRAM_ATTR handleButton() {
    unsigned long currentTime = millis();
    
    // Ignora interrupções muito próximas (debounce)
    if (currentTime - lastInterruptTime > DEBOUNCE_DELAY) {
        lastInterruptTime = currentTime;
        
        // Sua lógica aqui
        ledState = !ledState;
    }
}
```

---

## 6. Boas Práticas com Interrupções

1. **ISRs devem ser curtas**: Apenas mude variáveis, não faça delays ou Serial.print()
2. **Use `volatile`**: Para variáveis compartilhadas entre ISR e loop
3. **Use `IRAM_ATTR`**: No ESP32, para garantir ISR na RAM
4. **Cuidado com `millis()` dentro de ISRs**: Pode não funcionar corretamente em todas as situações
5. **Não use delay() dentro de ISRs**: Bloqueia o sistema
6. **Não faça operações complexas na ISR**: Comunicação serial, alocação de memória, etc.

---

## 7. DESAFIOS

### DESAFIO 1: Contador de Cliques

**Objetivo**: Criar um sistema que conta o número de vezes que um botão é pressionado.

### Requisitos:
- Botão no pino 4
- LED onboard (pino 2)
- Cada clique no botão incrementa um contador
- O LED pisca uma vez para cada clique
- Exiba o valor do contador no Serial Monitor

### Código base:

```cpp
volatile uint16_t clickCount = 0;
const uint8_t LED_PIN = 2;
const uint8_t BUTTON_PIN = 4;
volatile unsigned long lastInterruptTime = 0;
const unsigned long DEBOUNCE_DELAY = 50;

void IRAM_ATTR handleButton() {
    unsigned long currentTime = millis();
    if (currentTime - lastInterruptTime > DEBOUNCE_DELAY) {
        lastInterruptTime = currentTime;
        clickCount++;
    }
}

void setup() {
    Serial.begin(115200);
    pinMode(LED_PIN, OUTPUT);
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(BUTTON_PIN), handleButton, FALLING);
}

void loop() {
    // Implemente: piscar LED conforme clickCount
}
```

---

### DESAFIO 2: Cronômetro com Botão de Emergência

**Objetivo**: Criar um cronômetro que pode ser pausado a qualquer momento.

### Requisitos:
- O cronômetro conta segundos automaticamente (usando millis())
- Um botão (pino 4) pára/retoma a contagem
- Um segundo botão (pino 5) reseta o cronômetro
- O tempo atual é exibido no Serial Monitor

### Dica:
Use uma variável volatile para controlar o estado de pause/play.

---

### DESAFIO 3: Sistema de Alarme

**Objetivo**: Criar um alarme que é ativado quando um sensor (botão) detecta movimento.

### Requisitos:
- Sensor (botão) no pino 4 (simula sensor de movimento)
- LED onboard indica status (aceso = armado, piscando = disparado)
- Um botão para armar/desarmar o sistema (pino 5)
- Quando armado e movimento detectado → LED pisca rapidamente + mensagem no Serial

### Diagrama de Estados:

```
┌─────────┐   Botão 5    ┌────────┐
│  ARMADO │ ───────────► │ DESAR- │
│         │              │ MADO   │
└─────────┘              └────────┘
    │                          ▲
    │ movimento                 │ Botão 5
    ▼                          │
┌──────────────┐               │
│   DISPARADO  │───────────────┘
│   (alarme)   │
└──────────────┘
```

---

### DESAFIO 4: Encoder Rotativo

**Objetivo**: Ler um encoder rotativo para controlar o brilho de um LED PWM.

### Requisitos:
- Encoder rotativo nos pinos 4 e 5 (ambos como interrupção)
- LED onboard PWM (pino 2)
- Girar o encoder para direita → aumenta brilho
- Girar para esquerda → diminui brilho

### Dica:
Use dois pinos de interrupção para detectar a direção:

```cpp
volatile int encoderPos = 0;
const uint8_t ENCODER_A = 4;
const uint8_t ENCODER_B = 5;

void IRAM_ATTR doEncoderA() {
    if (digitalRead(ENCODER_B) == HIGH) {
        encoderPos++;
    } else {
        encoderPos--;
    }
}

void IRAM_ATTR doEncoderB() {
    if (digitalRead(ENCODER_A) == HIGH) {
        encoderPos--;
    } else {
        encoderPos++;
    }
}
```

---

## 8. Comparação: Polling vs Interrupção

| Aspecto           | Polling         | Interrupção     |
|-------------------|-----------------|-----------------|
| Complexidade      | Simples         | Moderada        |
| Latência          | Variável        | Imediata        |
| Uso de CPU        | Alto            | Baixo           |
| Detecção de eventos rápidos | Não | Sim |
| Código reativo    | Não             | Sim             |

---

## 9. Referências

- [ESP32 Arduino Core - attachInterrupt](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/gpio.html#attachinterrupt)
- [ESP32 IRAM_ATTR](https://docs.espressif.com/projects/esp-idf/en/latest/api-guides/general-notes.html#iram-internal-ram-attribute)
