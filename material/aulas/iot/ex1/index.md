## Comunicação Serial 

A comunicação serial é fundamental para a troca de dados entre o microcontrolador (o arduino no nosso caso) e outros dispositivos, como um computador, outro arduino, um celular.

No arduino usamos a classe `Serial` que oferece várias opções e métodos para gerenciar essa comunicação. 

!!! tip
    Documentação oficial: [https://www.arduino.cc/reference/pt/language/functions/communication/serial/](https://www.arduino.cc/reference/pt/language/functions/communication/serial/)

Aqui estão as principais:

### Iniciando a comunicação serial:

- `Serial.begin(baudRate);` - Inicia a comunicação serial com a taxa de transmissão especificada.

```c
void setup() {
    Serial.begin(9600);
}
```

!!! tip
    A taxa de transmissão padrão é de `9600` bps (bits por segundo), mas outros valores podem ser utilizados conforme a necessidade do projeto. Confira [a tabela de taxas de transmissão mais comuns](https://lucidar.me/en/serialib/most-used-baud-rates-table/) para saber mais.

### Enviando dados pela serial:

- `Serial.print(data);` - Envia dados para a porta serial, `sem pular para uma nova linha`.
- `Serial.println(data);` - Envia dados para a porta serial, `seguido por um caractere de nova linha (\n)`.

```c
void loop() {

    Serial.print("Hello, World!");
    Serial.println("Hello, World!");
  
}
```

### Recebendo dados pela serial:

A leitura de dados da porta serial no Arduino acontece quando você precisa receber informações de outros dispositivos, como sensores, computadores ou outros microcontroladores. 

Antes de tentar ler os dados, é importante verificar se há bytes disponíveis na porta serial. Isso pode ser feito utilizando a função `Serial.available()`, que retorna o número de bytes prontos para serem lidos:

```c
void loop() {

    if (Serial.available() > 0) {
        // Há dados disponíveis para leitura
    }  
}
```
!!! tip 
    Certifique-se de sempre verificar a disponibilidade de dados antes de tentar lê-los, evitando assim erros ou falhas no processamento de informações inexistentes.

Depois de confirmar que há dados disponíveis, você pode utilizar diversas funções da classe Serial para ler esses dados. As funções mais comuns são:

- `Serial.read();` - Lê um único byte da serial. O byte é retornado como um número inteiro entre 0 e 255. Se não houver dados disponíveis, a função retorna -1. Ideal para leituras byte a byte.
- `Serial.readString();` - Lê a entrada serial como uma `String` até que um caractere de nova linha (`
`) seja encontrado ou até que o tempo limite seja atingido. Útil para receber comandos ou mensagens de texto completas.
- `Serial.readStringUntil(character);` - Lê a entrada serial como uma `String` até que o caractere especificado seja encontrado.
- `Serial.parseInt();` - Lê o próximo valor inteiro da porta serial, ignorando caracteres não numéricos até encontrar um número. A leitura continua até encontrar um caractere que não faça parte do número.
- `Serial.parseFloat();` - Lê o próximo valor em ponto flutuante até encontrar um caractere que não seja parte do número, incluindo o ponto decimal.

```c
void loop() {
    // Lendo um único byte
    Serial.println("Digite unico byte");
    while (Serial.available() == 0) {} // Aguarda digitar
    int valor = Serial.read();
    Serial.print("Byte lido: ");
    Serial.println(valor);
    Serial.println();
    
    
    // Lendo uma string completa
    Serial.println("Digite uma string completa");
    while (Serial.available() == 0) {} // Aguarda digitar
    String valorString = Serial.readString();
    Serial.print("String recebida: ");
    Serial.println(valorString);
    Serial.println();
    
    // Lendo uma string até encontrar um caractere específico
    Serial.println("Digite uma string com ; no final");
    while (Serial.available() == 0) {} // Aguarda digitar
    String partialString = Serial.readStringUntil(';');
    Serial.print("String parcial até ';': ");
    Serial.println(partialString);
    Serial.println();
    
    // Lendo um valor inteiro
    Serial.println("Digite um valor do tipo inteiro");
    while (Serial.available() == 0) {} // Aguarda digitar
    int intValue = Serial.parseInt();
    Serial.print("Inteiro lido: ");
    Serial.println(intValue);
    Serial.println();
      
    // Lendo um valor de ponto flutuante
    Serial.println("Digite um valor do tipo float");
    while (Serial.available() == 0) {} // Aguarda digitar
    float floatValue = Serial.parseFloat();
    Serial.print("Float lido: ");
    Serial.println(floatValue);
    Serial.println();
}
```


### Outros métodos úteis:

- `Serial.setTimeout(time);` - O `time` determina quanto tempo a função aguardará antes de desistir da leitura, caso os dados não estejam disponíveis.
