# Interrupções no Arduino

## Objetivos

Ao final deste laboratório, você será capaz de:

- Compreender o conceito de interrupções e sua importância em sistemas embarcados
- Diferenciar polling (consulta) de interrupções (evento)
- Implementar rotinas de interrupção usando `attachInterrupt()`
- Desenvolver aplicações reativas mais eficientes

---

## O Problema: Limitações do Polling

Nos laboratórios anteriores, você aprendeu a monitorar botões usando `digitalRead()` dentro da função `loop()`. Essa técnica é chamada de **polling** (consulta contínua).

```c
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

## O que são Interrupções?

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

## Interrupções no Arduino

### Pinos de Interrupção

Nem todos os pinos podem gerar interrupções. No Arduino UNO, apenas os pinos 2 e 3 suportam interrupções externas:

| Pino | Arduino UNO | Arduino Mega |
|------|-------------|--------------|
| 2    | INT0        | INT0         |
| 3    | INT1        | INT1         |
| 21   | -           | INT2         |
| 20   | -           | INT3         |

Para outros pinos, é necessário usar técnicas de *pin change interrupt*, mas isso é mais avançado.

### A função attachInterrupt()

```c
attachInterrupt(digitalPinToInterrupt(pino), ISR, modo);
```

Parâmetros:
- **pino**: Número do pino (2 ou 3 no UNO)
- **ISR**: Nome da função a ser executada (sem parênteses)
- **modo**: Quando a interrupção ocorre

### Modos de Interrupção

| Modo       | Descrição                                              |
|------------|--------------------------------------------------------|
| LOW        | Interrupção ocorre quando pino está em nível LOW     |
| RISING     | Interrupção ocorre na transição de LOW para HIGH      |
| FALLING    | Interrupção ocorre na transição de HIGH para LOW     |
| CHANGE     | Interrupção ocorre em qualquer transição              |

---

## Exemplo Prático: LED com Interrupção

Monte o circuito:

- Botão no pino 2 (com resistor pull-up interno)
- LED no pino 13

Código:

```c
const int ledPin = 13;
const int buttonPin = 2;

volatile bool ledState = false;

void setup() {
    pinMode(ledPin, OUTPUT);
    pinMode(buttonPin, INPUT_PULLUP);
    
    // Configura a interrupção no pino 2
    // RISING = quando soltar o botão (pull-up: LOW -> HIGH)
    attachInterrupt(digitalPinToInterrupt(buttonPin), toggleLED, RISING);
}

void loop() {
    // Loop principal livre para fazer outras coisas!
    digitalWrite(ledPin, ledState ? HIGH : LOW);
}

// Rotina de Serviço de Interrupção (ISR)
// Deve ser a mais curta possível!
void toggleLED() {
    ledState = !ledState;
}
```

### Por que usar `volatile`?

A palavra-chave `volatile` informa ao compilador que a variável pode mudar a qualquer momento, sem aviso. Isso impede otimizações incorretas e garante que a ISR e o loop vejam o mesmo valor.

```c
volatile bool ledState = false;
```

---

## Debounce em Interrupções

Interrupções são muito rápidas! Um botão pode gerar múltiplas interrupções em uma única pressão (debounce mecânico). Veja como resolver:

### Solução 1: Software Debounce na ISR

```c
volatile unsigned long lastInterruptTime = 0;
const unsigned long debounceDelay = 50;  // 50ms

void IRAM_ATTR handleButton() {
    unsigned long currentTime = millis();
    
    // Ignora interrupções muito próximas (debounce)
    if (currentTime - lastInterruptTime > debounceDelay) {
        lastInterruptTime = currentTime;
        
        // Sua lógica aqui
        ledState = !ledState;
    }
}
```

### Solução 2: Usando CHANGE + variável de estado

```c
volatile bool lastButtonState = HIGH;

