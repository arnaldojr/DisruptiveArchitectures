
# TensorFlow Serving - End-to-End

Projeto exemplo de treinamento, exportação e deploy de um modelo MNIST com TensorFlow 2 e serving via Docker (Bitnami ou oficial).


## Estrutura do Projeto

```
.
├── main.py               # Script de treinamento e exportação do modelo
├── mnist_model/          # Diretório do modelo exportado (formato SavedModel)
│   └── 1/
│       ├── assets
│       ├── fingerprint.pb
│       ├── saved_model.pb
│       └── variables/
│           ├── variables.data-00000-of-00001
│           └── variables.index
├── teste.py              # Script Python para testar a API REST
└── test_inference.ipynb  # (Opcional) Notebook de teste via API REST
```

## 1. Treinando e exportando o modelo

```sh
python3 main.py
```

Isso gera a pasta `mnist_model/1/` com o modelo no formato correto para serving.


## 2. Servindo o modelo com Docker

**Comando completo:**

```sh
docker run -d --name tfserving_mnist -p 8501:8501 \
  -v "$PWD/mnist_model:/models/mnist" \
  tensorflow/serving \
  --rest_api_port=8501 \
  --model_name=mnist \
  --model_base_path=/models/mnist
```

### IMPORTANTE:

> No Mac M1/M2 (ARM64): se der erro, adicione a flag `--platform=linux/arm64/v8` após o docker run.
>
> No Windows, Linux, Mac Intel: não precisa dessa flag.
>
> Você pode usar a imagem oficial (tensorflow/serving) ou Bitnami (bitnami/tensorflow-serving:latest). Ambas são compatíveis.

**Comando completo para Mac M1/M2:**

```sh
docker run --platform=linux/arm64/v8 -d --name tfserving_mnist -p 8501:8501 \
  -v "$PWD/mnist_model:/bitnami/tensorflow-serving/models/mnist" \
  bitnami/tensorflow-serving:latest \
  tensorflow_model_server \
    --rest_api_port=8501 \
    --model_name=mnist \
    --model_base_path=/bitnami/tensorflow-serving/models/mnist

```

### Explicação do comando, linha a linha:

- `docker run`: Cria e executa um novo container.
- `--platform=linux/arm64/v8`: Especifica a arquitetura ARM64 (necessário em Macs M1/M2).
- `-d`: Roda em segundo plano (background).
- `--name tfserving_mnist`: Dá um nome ao container para facilitar logs, remoção etc.
- `-p 8501:8501`: Mapeia a porta 8501 do container para a 8501 do host (API REST).
- `-v "$PWD/mnist_model:/bitnami/tensorflow-serving/models/mnist"`: Monta o diretório local do modelo dentro do container no local esperado pelo TensorFlow Serving.
- `bitnami/tensorflow-serving:latest`: Imagem Docker utilizada.
- `tensorflow_model_server`: Comando que roda o servidor do TensorFlow Serving.
- `--rest_api_port=8501`: Porta REST da API.
- `--model_name=mnist`: Nome lógico do modelo (usado nos endpoints).
- `--model_base_path=/bitnami/tensorflow-serving/models/mnist`:Caminho do modelo dentro do container (deve bater com o volume acima).


## 3. Verificando o status do modelo

Após rodar o container, teste no terminal:

```sh
curl http://localhost:8501/v1/models/mnist
```

Deve retornar:

```json
{
 "model_version_status": [
  {
   "version": "1",
   "state": "AVAILABLE",
   "status": {
    "error_code": "OK",
    "error_message": ""
   }
  }
 ]
}
```

## 4. Testando a inferência com Python

Use o script `teste.py`:

```sh
python3 teste.py
```

Saída esperada (exemplo):

```sh
Predito: 7 Verdadeiro: 7
```


## 5. Teste via notebook

Rode o `test_inference.ipynb` para explorar batch prediction, visualização, análise de erro, etc.


## Observações

- Para atualizar o modelo, basta exportar uma nova versão na pasta `mnist_model/2/` e reiniciar o container.
- Se quiser automatizar o deploy, use um script `deploy.sh`.
- Para projetos maiores, considere Docker Compose e/ou integração com aplicações web.

