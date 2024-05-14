## O que esse código faz?

Este código de exemplo demonstra o uso de PWM

## Circuito protoboard

![](botao_pot_millis.png)

## Código

```c
    const int ledPin = 11; // Pino do LED (suporta PWM)
    const int potPin = A0; // Pino do potenciômetro
    
    void setup() {
      pinMode(ledPin, OUTPUT);
    }
    
    void loop() {
      int sensorValue = analogRead(potPin); // Lê o valor do potenciômetro
      int pwmValue = map(sensorValue, 0, 1023, 0, 255); // Mapeia o valor lido para o intervalo do PWM (0-255)
      analogWrite(ledPin, pwmValue); // Define o duty cycle do PWM
      delay(10);
    }
```

??? note "Circuito simulador"
    ![](botao_pot_millis.png)

## Links para Download

* [Código arduino](pwm.ino)

* [Thinkercad online](https://www.tinkercad.com/things/1S2zV5j5P5o-captivating-mox-duino/editel?sharecode=4vGvV8WZFFHk9q3zqYJbc_-C8oGJRKoRn7zfk1dfQdk)

