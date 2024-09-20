# CHECKPOINT 5

- O objetivo do checkpoint é avaliar a compreensão dos estudantes em relação ao conteúdo ministrado pela disciplina.

> Obrigatório utilizar como base o código de exemplo do jogo da memória disponível neste repositório:
>   - [Jogo da Memória](jogomemoria/jogomemoria.ino)

**Materiais Necessários:**
    
- ▶️ Arduino UNO
- ▶️ LEDs
- ▶️ Botões
- ▶️ Buzzer
- ▶️ Resistores, jumpers e protoboard

### Ideia Geral

![](https://a-static.mlcdn.com.br/800x560/brinquedo-jogo-de-memoria-genius-original-estrela/brinquedos4fun/getl-02/39032d051bde243d3c66f081141c1ee9.jpg)

Neste checkpoint, o desafio é desenvolver o protótipo do jogo da memória "Genius" com Arduino, com as seguintes características:

- 4 (ou mais) LEDs de cores diferentes
- 4 (ou mais) Botões
- 1 Buzzer
- Possuir Interface de comunicação serial

Vamos explorar mais detalhadamente o funcionamento do protótipo e os critérios de avaliação.

## Genius Arduino

O jogo tem a dinâmica padrão de qualquer outro jogo da memória: Inicia-se o game, os LEDs piscam em sequência aleatória, e o jogador precisa reproduzir essa sequência pressionando os botões correspondentes. Acertando, avança para o próximo nível; errando, é o fim do jogo.

### Atenção aos requisitos funcionais

**Requisitos Funcionais Básicos:**

- **LEDs:** O jogo deve possuir 4 LEDs de cores diferentes.
- **Botões:** O jogo deve possuir 4 botões, cada botão corresponde a um LED.
- **Buzzer:** O jogo deve possuir 1 Buzzer que deve emitir uma frequência específica (nota musical) para cada cor de LED, tanto na sequência aleatória quanto ao pressionar das teclas.

- **FASES DO JOGO:** O jogo deve possuir 4 niveis de dificuldade.
- **Monitor Serial:** O jogo deve possuir permitir ao usuário jogar tanto pelos botões físicos quanto pelo monitor serial do Arduino.

**Requisitos Funcionais Avançados:**

- **FASES DO JOGO:** O jogo deve possuir uma quantidade "infinita" de niveis de dificuldade.
- **Nivel de dificuldade** Crie a função ``nivelDificuldade`` que implementa a seleção de dificuldade do jogo em iniciante, médio e hard. Essa função altera a velocidade com que os leds piscam.
- **Salvar Pontuações** Usar uma memória EEPROM no Arduino para salvar as pontuações mais altas, permitindo que os jogadores vejam e tentem superar seus recordes anteriores.
- **Comunicação Bluetooth:** Faça a comunicação via bluetooth com o notebook ou celular para jogar o jogo.
- **Comando de Voz:** Através de um script em Python, ao receber a informação da cor, o computador anuncia em voz alta a cor acionada.

### Construindo uma Caixa Personalizada:

- **Caixa:** Utilize o site [https://www.festi.info/boxes.py/](https://www.festi.info/boxes.py/) para criar uma caixa personalizada para o seu protótipo, de forma simples, online e gratuita.

![](genius-arduino.jpeg)

> **Links úteis para criar seu case:**

>    - [Manual do Mundo](https://www.youtube.com/watch?v=BwU0hSmWYdA&ab_channel=ManualdoMundo)
>    - [Angelo Conti](https://www.youtube.com/watch?v=4cI-WXnPCzU&ab_channel=AngeloConti)
>    - [Maker Space 307](https://www.youtube.com/watch?v=1wWAfO6k0t4&t=391s&ab_channel=MakerSpace307)
>    - [Smoke & Mirrors](https://www.youtube.com/watch?v=8q7HpDpOJ1U)

- **Especificações para Máquina CNC:** Selecione a espessura de 3mm para o MDF.

## **Rubrica:**

| Nota | Itens |
|------|-------|
| 4    | Atende aos requisitos funcionais básicos |
| 7    | Atende aos requisitos funcionais básicos + caixa personalizada|
| 8    | Atende aos requisitos funcionais básicos + caixa personalizada + 1 Requisito Funcional Avançado |
| 9    | Atende aos requisitos funcionais básicos + caixa personalizada + 2 Requisitos Funcionais Avançados |
| 10   | Atende aos requisitos funcionais básicos + caixa personalizada + 3 Requisitos Funcionais Avançados |