void IRAM_ATTR handleButton() {
    bool currentState = digitalRead(buttonPin);
    
    // Detecta borda de descida (pressionar)
    if (lastButtonState == HIGH && currentState == LOW) {
        // Botão pressionado!
        ledState = !ledState;
    }
    
    lastButtonState = currentState;
}
```

!!! warning
    Use a macro `IRAM_ATTR` no ESP32 para garantir que a ISR fique na RAM (mais rápido).

---

## Boas Práticas com Interrupções

1. **ISRs devem ser curtas**: Apenas mude variáveis, não faça delays ou Serial.print()
2. **Use `volatile`**: Para variáveis compartilhadas entre ISR e loop
3. **Cuidado com `millis()` dentro de ISRs**: Pode não funcionar corretamente
4. **Não use delay() dentro de ISRs**: blocked
5. **Desabilite interrupções quando necessário**: `noInterrupt()` e `interrupt()`

---

## DESAFIO 1: Contador de Cliques

**Objetivo**: Criar um sistema que conta o número de vezes que um botão é pressionado.

### Requisitos:
- Botão no pino 2
- LED no pino 13
- Cada clique no botão incrementa um contador
- O LED pisca uma vez para cada clique (após o contador)
- Exiba o valor do contador no Serial Monitor

### Código base:

```c
volatile int clickCount = 0;
const int ledPin = 13;
const int buttonPin = 2;

void setup() {
    Serial.begin(9600);
    pinMode(ledPin, OUTPUT);
    pinMode(buttonPin, INPUT_PULLUP);
    
    attachInterrupt(digitalPinToInterrupt(buttonPin), countClick, FALLING);
}

void loop() {
    // Seu código aqui
}

void countClick() {
    // Implemente a lógica de contagem com debounce
}
```

---

## DESAFIO 2: Cronômetro com Botão de Parada de Emergência

**Objetivo**: Criar um cronômetro que pode ser pausado a qualquer momento.

### Requisitos:
- O cronômetro conta segundos automaticamente (usando millis())
- Um botão (pino 2) pára/retoma a contagem
- Um segundo botão (pino 3) reseta o cronômetro
- O tempo atual é exibido no Serial Monitor

### Dica:
Use uma variável volatile para controlar o estado de pause/play.

---

## DESAFIO 3: Sistema de Alarme

**Objetivo**: Criar um alarme que é ativado quando um sensor (fotoresistor ou botão) detecta movimento.

### Requisitos:
- Sensor de toque/passo no pino 2 (simula sensor de movimento)
- LED que indica status (aceso = armado, piscando = disparado)
- Um botão para armar/desarmar o sistema (pino 3)
- Quando armado e movimento detectado → LED pisca rapidamente + mensagem no Serial

### Diagrama de Estados:

```
┌─────────┐   Botão 3    ┌────────┐
│  ARMADO │ ───────────► │ DESAR- │
│         │              │ MADO   │
└─────────┘              └────────┘
    │                          ▲
    │ movemento                │ Botão 3
    ▼                          │
┌──────────────┐               │
│   DISPARADO  │───────────────┘
│   (alarme)   │
└──────────────┘
```

---

## DESAFIO 4: Encoder Rotativo

**Objetivo**: Ler um encoder rotativo para controlar o brilho de um LED.

### Requisitos:
- Encoder rotativo nos pinos 2 e 3 (ambos como interrupção)
- LED no pino 5 (PWM)
- Girar o encoder para direita → aumenta brilho
- Girar para esquerda → diminui brilho

### Exemplo de wiring (genérico):

```
Encoder:  +----+
   A ─────►│    │
   B ─────►│    │
   GND─────┘    │
```

### Dica:
Use dois pinos de interrupção para detectar a direção:

```c
volatile int encoderPos = 0;

void doEncoderA() {
    if (digitalRead(encoderPinB) == HIGH) {
        encoderPos++;
    } else {
        encoderPos--;
    }
}

void doEncoderB() {
    if (digitalRead(encoderPinA) == HIGH) {
        encoderPos--;
    } else {
        encoderPos++;
    }
}
```

---

## Comparando Polling vs Interrupção

| Aspecto           | Polling         | Interrupção     |
|-------------------|-----------------|-----------------|
| Complexidade      | Simples         | Moderada        |
| Latência          | Variável        | Imediata        |
| Uso de CPU        | Alto            | Baixo           |
| Detecção de eventos rápidos | Não | Sim |
| Código reativo    | Não             | Sim             |

---

## Referências

- [Arduino attachInterrupt()](https://www.arduino.cc/reference/en/language/functions/external-interrupts/attachinterrupt/)
- [Interrupts - Arduino Docs](https://www.arduino.cc/en/Reference/Interrupts)
