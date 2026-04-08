# Lab 7 - Node-RED e Dashboard

## Objetivos

Ao final deste laboratório, você será capaz de:

- Instalar e configurar o Node-RED
- Criar fluxos de processamento de dados
- Integrar com MQTT
- Desenvolver dashboards visuais
- Implementar alertas e automações

---

## 1. Introdução ao Node-RED

### 1.1 O que é Node-RED?

Node-RED é uma ferramenta de programação visual baseada em fluxos, ideal para IoT. Permite conectar dispositivos, APIs e serviços online de forma intuitiva.

```
┌─────────────────────────────────────────────────────────────┐
│                     NODE-RED                                 │
│                                                             │
│   ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐          │
│   │Input │───►│Process│───►│Output│───►│Dashboard│       │
│   │ MQTT │    │ JSON  │    │ Debug│    │  Chart │        │
│   └──────┘    └──────┘    └──────┘    └──────┘          │
│                                                             │
│   Programação visual: conecta nós para criar fluxos        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Instalação do Node-RED

### 2.1 Instalação Global

```bash
# Instala Node.js (se necessário)
# https://nodejs.org/

# Instala Node-RED globalmente
sudo npm install -g --unsafe-perm node-red

# Iniciar
node-red

# Acessar: http://localhost:1880
```

### 2.2 Instalação de Nós Adicionais

```bash
# Nós para dashboard
npm install node-red-dashboard

# Nós para MQTT
npm install node-red-node-mqtt

# Nós para serial
npm install node-red-node-serialport
```

---

## 3. Interface do Node-RED

### 3.1 Áreas Principais

```
┌─────────────────────────────────────────────────────────────┐
│                    NODE-RED UI                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Palette │              Flow Editor                    │  │
│  │         │                                               │  │
│  │ [nodes] │    ┌────┐      ┌────┐      ┌────┐        │  │
│  │         │    │inject│────►│function│────►│debug│       │  │
│  │ mqtt    │    └────┘      └────┘      └────┘        │  │
│  │ debug   │                                               │  │
│  │ function│                                               │  │
│  │         │                                               │  │
│  └─────────┴───────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Debug                    │ Dashboard                  │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Nós Básicos

| Nó | Função |
|-----|--------|
| **Inject** | Injeta mensagem (teste) |
| **Debug** | Exibe no painel de debug |
| **Function** | Executa código JavaScript |
| **mqtt in/out** | Conecta ao broker MQTT |
| **http in/out** | Cria endpoints HTTP |

---

## 4. Primeiro Fluxo: Hello World

### 4.1 Criando o Fluxo

1. Arraste um nó **inject** para o canvas
2. Arraste um nó **debug** para o canvas
3. Conecte os nós
4. Configure o inject com payload de string: "Hello Node-RED!"
5. Clique em **Deploy**
6. Clique no botão do inject e veja o resultado no debug

### 4.2 Fluxo:

```
[{"id":"inject1","type":"inject","topic":"","payload":"Hello Node-RED!","payloadType":"str","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":150,"y":100,"wires":[["debug1"]]},{"id":"debug1","type":"debug","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","x":350,"y":100,"wires":[]}]
```

---

## 5. Integração com MQTT

### 5.1 Configurando MQTT

1. Instale o nó MQTT se necessário
2. Arraste o nó **mqtt in**
3. Configure:
   - Broker: `192.168.1.100` (seu broker local)
   - Topic: `casa/sala/#`
4. Conecte a um nó **debug**

### 5.2 Fluxo: Receber Dados do ESP32

```
[{"id":"mqtt-in","type":"mqtt-broker","broker":"192.168.1.100","port":"1883","clientid":"","auto_connect":true,"usetls":false,"protocolVersion":"4","keepalive":"60","cleanSession":true,"autoUnsubscribe":true,"x":150,"y":150,"wires":[["debug1","json1"]]}]
```

### 5.3 Converter JSON

Arraste um nó **json** entre MQTT e debug para converter o payload.

---

## 6. Dashboard Node-RED

### 6.1 Instalação do Dashboard

```bash
npm install node-red-dashboard
```

Reinicie o Node-RED. Você verá novos nós na paleta.

### 6.2 Nós do Dashboard

| Nó | Função |
|-----|--------|
| **text** | Exibe texto |
| **gauge** | Mostrador/indicador |
| **chart** | Gráfico de linha |
| **slider** | Controle deslizante |
| **switch** | Botão liga/desliga |
| **button** | Botão clicável |
| **date picker** | Seleção de data |

