## WebServer

Nesta aula, vamos dar um passo importante no uso do ESP32: em vez de apenas acender LEDs localmente, vamos transformar a placa em um **servidor web**. Isso significa que ela será capaz de responder requisições HTTP e entregar uma página acessada pelo navegador.

A ideia aqui não é apenas copiar um código pronto. Como este é o primeiro contato com **Wi‑Fi** e **WebServer** no ESP32, o foco será entender o papel de cada parte do programa, inclusive aquelas funções que, à primeira vista, parecem “mágicas”.

---

## Preparando o projeto

Clone o repositório do projeto para acessar o código-fonte do servidor web básico `esp32-webserver-wokwi`:

```bash
git clone https://github.com/arnaldojr/esp32-wokwi
cd esp32-wokwi/esp32-webserver-wokwi
code .
```

Agora, abra o arquivo `esp32-webserver-wokwi.ino`.

---

## Código-base

```cpp
#include <WiFi.h>
#include <WiFiClient.h>
#include <WebServer.h>
#include <uri/UriBraces.h>

#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""
#define WIFI_CHANNEL 6

WebServer server(80);

const int LED1 = 26;
const int LED2 = 27;

bool led1State = false;
bool led2State = false;

void sendHtml() {
  String response = R"(
    <!DOCTYPE html><html>
      <head>
        <title>ESP32 Web Server Demo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          html { font-family: sans-serif; text-align: center; }
          body { display: inline-flex; flex-direction: column; }
          h1 { margin-bottom: 1.2em; }
          h2 { margin: 0; }
          div { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; grid-auto-flow: column; grid-gap: 1em; }
          .btn { background-color: #5B5; border: none; color: #fff; padding: 0.5em 1em;
                 font-size: 2em; text-decoration: none }
          .btn.OFF { background-color: #333; }
        </style>
      </head>

      <body>
        <h1>ESP32 Web Server</h1>

        <div>
          <h2>LED 1</h2>
          <a href="/toggle/1" class="btn LED1_TEXT">LED1_TEXT</a>
          <h2>LED 2</h2>
          <a href="/toggle/2" class="btn LED2_TEXT">LED2_TEXT</a>
        </div>
      </body>
    </html>
  )";

  response.replace("LED1_TEXT", led1State ? "ON" : "OFF");
  response.replace("LED2_TEXT", led2State ? "ON" : "OFF");

  server.send(200, "text/html", response);
}

void setup(void) {
  Serial.begin(115200);
  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD, WIFI_CHANNEL);
  Serial.print("Connecting to WiFi ");
  Serial.print(WIFI_SSID);

  while (WiFi.status() != WL_CONNECTED) {
    delay(100);
    Serial.print(".");
  }

  Serial.println(" Connected!");

  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  server.on("/", sendHtml);

  server.on(UriBraces("/toggle/{}"), []() {
    String led = server.pathArg(0);
    Serial.print("Toggle LED #");
    Serial.println(led);

    switch (led.toInt()) {
      case 1:
        led1State = !led1State;
        digitalWrite(LED1, led1State);
        break;
      case 2:
        led2State = !led2State;
        digitalWrite(LED2, led2State);
        break;
    }

    sendHtml();
  });

  server.begin();
  Serial.println("HTTP server started");
}

void loop(void) {
  server.handleClient();
  delay(2);
}
```

## Entendendo as bibliotecas

### `#include <WiFi.h>`

Essa biblioteca permite usar os recursos de rede Wi‑Fi do ESP32.

É ela que fornece funções como:

- `WiFi.begin(...)`
- `WiFi.status()`
- `WiFi.localIP()`

Sem ela, o ESP32 não conseguiria se conectar à rede sem fio.

### `#include <WiFiClient.h>`

Essa biblioteca oferece suporte para conexões TCP/IP. Neste exemplo, ela não aparece diretamente no código principal, mas faz parte da infraestrutura usada internamente pelo servidor HTTP.

### `#include <WebServer.h>`

Essa é a biblioteca mais importante da aula. Ela permite criar um **servidor web HTTP** no ESP32.

É com ela que fazemos coisas como:

- criar o servidor;
- registrar rotas;
- enviar respostas;
- processar clientes conectados.

### `#include <uri/UriBraces.h>`

Essa biblioteca ajuda a trabalhar com rotas que possuem partes variáveis.

Por exemplo:

- `/toggle/1`
- `/toggle/2`

Em vez de criar uma rota fixa para cada caso, podemos definir um padrão com chaves e depois capturar o valor recebido.

---

## Entendendo a configuração inicial

### Rede Wi‑Fi

```cpp
#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""
#define WIFI_CHANNEL 6
```

Aqui definimos os dados da rede que o ESP32 vai usar para se conectar.

- `WIFI_SSID`: nome da rede Wi‑Fi;
- `WIFI_PASSWORD`: senha da rede;
- `WIFI_CHANNEL`: canal do Wi‑Fi.

No Wokwi, essa configuração é usada para conectar à rede simulada.

### Criação do servidor

```cpp
WebServer server(80);
```

Aqui criamos um objeto chamado `server`.

A porta `80` é a porta padrão do protocolo HTTP. Isso significa que o ESP32 vai “escutar” requisições web nessa porta.

Em termos simples, essa linha diz:

> “Crie um servidor HTTP para atender conexões na porta 80.”

