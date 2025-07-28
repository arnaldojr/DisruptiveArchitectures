# Configuração do Ambiente de Desenvolvimento para ESP32

Nesta aula, configuraremos o ambiente necessário para programar o ESP32 usando a IDE do Arduino, que é uma das formas mais acessíveis para iniciar o desenvolvimento.

## Requisitos

- Computador com Windows, macOS ou Linux
- Placa ESP32 (DevKit, NodeMCU-ESP32, etc.)
- Cabo USB adequado para sua placa
- Conexão com a internet

## Instalação da IDE do Arduino

1. Acesse o site oficial do Arduino: [https://www.arduino.cc/en/software](https://www.arduino.cc/en/software)
2. Baixe a versão adequada para seu sistema operacional
3. Instale o software seguindo as instruções para seu sistema

## Adicionando Suporte ao ESP32 na IDE do Arduino

### Método 1: Usando o Gerenciador de Placas

1. Abra a IDE do Arduino
2. Vá para **Arquivo > Preferências** (ou **Arduino > Preferências** no macOS)
3. No campo "URLs Adicionais para Gerenciadores de Placas", adicione:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Clique em "OK"
5. Vá para **Ferramentas > Placa > Gerenciador de Placas**
6. Pesquise por "esp32"
7. Instale o pacote "ESP32 by Espressif Systems"

### Método 2: Instalação Manual (alternativa)

Se o método 1 não funcionar, você pode instalar manualmente:

1. Clone o repositório do ESP32 para Arduino:
   ```bash
   git clone https://github.com/espressif/arduino-esp32.git
   ```
2. Execute o script de instalação na pasta do repositório (específico para cada sistema operacional)

## Testando a Instalação

1. Conecte sua placa ESP32 ao computador via USB
2. Na IDE do Arduino, selecione:
   - **Ferramentas > Placa > ESP32 Arduino > [Seu modelo de ESP32]**
   - **Ferramentas > Porta > [Porta COM onde o ESP32 está conectado]**

3. Abra um exemplo simples:
   - **Arquivo > Exemplos > 01.Basics > Blink**

4. Modifique o código para usar o LED interno do ESP32 (pino 2 na maioria das placas):

```cpp
// LED_BUILTIN pode não funcionar para ESP32, use o pino 2 diretamente
void setup() {
  pinMode(2, OUTPUT);
}

void loop() {
  digitalWrite(2, HIGH);
  delay(1000);
  digitalWrite(2, LOW);
  delay(1000);
}
```

5. Clique no botão "Carregar" (a seta para a direita)
6. Aguarde a compilação e o upload
7. Verifique se o LED na placa está piscando

## Resolução de Problemas Comuns

### Placa não aparece na lista de portas

- Verifique o cabo USB (alguns cabos são apenas para alimentação)
- Instale os drivers necessários:
  - CP210x: [Drivers Silicon Labs](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers)
  - CH340: [Drivers CH340](https://sparks.gogo.co.nz/ch340.html)

### Erro de permissão no Linux

```bash
sudo usermod -a -G dialout $USER
```
(Necessário fazer logout e login novamente)

### Falha na comunicação durante upload

- Mantenha pressionado o botão "BOOT" durante o início do upload
- Em algumas placas, é necessário pressionar o botão "RESET" após iniciar o upload

## Editores Alternativos

Além da IDE do Arduino, você também pode usar:

1. **Visual Studio Code com extensão PlatformIO**:
   - Mais recursos
   - Melhor editor de código
   - Gerenciamento de bibliotecas automático

2. **ESP-IDF (Espressif IoT Development Framework)**:
   - Framework oficial da Espressif
   - Acesso a todos os recursos do ESP32
   - Curva de aprendizado mais íngreme

Na próxima aula, começaremos com projetos básicos para conhecer melhor o ESP32.
