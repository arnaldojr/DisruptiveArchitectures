## YOLO - You Only Look Once

- [Notebook 1](yolo.ipynb)
- [Notebook 2](yolo1.ipynb)
- [Notebook 3](yolo2.ipynb)


Modelo popular de detecção de objetos e segmentação de imagens, foi desenvolvido por Joseph Redmon e Ali Farhadi na Universidade de Washington. Lançado em 2015, o YOLO ganhou popularidade por sua alta velocidade e precisão.

> Você não precisa implementar do zero desde versão V1. 
> Você precisa **usar** YOLO efetivamente. O contexto histórico serve apenas para **entender por que** YOLO é dominante hoje.

```
2015: YOLOv1 - "Eureka moment"
├── Primeira detecção em tempo real real
└── Mudou paradigma da área forever

2018: YOLOv3 - "Consolidação"
├── Multi-scale detection
└── Tornou-se padrão industrial

2020: YOLOv5 - "Democratização"  
├── PyTorch implementation
├── API amigável (Ultralytics)
└── Adoção massiva

2023: YOLOv8 - "Unificação"
├── Multi-task (detection + segmentation + pose)
├── Anchor-free simplification
└── Estado atual da arte

2025: YOLOv12 - "Estado da arte"
└── Estado atual da arte
```

### **Documentação Oficial:**
- **Ultralytics Docs:** https://docs.ultralytics.com/
- **GitHub:** https://github.com/ultralytics/ultralytics
- **Google Colab Examples:** https://colab.research.google.com/github/ultralytics/ultralytics/

### Filosofia Central (Imutável desde 2015)

O YOLO resolve o problema fundamental da detecção de objetos com uma abordagem elegante:

> **"Analise a imagem inteira uma única vez e preveja simultaneamente onde estão TODOS os objetos"**

### Família YOLOv8

```
┌─────────────┬─────────┬─────────┬──────────┐
│   Modelo    │  mAP    │   FPS   │  Params  │
├─────────────┼─────────┼─────────┼──────────┤
│  YOLOv8`n`    │  37.3%  │  165+   │   3.2M   │
│  YOLOv8`s`    │  44.9%  │  120    │  11.2M   │
│  YOLOv8`m`    │  50.2%  │   90    │  25.9M   │
│  YOLOv8`l`    │  52.9%  │   65    │  43.7M   │
│  YOLOv8`x`    │  53.9%  │   45    │  68.2M   │
└─────────────┴─────────┴─────────┴──────────┘
```

## Arquitetura Atual Simplificada

```
┌─────────────┐
│   INPUT     │ ← Imagem 640×640 (padrão)
│   IMAGE     │
└─────────────┘
       ↓
┌─────────────┐
│  BACKBONE   │ ← Extração de features hierárquicas
│ (CSPDarknet)│   • P3: 80×80 (objetos pequenos)
│             │   • P4: 40×40 (objetos médios)  
│             │   • P5: 20×20 (objetos grandes)
└─────────────┘
       ↓
┌─────────────┐
│    NECK     │ ← Fusão multi-escala (PANet)
│  (PANet)    │   Combina informações de todas as escalas
└─────────────┘
       ↓
┌─────────────┐
│    HEAD     │ ← Predições finais (Anchor-free)
│ (Decoupled) │   • Classificação
│             │   • Regressão (coordenadas)
└─────────────┘
       ↓
┌─────────────┐
│   OUTPUT    │ ← [x, y, w, h, conf, class_probs]
│ DETECTIONS  │
└─────────────┘
```

### Setup 

```bash
# Instalar Ultralytics (versão atual)
pip install ultralytics

# Verificar instalação
yolo version
```

### Detecção em 3 Linhas de Código

```python
from ultralytics import YOLO

# Carregar modelo pré-treinado
model = YOLO('yolov8n.pt')  # Download automático na primeira vez

# Detectar objetos
results = model('sua_imagem.jpg')

# Visualizar resultados
results[0].show()  # Mostra imagem com detecções
```

### Detecção em Webcam (Tempo Real)

```python
import cv2
from ultralytics import YOLO

model = YOLO('yolov8n.pt')
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    # Detecção em tempo real
    results = model(frame, stream=True, verbose=False)
    
    for result in results:
        # Desenhar detecções
        annotated_frame = result.plot()
        cv2.imshow('YOLO Webcam', annotated_frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

## Treinamento Personalizado

Podemos realizar um treinamento customizado para uma determinada classe de objetos que queremos detectar, por meio de "transfer learning", para isso precisamos basicamente que o dataset seja montado da seguinte forma:

### Estrutura do Dataset YOLO

```
meu_dataset/
├── images/
│   ├── train/
│   │   ├── img001.jpg
│   │   └── img002.jpg
│   └── val/
│       ├── img003.jpg
│       └── img004.jpg
├── labels/
│   ├── train/
│   │   ├── img001.txt  # Anotações YOLO format
│   │   └── img002.txt
│   └── val/
│       ├── img003.txt
│       └── img004.txt
└── data.yaml  # Configuração do dataset
```

### Formato de Anotação YOLO

```
# Cada linha no arquivo .txt representa um objeto:
# class_id x_center y_center width height
# (todas as coordenadas normalizadas 0-1)

0 0.5 0.3 0.2 0.4    # Pessoa no centro-superior
1 0.8 0.7 0.15 0.25  # Carro no canto inferior direito
```

### Arquivo de Configuração (data.yaml)

O arquivo `.yaml` possui as diretivas de configuração para o treinamento do modelo, deve ser passado o caminho para os dados e as classes

```yaml
# data.yaml
path: /caminho/para/meu_dataset
train: images/train
val: images/val

names:
  0: pessoa
  1: carro
  2: bicicleta

nc: 3  # número de classes
```

### Treinamento 

```python
from ultralytics import YOLO

# Carregar modelo base (transfer learning)
model = YOLO('yolov8n.pt')

# Treinar no seu dataset
results = model.train(
    data='data.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    name='meu_modelo',
    patience=20,      # Early stopping
    save_period=10,   # Salvar checkpoint a cada 10 épocas
    device='0'        # GPU 0, ou 'cpu' para CPU
)

# Avaliar modelo treinado
metrics = model.val()
print(f"mAP@0.5: {metrics.box.map50}")
print(f"mAP@0.5:0.95: {metrics.box.map}")
```

## Deployment e Otimização

### Exportação para Produção

```python
model = YOLO('meu_modelo.pt')

# Exportar para diferentes formatos
model.export(format='onnx')        # ONNX (recomendado)
model.export(format='engine')      # TensorRT (NVIDIA GPUs)
model.export(format='coreml')      # Apple devices
model.export(format='tflite')      # Mobile (Android/iOS)
model.export(format='openvino')    # Intel hardware
```