---

## LEDs e variáveis de estado

```cpp
const int LED1 = 26;
const int LED2 = 27;

bool led1State = false;
bool led2State = false;
```

Essas linhas definem:

- os pinos físicos onde os LEDs estão conectados;
- o estado lógico atual de cada LED.

As variáveis `led1State` e `led2State` são importantes porque o programa precisa saber se cada LED está ligado ou desligado para:

- atualizar a saída física com `digitalWrite()`;
- mostrar a informação correta na página HTML.

---

## A função `sendHtml()`

Essa função é uma das partes centrais do programa.

```cpp
void sendHtml() {
```

Ela tem a responsabilidade de montar a página HTML e enviá-la como resposta ao navegador.

### A string HTML

```cpp
String response = R"(
  ...
)";
```

Aqui usamos uma **raw string literal**. Esse recurso do C++ permite escrever textos grandes em várias linhas sem precisar escapar aspas o tempo todo.

Isso é muito útil quando queremos embutir HTML dentro do código.

### Os links da página

```html
<a href="/toggle/1" class="btn LED1_TEXT">LED1_TEXT</a>
<a href="/toggle/2" class="btn LED2_TEXT">LED2_TEXT</a>
```

Quando o usuário clica nesses links, o navegador faz uma requisição para:

- `/toggle/1`
- `/toggle/2`

Essas requisições chegam ao servidor do ESP32, que interpreta a rota e muda o LED correspondente.

### Substituição dinâmica do texto

```cpp
response.replace("LED1_TEXT", led1State ? "ON" : "OFF");
response.replace("LED2_TEXT", led2State ? "ON" : "OFF");
```

Aqui o HTML é adaptado antes de ser enviado.

Se o LED estiver ligado, o texto mostrado será `ON`.
Se estiver desligado, será `OFF`.

### Envio da resposta HTTP

```cpp
server.send(200, "text/html", response);
```

Essa linha é muito importante.

Ela envia a resposta ao navegador com:

- código HTTP `200`: indica sucesso;
- tipo de conteúdo `text/html`: informa que a resposta é uma página web;
- corpo da resposta: o conteúdo armazenado em `response`.

Em outras palavras:

> “Servidor, devolva ao cliente uma página HTML válida.”

---

### Conexão com o Wi‑Fi

```cpp
WiFi.begin(WIFI_SSID, WIFI_PASSWORD, WIFI_CHANNEL);
```

Essa linha inicia a tentativa de conexão com a rede Wi‑Fi.

### Verificando a conexão

```cpp
while (WiFi.status() != WL_CONNECTED) {
  delay(100);
  Serial.print(".");
}
```

Esse laço espera até que a conexão seja concluída.

A função `WiFi.status()` consulta o estado atual do Wi‑Fi.
Enquanto não for `WL_CONNECTED`, o código continua aguardando.

### Obtendo o IP

```cpp
Serial.println(WiFi.localIP());
```

Depois de conectado, o ESP32 recebe um endereço IP na rede.

Esse IP é importante porque será o endereço que o usuário acessará no navegador.

---

## Registrando as rotas

### Rota principal

```cpp
server.on("/", sendHtml);
```

Essa linha diz ao servidor:

> “Quando alguém acessar a rota `/`, execute a função `sendHtml()`.”

Ou seja, quando o navegador acessar a raiz do servidor, o ESP32 responderá com a página HTML.

### Rota dinâmica com `UriBraces`

```cpp
server.on(UriBraces("/toggle/{}"), []() {
```

Aqui temos uma das partes que mais parecem “mágicas”. Vamos dividir:

- `server.on(...)`: registra uma rota no servidor;
- `UriBraces("/toggle/{}")`: define um padrão de rota com um valor variável;
- `[]() { ... }`: é uma função anônima, também chamada de *lambda*, que será executada quando a rota for acessada.

Na prática, isso significa que o servidor aceitará rotas como:

- `/toggle/1`
- `/toggle/2`

### Capturando o argumento da rota

```cpp
String led = server.pathArg(0);
```

Aqui pegamos o valor que apareceu no lugar das chaves `{}`.

Se a rota acessada foi `/toggle/1`, então `led` receberá `"1"`.
Se foi `/toggle/2`, receberá `"2"`.

## A função `server.begin()`

```cpp
server.begin();
```

Essa linha inicia o servidor HTTP.

Sem ela, mesmo com as rotas definidas, o ESP32 não começaria a aceitar conexões.

Podemos pensar nela como o momento em que o servidor “entra no ar”.

---

## A função `loop()`

```cpp
void loop(void) {
  server.handleClient();
  delay(2);
}
```

Essa é outra parte muito importante.

### `server.handleClient()`

Essa função verifica constantemente se algum cliente fez uma requisição HTTP ao servidor.

Se houver uma requisição pendente, ela:

- identifica a rota acessada;
- chama a função correspondente;
- envia a resposta.

Sem essa chamada no `loop()`, o servidor não processaria as requisições recebidas.

Em outras palavras:

> `server.begin()` liga o servidor.  
> `server.handleClient()` mantém o servidor funcionando.


## Compilando o código

Faça o export do binário compilado:

1. selecione a placa correta em `Tools > Board > ESP32 Arduino > ESP32 Dev Module`;
2. clique em `Sketch > Export Compiled Binary` para gerar o binário do projeto.

