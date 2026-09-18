    const int ledPin = 9; // Pino do LED (suporta PWM)
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