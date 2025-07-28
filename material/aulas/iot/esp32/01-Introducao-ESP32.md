# Introdução ao ESP32

## O que é o ESP32?

O ESP32 é um microcontrolador de baixo custo e baixo consumo de energia que integra Wi-Fi e Bluetooth em um único chip. Desenvolvido pela Espressif Systems, o ESP32 se tornou um dos componentes mais populares para projetos de Internet das Coisas (IoT) devido à sua versatilidade e poder computacional.

## Características Principais

- **Processador**: Dual-core Tensilica Xtensa LX6 de 32 bits (até 240MHz)
- **Memória**: 520 KB de SRAM
- **Conectividade**: Wi-Fi 802.11 b/g/n (2.4 GHz) e Bluetooth 4.2 (BLE)
- **GPIO**: Até 36 pinos
- **Periféricos**: ADC, DAC, I²C, SPI, UART, CAN, PWM, etc.
- **Segurança**: Criptografia por hardware

## Diferenças entre ESP32 e Arduino

| Característica | ESP32 | Arduino UNO |
|----------------|-------|-------------|
| Processador | Dual-core 32-bit até 240MHz | Single-core 8-bit 16MHz |
| Memória RAM | 520 KB | 2 KB |
| WiFi | Integrado | Necessita shield |
| Bluetooth | Integrado | Necessita shield |
| GPIO | Até 36 pinos | 14 pinos digitais, 6 analógicos |
| Preço | $3-$10 | $20-$25 |

## Modelos Comuns de ESP32

1. **ESP32-DevKitC**: Placa de desenvolvimento básica
2. **ESP32-WROOM-32**: Módulo com antena PCB integrada
3. **ESP32-WROVER**: Módulo com antena externa e memória PSRAM adicional
4. **TTGO T-Display**: ESP32 com display LCD colorido
5. **M5Stack**: ESP32 em formato modular com display e sensores

## Por que usar ESP32 para IoT?

- **Conectividade Integrada**: WiFi e Bluetooth prontos para uso
- **Baixo Consumo**: Modos de deep sleep para aplicações com bateria
- **Alto Desempenho**: Processador dual-core permite aplicações mais complexas
- **Baixo Custo**: Excelente custo-benefício para projetos IoT
- **Ecossistema Rico**: Ampla comunidade e muitas bibliotecas disponíveis

## Aplicações Comuns

- Automação residencial
- Monitoramento remoto
- Controle industrial
- Wearables e dispositivos médicos
- Estações meteorológicas
- Sistemas de segurança

Na próxima aula, configuraremos o ambiente de desenvolvimento para programar o ESP32 usando a IDE do Arduino.
