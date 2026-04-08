# Lab 11 - Edge AI com TinyML

## Objetivos

Ao final deste laboratório, você será capaz de:

- Compreender conceitos de Machine Learning em dispositivos embarcados
- Implementar inferência de modelos TensorFlow Lite no ESP32
- Treinar modelos simples para classificação
- Desenvolver aplicações de TinyML

---

## 1. Introdução ao TinyML

### 1.1 O que é Edge AI?

Edge AI (Inteligência Artificial na Borda) significa executar modelos de ML diretamente no dispositivo, sem necessidade de nuvem.

```
┌─────────────────────────────────────────────────────────────┐
│               CLOUD AI vs EDGE AI                          │
│                                                             │
│   CLOUD AI:                EDGE AI:                        │
│   ┌──────┐                 ┌──────┐                        │
│   │Sensor │───► Internet ──►│Cloud │                        │
│   └──────┘                 │  ML  │                        │
│                           └──────┘                        │
│   Latência alta             Latência zero                  │
│  依赖 internet              Funciona offline               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 TensorFlow Lite

TensorFlow Lite (TFLite) é uma versão leve do TensorFlow para dispositivos embarcados.

---

## 2. Instalação

### 2.1 Biblioteca TensorFlow Lite para ESP32

Adicione ao `platformio.ini`:

```ini
lib_deps =
    tensorflow/tensorflow-lite@^2.4.0
    ; ou use o exemplo do ESP-IDF
```

### 2.2 Ferramentas Necessárias

- Python 3.8+
- TensorFlow
- TensorFlow Lite for Microcontrollers

---

## 3. Treinando um Modelo Simples

### 3.1 Classificador de Gestos (Aproximar/Longe)

```python
import tensorflow as tf
import numpy as np

# Gerar dados sintéticos
# Classe 0: sensor < 2000 (perto)
# Classe 1: sensor > 3000 (longe)

X = np.random.randint(0, 4096, (1000, 1))
y = (X > 2000).astype(int)

# Normalizar
X = X / 4096.0

# Criar modelo
model = tf.keras.Sequential([
    tf.keras.layers.Dense(8, activation='relu', input_shape=(1,)),
    tf.keras.layers.Dense(4, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Treinar
model.fit(X, y, epochs=50)

# Converter para TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

# Salvar
with open('model.tflite', 'wb') as f:
    f.write(tflite_model)
```

### 3.2 Converter para Array C

```bash
xxd -i model.tflite > model_data.cc
```

---

## 4. Inferência no ESP32

### 4.1 Código com TensorFlow Lite

```cpp
#include <TensorFlowLite.h>
#include "tensorflow/lite/micro/all_ops_resolver.h"
#include "tensorflow/lite/micro/micro_error_reporter.h"
#include "tensorflow/lite/micro/micro_interpreter.h"
#include "tensorflow/lite/schema/schema_generated.h"
#include "model.h"

// Variáveis do TFLite
tflite::MicroErrorReporter tflErrorReporter;
tflite::AllOpsResolver tflOpsResolver;

const tflite::Model* tflModel = nullptr;
tflite::MicroInterpreter* tflInterpreter = nullptr;
TfLiteTensor* tflInputTensor = nullptr;
TfLiteTensor* tflOutputTensor = nullptr;

constexpr int tensorArenaSize = 8 * 1024;
uint8_t tensorArena[tensorArenaSize];

void setup() {
    Serial.begin(115200);
    
    // Carregar modelo
    tflModel = tflite::GetModel(g_model);
    if (tflModel->version() != TFLITE_SCHEMA_VERSION) {
        Serial.println("Modelo incompatível!");
        return;
    }
    
    // Criar interpretador
    tflInterpreter = new tflite::MicroInterpreter(
        tflModel, tflOpsResolver, tensorArena, tensorArenaSize, &tflErrorReporter
    );
    
    tflInterpreter->AllocateTensors();
    
    tflInputTensor = tflInterpreter->input(0);
    tflOutputTensor = tflInterpreter->output(0);
    
    Serial.println("TF Lite iniciado!");
}

void loop() {
    // Ler sensor
    int sensorValue = analogRead(34);
    
    // Normalizar (0-1)
    tflInputTensor->data.f[0] = sensorValue / 4096.0;
    
    // Inferência
    TfLiteStatus invokeStatus = tflInterpreter->Invoke();
    
    if (invokeStatus == kTfLiteOk) {
        float prediction = tflOutputTensor->data.f[0];
        
        if (prediction > 0.5) {
            Serial.println("Longe (classe 1)");
        } else {
            Serial.println("Perto (classe 0)");
        }
    }
    
    delay(1000);
}
```

---

## 5. Exemplo: Detecção de Gestos

### 5.1 Modelo Treinado para 3 Gestos

```
Gesture A: Agitar para cima/baixo
Gesture B: Agitar para esquerda/direita  
Gesture C: Girar
```

### 5.2 Código de Inferência

```cpp
#include <TensorFlowLite.h>

// Definições simplificadas
constexpr int NUM_GESTURES = 3;
const char* GESTURE_NAMES[NUM_GESTURES] = {"cima", "baixo", "parado"};

void predictGesture(float* inputData) {
    // Executar inferência
    tflInterpreter->Invoke();
    
    // Encontrar maior probabilidade
    int maxIndex = 0;
    float maxValue = tflOutputTensor->data.f[0];
    
    for (int i = 1; i < NUM_GESTURES; i++) {
        if (tflOutputTensor->data.f[i] > maxValue) {
            maxValue = tflOutputTensor->data.f[i];
            maxIndex = i;
        }
    }
    
    Serial.printf("Gesto: %s (%.2f)\n", GESTURE_NAMES[maxIndex], maxValue);
}
```

---

## 6. Exemplo: Reconhecimento de Voz

### 6.1 Modelo de Detecção de Palavras-Chave

O ESP32 pode executar modelos de reconhecimento de voz simples:

```cpp
// Simulação de reconhecimento de comandos de voz
const char* commands[] = {"ok_glass", "stop", "up", "down", "left", "right"};

void processAudioFeatures(float* mels) {
    // Executar inferência
    tflInterpreter->Invoke();
    
    // Verificar comando
    int detected = -1;
    for (int i = 0; i < 6; i++) {
        if (tflOutputTensor->data.f[i] > 0.7) {
            detected = i;
            break;
        }
    }
    
    if (detected >= 0) {
        Serial.printf("Comando: %s\n", commands[detected]);
    }
}
```

---

## 7. DESAFIOS

### DESAFIO 1: Classificador de Temperatura

**Objetivo**: Classificar temperatura em 3 níveis.

- Frio: < 18°C
- Normal: 18-25°C  
- Quente: > 25°C

### DESAFIO 2: Detector de Movimento

**Objetivo**: Usar acelerômetro para detectar movimento.

- Parado
- Movendo lentamente
- Movendo rapidamente

### DESAFIO 3: Reconhecimento de Padrão

**Objetivo**: Detectar padrões em sinais de sensor.

- Usar dados do potenciômetro
- Detectar: crescente, decrescente, estável

### DESAFIO 4: Previsor de Valor

**Objetivo**: Prever próximo valor baseado em histórico.

- Usar 5 valores anteriores
- Prever valor 6

---

## 8. Referências

- [TensorFlow Lite for ESP32](https://github.com/espressif/tensorflow-lite-esp32)
- [TinyML Book](https://tinymlbook.com/)
- [Edge Impulse](https://www.edgeimpulse.com/) - Platforma sem código
