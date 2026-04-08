# Lab 14 - Projeto Final: Fase 1 - Arquitetura

## Objetivos

Ao final deste laboratório, você será capaz de:

- Definir requisitos do projeto
- Criar arquitetura do sistema
- Selecionar componentes
- Documentar o design

---

## 1. Definindo o Projeto

### 1.1 Requisitos do Projeto

O projeto final deve incluir:

| Requisito | Mínimo | Bônus |
|-----------|--------|-------|
| Sensores | 2 tipos | 3+ tipos |
| Conectividade | WiFi | WiFi + BLE |
| Protocolo | MQTT | MQTT + HTTP |
| Dashboard | Node-RED | Dashboard + App |
| Energia | USB | Bateria + Solar |
| Segurança | TLS | TLS + Auth |

### 1.2 Ideias de Projetos

```
┌─────────────────────────────────────────────────────────────┐
│                  IDEIAS DE PROJETOS                          │
│                                                             │
│   1. Estação Meteorológica IoT                              │
│      - BME280 (temp, hum, press)                           │
│      - LDR (luz)                                           │
│      - Anemômetro (velocidade vento)                       │
│      - Display OLED                                        │
│      - MQTT + Node-RED                                      │
│                                                             │
│   2. Sistema de Irrigação Inteligente                       │
│      - Umidade solo                                        │
│      - DHT22 (temperatura)                                 │
│      - Bomba d'água                                        │
│      - Display LCD                                         │
│      - MQTT + Dashboard                                      │
│                                                             │
│   3. Sistema de Monitoramento Industrial                    │
│      - Sensores múltiplos                                  │
│      - BLE para configuração                               │
│      - Alertas                                             │
│      - Logging de dados                                    │
│                                                             │
│   4. Rastreador GPS Pet                                    │
│      - GPS module                                          │
│      - BLE para proximidade                               │
│      - Bateria                                             │
│      - App mobile                                          │
│                                                             │
│   5. Casa Inteligente                                      │
│      - Múltiplas salas                                     │
│      - Relés para luzes                                    │
│      - Sensores de movimento                               │
│      - Controle por app                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Template de Documentação

### 2.1 Documento de Requisitos

```
# Projeto: [Nome do Projeto]

## 1. Descrição
[Descrição breve do projeto]

## 2. Requisitos Funcionais
- RF01: [Requisito]
- RF02: [Requisito]

## 3. Requisitos Não-Funcionais
- RNF01: [Requisito]
- RNF02: [Requisito]

## 4. Hardware
- [Lista de componentes]

## 5. Software
- [Bibliotecas necessárias]

## 6. Arquitetura
[Diagrama de blocos]

## 7. Cronograma
- Semana 1: [Atividade]
- Semana 2: [Atividade]
```

---

## 3. Arquitetura de Referência

### 3.1 Diagrama de Blocos

```
┌─────────────────────────────────────────────────────────────┐
│                  ARQUITETURA DE REFERÊNCIA                   │
│                                                             │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐              │
│   │Sensores │───►│ ESP32   │───►│  WiFi   │              │
│   └─────────┘    └─────────┘    └────┬────┘              │
│                                      │                      │
│                                      ▼                      │
│                               ┌─────────┐                 │
│                               │ Broker  │                 │
│                               │ MQTT    │                 │
│                               └────┬────┘                 │
│                                      │                      │
│                    ┌─────────────────┼─────────────────┐   │
│                    ▼                 ▼                 ▼   │
│              ┌─────────┐      ┌─────────┐      ┌─────────┐│
│              │ Node-RED│      │  Cloud  │      │   App   ││
│              │Dashboard│      │ (AWS)   │      │ Mobile  ││
│              └─────────┘      └─────────┘      └─────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Lista de Componentes

| Componente | Quantidade | Preço Estimado |
|------------|------------|----------------|
| ESP32 DevKit | 1 | R$ 45 |
| BME280 | 1 | R$ 30 |
| DHT22 | 1 | R$ 25 |
| OLED 0.96" | 1 | R$ 25 |
| Módulo Relé | 2 | R$ 20 |
| Fonte 5V | 1 | R$ 20 |
| Jumpers | 1 kit | R$ 15 |
| Protoboard | 1 | R$ 20 |

---

## 4. Atividades do Lab 14

### 4.1 Definição do Projeto

Cada grupo deve:

1. **Escolher tema** do projeto
2. **Listar requisitos** funcionais
3. **Selecionar sensores** e atuadores
4. **Definir arquitetura** de comunicação
5. **Criar diagrama** de blocos
6. **Apresentar** para validação

### 4.2 Apresentação

Cada apresentação deve ter:
- 5 minutos de duração
- Tema e objetivo
- Lista de componentes
- Arquitetura proposta
- Cronograma de implementação

---

## 5. Critérios de Avaliação

| Critério | Peso |
|----------|------|
| Clareza dos requisitos | 20% |
| Viabilidade técnica | 20% |
| Complexidade apropriada | 20% |
| Documentação | 20% |
| Apresentação | 20% |

---

## 6. Próximos Passos

| Lab | Atividade |
|-----|-----------|
| Lab 15 | Implementação do hardware e software |
| Lab 16 | Testes, demonstração e code review |
