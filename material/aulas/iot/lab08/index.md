# Lab 8 - Checkpoint 1: Avaliação Prática

## Instruções Gerais

- **Duração**: 90 minutos
- **Plataforma**: Wokwi (Arduino simulado)
- **Nota**: 10,0 pontos
- **Proibido**: Consultar materiais externos

---

## Parte 1: GPIO e Interrupções (3,0 pontos)

### Exercício 1.1: Configuração de Pinos (1,0 ponto)

Configure o pino 2 como saída digital e o pino 3 como entrada com pull-up interno.

```c
// Utilize este código base:
const uint8_t PIN_LED = 2;
const uint8_t PIN_BOTAO = 3;

void setup() {
    // Configure o pino do LED como saída
    // Configure o pino do botão como entrada com pull-up
    
    Serial.begin(9600);
}

void loop() {
    // Verifique o estado do botão e escreva no Serial
    Serial.println(digitalRead(PIN_BOTAO));
    delay(100);
}
```

### Exercício 1.2: Interrupção (2,0 pontos)

Implemente uma interrupção no pino 3 que alterna o estado do LED a cada pressão do botão. Use debounce de 50ms.

```c
// Código base fornecido:
const uint8_t PIN_LED = 2;
const uint8_t PIN_BOTAO = 3;

volatile bool ledState = false;
// Adicione variável para debounce

void setup() {
    pinMode(PIN_LED, OUTPUT);
    pinMode(PIN_BOTAO, INPUT_PULLUP);
    
    // Configure a interrupção
    
    Serial.begin(9600);
}

void loop() {
    digitalWrite(PIN_LED, ledState ? HIGH : LOW);
}

// Implemente a ISR com debounce
```

---

## Parte 2: Comunicação Serial e JSON (3,0 pontos)

### Exercício 2.1: Parser de Comandos (2,0 pontos)

Receba comandos via Serial e execute ações:

- `LIGAR` - Liga LED
- `DESLIGAR` - Desliga LED
- `STATUS` - Imprime estado atual

```c
// Código base:
String comando = "";
const uint8_t PIN_LED = 2;

void setup() {
    Serial.begin(9600);
    pinMode(PIN_LED, OUTPUT);
    Serial.println("Sistema pronto. Comandos: LIGAR, DESLIGAR, STATUS");
}

void loop() {
    if (Serial.available() > 0) {
        // Leia o comando
        // Compare (ignore case)
        // Execute a ação apropriada
    }
}
```

### Exercício 2.2: JSON Serial (1,0 ponto)

Envie dados no formato JSON pela serial:

```json
{"temperatura": 25.5, "umidade": 60.0, "led": 1}
```

```c
// Use ArduinoJson (simulado com strings)
void sendJson(float temp, float hum, bool led) {
    // Formate e envie: Serial.println("{\"temperatura\":" + ... + "}");
}
```

---

## Parte 3: Máquina de Estados (4,0 pontos)

### Exercício 3.1: Semáforo com FSM (2,5 pontos)

Implemente um semáforo com FSM:
- Estados: VERMELHO, AMARELO, VERDE
- Transição automática a cada 3 segundos
- Botão no pino 3: força estado AMARELO (emergência)

```c
// Enumeração dos estados
enum Estado { VERMELHO, AMARELO, VERDE };
enum Estado estadoAtual = VERMELHO;
unsigned long tempoAnterior = 0;
const unsigned long INTERVALO = 3000;

const uint8_t LED_V = 4;  // Verde
const uint8_t LED_A = 5;   // Amarelo
const uint8_t LED_R = 6;   // Vermelho
const uint8_t BOTAO = 3;

void setup() {
    // Configure pinos
}

void loop() {
    unsigned long tempoAtual = millis();
    
    if (tempoAtual - tempoAnterior >= INTERVALO) {
        tempoAnterior = tempoAtual;
        // Mude de estado
    }
    
    // Atualize LEDs conforme estado
}
```

### Exercício 3.2: Sistema de Alarme (1,5 pontos)

Implemente um alarme simples:
- Estado ARMADO: LED verde aceso
- Estado DISPARADO: LED vermelho piscando
- Botão sensor: Pino 3
- Botão arme/desarme: Pino 4

```
Transições:
- Início → ARMADO (botão arme)
- ARMADO + sensor → DISPARADO
- DISPARADO + botão arme → ARMADO
```

---

## Parte 4: Debugging (Tempo Extra)

Se terminar antes, responda:

1. Por que usamos `volatile` em variáveis compartilhadas com ISRs? (0,5 pontos)

2. Qual a diferença entre `delay()` e `millis()`? (0,5 pontos)

---

## Rubrica de Avaliação

| Critério | Pontuação Máxima |
|----------|-----------------|
| Parte 1: GPIO + Interrupções | 3,0 |
| Parte 2: Serial + JSON | 3,0 |
| Parte 3: FSM | 4,0 |
| **Total** | **10,0** |

---

## Tempo por Parte

- Parte 1: ~25 minutos
- Parte 2: ~25 minutos
- Parte 3: ~35 minutos
- Revisão: ~5 minutos

Boa sorte!
