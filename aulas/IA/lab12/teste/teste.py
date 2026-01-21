import numpy as np
import requests
import json

# Carregue o conjunto de teste do MNIST
from tensorflow import keras
(x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()
x_test = x_test / 255.0

# Pegue uma imagem de teste
img = x_test[0]
img_input = np.expand_dims(img, axis=0)  # shape (1, 28, 28)

data = json.dumps({"instances": img_input.tolist()})

url = "http://localhost:8501/v1/models/mnist:predict"
response = requests.post(url, data=data, headers={"content-type": "application/json"})

print("Resposta da API:", response.json()) # Exibe a resposta completa da API


# Extraia o dígito previsto
pred_digit = np.argmax(response.json()['predictions'][0])
print("Predito:", pred_digit, "Verdadeiro:", y_test[0])