### 6.3 Criando um Dashboard

1. Arraste um nó **mqtt in** - Topic: `casa/sala/temperatura`
2. Arraste um nó **gauge** (do grupo Dashboard)
3. Configure o gauge:
   - Label: Temperatura
   - Range: 0 a 50
   - Units: °C
4. Conecte: mqtt → gauge
5. Deploy e veja o resultado em `http://localhost:1880/ui`

---

## 7. Fluxo Completo: Estação Meteorológica

### 7.1 Arquitetura

```
ESP32 ──► MQTT ──► Node-RED ──► Dashboard
            │
            ▼
        [Temperatura, Umidade, Pressão]
```

### 7.2 Fluxo JSON

```json
[
    {
        "id": "mqtt-temp",
        "type": "mqtt in",
        "broker": "192.168.1.100",
        "topic": "casa/sala/temperatura",
        "x": 100,
        "y": 100,
        "wires": [["gauge-temp"]]
    },
    {
        "id": "gauge-temp",
        "type": "ui_gauge",
        "name": "Temperatura",
        "group": "weather",
        "min": "0",
        "max": "50",
        "unit": "°C",
        "x": 300,
        "y": 100,
        "wires": []
    },
    {
        "id": "mqtt-hum",
        "type": "mqtt in",
        "broker": "192.168.1.100",
        "topic": "casa/sala/umidade",
        "x": 100,
        "y": 200,
        "wires": [["gauge-hum"]]
    },
    {
        "id": "gauge-hum",
        "type": "ui_gauge",
        "name": "Umidade",
        "group": "weather",
        "min": "0",
        "max": "100",
        "unit": "%",
        "x": 300,
        "y": 200,
        "wires": []
    }
]
```

---

## 8. Controle via Dashboard

### 8.1 Enviando Comandos

1. Arraste um nó **ui_switch**
2. Configure:
   - On payload: "ON"
   - Off payload: "OFF"
3. Arraste um nó **mqtt out**
4. Configure Topic: `casa/sala/led`
5. Conecte: switch → mqtt out

### 8.2 Código ESP32 para Receber

```cpp
void callback(char* topic, byte* payload, unsigned int length) {
    String message = "";
    for (int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    
    if (message == "ON") {
        digitalWrite(LED_BUILTIN, HIGH);
    } else if (message == "OFF") {
        digitalWrite(LED_BUILTIN, LOW);
    }
}
```

---

## 9. Alertas e Automação

### 9.1 Alerta de Temperatura

1. Arraste um nó **mqtt in** (temperatura)
2. Arraste um nó **function**
3. Configure o código:

```javascript
var temp = msg.payload;
var threshold = 30;

if (temp > threshold) {
    msg.payload = {
        notification: "Alerta! Temperatura alta: " + temp + "°C",
        value: temp,
        level: "danger"
    };
    return msg;
}
return null;
```

4. Conecte a um nó **ui_toast** para notificação

### 9.2 Gráfico Histórico

1. Use o nó **ui_chart**
2. Configure:
   - Type: line chart
   - X-axis key: timestamp
   - Y-axis key: payload

---

## 10. DESAFIOS

### DESAFIO 1: Dashboard Completo

**Objetivo**: Criar dashboard com múltiplos gauges.

### Requisitos:
- Temperatura (0-50°C)
- Umidade (0-100%)
- Pressão (900-1100 hPa)
- Gráfico de linha para temperatura

---

### DESAFIO 2: Controle de LEDs

**Objetivo**: Controlar LEDs via dashboard.

### Requisitos:
- 2 switches no dashboard
- Publicar MQTT ao mudar estado
- ESP32 recebe comando e controla LED

---

### DESAFIO 3: Alerta Automático

**Objetivo**: Notificar quando temperatura ultrapassar limite.

### Requisitos:
- Definir limite de temperatura
- Quando ultrapassar:
  - Mostrar notificação
  - Mudar cor do gauge
  - Ligar LED no ESP32

---

### DESAFIO 4: Histórico de Dados

**Objetivo**: Salvar dados para análise.

### Requisitos:
- Usar nó file para salvar CSV
- Timestamp + valores
- Gráfico com últimos 50 pontos

---

## 11. Referências

- [Node-RED Documentation](https://nodered.org/docs/)
- [Node-RED Dashboard](https://flows.nodered.org/node/node-red-dashboard)
- [MQTT Nodes](https://flows.nodered.org/node/node-red-node-mqtt)
