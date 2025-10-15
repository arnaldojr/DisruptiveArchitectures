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

<!-- ### Monitoramento com TensorBoard

```python
# Durante o treinamento, os logs são salvos automaticamente
# Visualizar com TensorBoard:
# tensorboard --logdir runs/detect/meu_modelo

# Ou acessar métricas programaticamente:
import pandas as pd

results_df = pd.read_csv('runs/detect/meu_modelo/results.csv')
print(results_df[['epoch', 'train/box_loss', 'val/box_loss', 'metrics/mAP50(B)']])
``` -->

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

<!-- ### Otimizações de Performance

```python
# Configurações para máxima velocidade
results = model(
    source='input.jpg',
    imgsz=320,          # Menor resolução = mais rápido
    conf=0.4,           # Threshold mais alto = menos detecções
    iou=0.5,            # NMS mais agressivo
    half=True,          # Precisão FP16 (GPUs modernas)
    device='0',         # GPU
    verbose=False       # Sem prints desnecessários
)

# Para aplicações críticas de velocidade
model = YOLO('yolov8n.pt')  # Usar modelo nano
``` -->

<!-- ### Deploy Mobile com TensorFlow Lite

```python
# Exportar para TFLite
model.export(format='tflite', imgsz=320, int8=True)

# Código Android (Kotlin) básico:
"""
private fun detectObjects(bitmap: Bitmap): List<Detection> {
    val inputTensor = preprocessImage(bitmap)
    interpreter.run(inputTensor, outputTensor)
    return postprocessDetections(outputTensor)
}
"""
```

### Deploy com Docker

```dockerfile
# Dockerfile para YOLO
FROM ultralytics/ultralytics:latest

COPY meu_modelo.pt /app/
COPY app.py /app/

WORKDIR /app
EXPOSE 8000

CMD ["python", "app.py"]
``` -->

<!-- ## Casos de Uso Reais

### Detecção de Buracos na Estrada

```python
class PotholeDetector:
    def __init__(self):
        self.model = YOLO('yolov8n.pt')
        
    def train_custom_model(self):
        """Treinar modelo específico para buracos"""
        # Dataset: https://github.com/michelpf/dataset-pothole
        results = self.model.train(
            data='pothole_dataset/data.yaml',
            epochs=100,
            imgsz=640,
            name='pothole_detector'
        )
        return results
    
    def detect_potholes(self, road_image):
        """Detectar buracos em imagem de estrada"""
        results = self.model(road_image, conf=0.3)
        
        pothole_count = 0
        severity_scores = []
        
        for result in results:
            if result.boxes is not None:
                for box in result.boxes:
                    if int(box.cls) == 0:  # classe 'buraco'
                        pothole_count += 1
                        # Calcular severidade baseada no tamanho
                        width = float(box.xywh[0][2])
                        height = float(box.xywh[0][3])
                        area = width * height
                        severity_scores.append(area)
        
        return {
            'count': pothole_count,
            'average_severity': np.mean(severity_scores) if severity_scores else 0,
            'locations': [box.xyxy for box in result.boxes if result.boxes is not None]
        }

# Uso
detector = PotholeDetector()
result = detector.detect_potholes('estrada.jpg')
print(f"Encontrados {result['count']} buracos")
```

### Monitoramento de Segurança Industrial

```python
class SafetyMonitor:
    def __init__(self):
        self.model = YOLO('safety_model.pt')  # Modelo treinado para EPIs
        
    def check_safety_compliance(self, frame):
        """Verificar uso de equipamentos de segurança"""
        results = self.model(frame)
        
        violations = []
        persons = []
        helmets = []
        vests = []
        
        for result in results:
            if result.boxes is not None:
                for box in result.boxes:
                    cls_name = self.model.names[int(box.cls)]
                    coords = box.xyxy[0].tolist()
                    
                    if cls_name == 'person':
                        persons.append(coords)
                    elif cls_name == 'helmet':
                        helmets.append(coords)
                    elif cls_name == 'safety_vest':
                        vests.append(coords)
        
        # Verificar se cada pessoa tem equipamentos
        for person in persons:
            has_helmet = self._check_nearby_equipment(person, helmets)
            has_vest = self._check_nearby_equipment(person, vests)
            
            if not has_helmet:
                violations.append({'type': 'no_helmet', 'location': person})
            if not has_vest:
                violations.append({'type': 'no_vest', 'location': person})
        
        return violations
    
    def _check_nearby_equipment(self, person_coords, equipment_list, threshold=0.3):
        """Verificar se equipamento está próximo da pessoa"""
        person_center = [(person_coords[0] + person_coords[2])/2, 
                        (person_coords[1] + person_coords[3])/2]
        
        for equipment in equipment_list:
            equip_center = [(equipment[0] + equipment[2])/2, 
                           (equipment[1] + equipment[3])/2]
            
            distance = ((person_center[0] - equip_center[0])**2 + 
                       (person_center[1] - equip_center[1])**2)**0.5
            
            if distance < threshold:
                return True
        return False
```

### Sistema de Monitoramento de Tráfego

```python
class TrafficAnalyzer:
    def __init__(self):
        self.model = YOLO('yolov8n.pt')
        self.vehicle_classes = ['car', 'truck', 'bus', 'motorcycle']
        
    def count_vehicles(self, video_path):
        """Contar veículos em vídeo de tráfego"""
        vehicle_counts = {cls: 0 for cls in self.vehicle_classes}
        
        for result in self.model(video_path, stream=True):
            if result.boxes is not None:
                for box in result.boxes:
                    class_name = self.model.names[int(box.cls)]
                    if class_name in self.vehicle_classes:
                        vehicle_counts[class_name] += 1
        
        return vehicle_counts
    
    def detect_traffic_violations(self, frame):
        """Detectar possíveis violações de trânsito"""
        results = self.model(frame)
        violations = []
        
        # Exemplo: detectar veículos em área proibida
        prohibited_zone = (100, 100, 300, 200)  # x1, y1, x2, y2
        
        for result in results:
            if result.boxes is not None:
                for box in result.boxes:
                    vehicle_coords = box.xyxy[0].tolist()
                    if self._is_in_zone(vehicle_coords, prohibited_zone):
                        violations.append({
                            'type': 'prohibited_zone',
                            'vehicle': self.model.names[int(box.cls)],
                            'confidence': float(box.conf),
                            'location': vehicle_coords
                        })
        
        return violations
```

 -->


