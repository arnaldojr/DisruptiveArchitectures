import tensorflow as tf
from tensorflow import keras


(x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()
x_train, x_test = x_train / 255.0, x_test / 255.0

model = keras.Sequential([
    keras.layers.Flatten(input_shape=(28, 28)),
    keras.layers.Dense(128, activation='relu'),
    keras.layers.Dense(10, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

model.fit(x_train, y_train, epochs=2, validation_split=0.1)


# # salva o modelo no formato HDF5
# model.save("mnist_model.h5") ## mais antigo

# # salve o modelo no formato keras
# model.save("mnist_model.keras") ## mais novo

# Salve o modelo no formato SavedModel (obrigatório pro TensorFlow Serving)
model.export("mnist_model/1")
