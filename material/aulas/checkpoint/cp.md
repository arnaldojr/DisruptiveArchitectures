## CHECKPOINT

- O objetivo do checkpoint é avaliar a compreensão dos estudantes em relação ao conteúdo ministrado pela disciplina.

> **Base Obrigatória: O projeto deve ser desenvolvido com base no código de exemplo do jogo da memória disponível em**:
>
<!-- >   - [Código base Jogo da Memória](jogomemoria/jogomemoria.ino) -->
>   - [Wokwi Jogo da Memória](https://wokwi.com/projects/409559148540388353)

**Materiais Necessários:**
    
- ▶️ Arduino UNO
- ▶️ LEDs
- ▶️ Botões
- ▶️ Buzzer
- ▶️ Resistores, jumpers e protoboard

**obs**: Todos os testes e simulações devem ser realizados nos simuladores` Wokwi` ou `Tinkercad`.

### Ideia Geral

![](https://a-static.mlcdn.com.br/800x560/brinquedo-jogo-de-memoria-genius-original-estrela/brinquedos4fun/getl-02/39032d051bde243d3c66f081141c1ee9.jpg)

Neste checkpoint, o desafio é desenvolver o protótipo do jogo da memória `Genius` usando Arduino, com as seguintes características:

- 4 (ou mais) LEDs de cores diferentes
- 4 (ou mais) Botões
- 1 Buzzer
- Possuir Interface de comunicação serial

Vamos explorar mais detalhadamente o funcionamento do protótipo e os critérios de avaliação.

## Como o Jogo Funciona:

- O jogo começa com uma sequência aleatória de LEDs piscando.
- O jogador deve repetir a sequência pressionando os botões correspondentes.
- Se acertar, avança para o próximo nível; se errar, o jogo termina.

Essa `base do jogo` já está pronta! no [Wokwi Jogo da Memória](https://wokwi.com/projects/409559148540388353) que você deve usar de base para o seu projeto. 

### Atenção aos requisitos funcionais

**Requisitos Funcionais Básicos:**

- **LEDs:** Mínimo de 4 LEDs, cada um de uma cor diferente.
- **Botões:** Mínimo de 4 botões, cada um associado a um LED específico.
- **Buzzer:** Deve emitir uma nota musical única para cada cor de LED, tanto na sequência gerada pelo jogo quanto ao pressionar os botões.
- **Fases do Jogo:** O jogo deve ter pelo menos 4 níveis de dificuldade.
- **Monitor Serial:** O jogador deve conseguir interagir com o jogo tanto pelos botões físicos quanto pelo monitor serial do Arduino.

**Requisitos Funcionais Avançados:**

- **FASES DO JOGO:** Implementar uma quantidade "infinita" de níveis, aumentando a dificuldade progressivamente.
- **Nivel de dificuldade** Criar a função `nivelDificuldade` para ajustar a velocidade dos LEDs (iniciante, médio, hard).
- **Salvar Pontuações** Usar a memória EEPROM do Arduino para armazenar as maiores pontuações, permitindo que os jogadores consultem e superem seus recordes.
- **OUTRAS IDÉIAS:** O grupo pode propor outras funcionalidades avançadas, mas deve ser aprovado pelo professor.
<!-- 
### Construindo uma Caixa Personalizada:

- **Caixa:** Utilize o site [https://www.festi.info/boxes.py/](https://www.festi.info/boxes.py/) para criar uma caixa personalizada para o seu protótipo, de forma simples, online e gratuita.

![](genius-arduino.jpeg)

> **Links úteis para criar seu case:**

>    - [Manual do Mundo](https://www.youtube.com/watch?v=BwU0hSmWYdA&ab_channel=ManualdoMundo)
>    - [Angelo Conti](https://www.youtube.com/watch?v=4cI-WXnPCzU&ab_channel=AngeloConti)
>    - [Maker Space 307](https://www.youtube.com/watch?v=1wWAfO6k0t4&t=391s&ab_channel=MakerSpace307)
>    - [Smoke & Mirrors](https://www.youtube.com/watch?v=8q7HpDpOJ1U)

- **Especificações para Máquina CNC:** Selecione a espessura de 3mm para o MDF. -->

## **Rubrica:**

| Nota | Itens |
|------|-------|
| 5    | Atende aos requisitos funcionais básicos |
| 6    | Atende aos requisitos funcionais básicos + 1 Requisito Funcional Avançado |
| 7    | Atende aos requisitos funcionais básicos + 2 Requisitos Funcionais Avançados |
| 8   | Atende aos requisitos funcionais básicos + 3 Requisitos Funcionais Avançados |
| 10   | Atende aos requisitos funcionais básicos + 4 Requisitos Funcionais Avançados |