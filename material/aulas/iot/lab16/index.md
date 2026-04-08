# Lab 16 - Projeto Final: Apresentação e Code Review

## Objetivos

Ao final deste laboratório, você será capaz de:

- Apresentar o projeto desenvolvido
- Demonstrar funcionamento completo
- Realizar code review profissional
- Receber e aplicar feedback

---

## 1. Estrutura da Apresentação

### 1.1 Formato

- **Duração**: 15 minutos por grupo
- **Membros**: 2-4 pessoas
- **Avaliação**: Individual e em grupo

### 1.2 Slides (5 minutos)

| Parte | Tempo | Conteúdo |
|-------|-------|----------|
| Introdução | 1 min | Tema e motivação |
| Hardware | 1 min | Componentes usados |
| Software | 2 min | Arquitetura e decisões técnicas |
| Demo | 1 min | Screenshots/vídeo |

### 1.3 Demonstração (5 minutos)

- Sistema funcionando ao vivo
- Mostrar dashboard
- Simular cenário de uso

### 1.4 Code Review (5 minutos)

- Revisão do código
- Feedback construtivo
- Perguntas da turma

---

## 2. Critérios de Avaliação

### 2.1 Avaliação do Projeto

| Critério | Peso | Descrição |
|----------|------|-----------|
| Funcionalidade | 30% | Sistema funciona conforme requisitos |
| Complexidade | 20% | Uso adequado de tecnologias |
| Documentação | 15% | README, comentários |
| Apresentação | 15% | Clareza e organização |
| Code Review | 20% | Qualidade do código |

### 2.2 Avaliação Individual

| Critério | Peso |
|----------|------|
| Participação no código | 30% |
| Entendimento do projeto | 30% |
| Respostas às perguntas | 20% |
| Postura profissional | 20% |

---

## 3. Code Review

### 3.1 O que Verificar

```cpp
// EXEMPLOS DE PROBLEMAS COMUNS

// 1. Nomes ruins
void d() {}           // RUIM
void processData() {} // BOM

// 2. Números mágicos
digitalWrite(2, 1);           // RUIM
digitalWrite(LED_PIN, HIGH);  // BOM

// 3. Funções longas
void loop() {
    // 500 linhas... RUIM
}

// Separe em funções menores:
void loop() {
    readSensors();
    processData();
    sendData();
}

// 4. Sem tratamento de erros
float temp = readTemp();  // RUIM: e se falhar?

// Trate erros:
float temp;
if (!readTempSafe(&temp)) {
    temp = DEFAULT_TEMP;
}

// 5. Delay no loop (evitar quando possível)
// Use millis() ou RTOS tasks
```

### 3.2 Checklist de Code Review

- [ ] Código compila sem warnings
- [ ] Nomes descritivos
- [ ] Funções pequenas (< 50 linhas)
- [ ] Constantes nomeadas
- [ ] Comentários em código complexo
- [ ] Tratamento de erros
- [ ] Sem credenciais hardcoded
- [ ] Código versionado no Git

---

## 4. Rubrica de Avaliação

### 4.1 Projeto (0-7,0)

| Nota | Descrição |
|------|-----------|
| 7,0 | Excepcional: supera requisitos, código limpo |
| 6,0 | Muito bom: atende todos requisitos |
| 5,0 | Bom: atende requisitos principais |
| 4,0 | Regular: atende requisitos mínimos |
| 3,0 | Insuficiente: funcionalidades incompletas |

### 4.2 Apresentação (0-3,0)

| Nota | Descrição |
|------|-----------|
| 3,0 | Excelente: clara, bem organizada |
| 2,0 | Boa: organizada, compreensão boa |
| 1,0 | Regular: desorganizada ou incompleta |

---

## 5. Modelo de Feedback

### 5.1 Para o Autor

```
# Code Review: [Projeto]

## Pontos Fortes
- [Ponto 1]
- [Ponto 2]

## Pontos a Melhorar
- [Ponto 1]
- [Ponto 2]

## Sugestões
- [Sugestão 1]

## Nota Sugerida: X,Y
```

### 5.2 Perguntas para discussion

1. Quais desafios técnicos você enfrentou?
2. O que faria diferente em um segundo projeto?
3. Como você melhoraria a segurança?
4. Como otimizaria consumo de energia?

---

## 6. Encerramento

### 6.1 O que foi aprendido

Ao longo deste curso, você aprendeu:

- Programação de sistemas embarcados
- Protocolos de comunicação IoT
- Desenvolvimento de dashboards
- Boas práticas de engenharia
- Trabalho em equipe

### 6.2 Próximos Passos

- Continuar praticando
- Explorar TinyML
- Aprender Embedded Linux
- Contribuir com projetos open source

### 6.3 Feedback

Por favor, preencha o formulário de feedback do curso!

---

## 7. Materiais de Apoio

### Livros
- "Making Embedded Systems" - Elecia White
- "IoT Inc" - Bruce Sinclair
- "TinyML" - Pete Warden

### Comunidades
- ESP32 Forum
- Reddit r/embedded
- Stack Overflow

### Projetos para praticar
- Home Assistant
- ESPHome
- Tasmota
