# 📈 Regressão em Machine Learning: Do Básico ao Prático

## Notebook Didático para Segunda Aula de ML

Este material foi criado especialmente para alunos que estão na **segunda aula de Machine Learning**. 

### 🎯 Objetivos
- Entender o que é regressão e quando usar
- Aprender a diferença entre classificação e regressão  
- Implementar regressão linear com scikit-learn
- Avaliar modelos de regressão
- Explorar regressão polinomial
- Entender overfitting e underfitting

### 📚 Pré-requisitos
- ✅ Programação básica em Python
- ✅ Conceitos básicos de pandas e matplotlib
- ✅ Conhecimento da aula anterior sobre ML
- ❌ **NÃO precisa** ser expert em estatística
- ❌ **NÃO precisa** conhecer scikit-learn profundamente

---

## 🔍 1. Conceitos Fundamentais

### Regressão vs Classificação

| Aspecto | **Classificação** | **Regressão** |
|---------|------------------|---------------|
| **O que prediz?** | Categorias/Classes | Números contínuos |
| **Exemplos** | "Spam" ou "Não-spam" | Preço: R$ 250.000 |
| **Tipo** | Discreto | Contínuo |

### Exemplo: Preço de Imóveis
**Problema**: Dado características de uma casa → Predizer o **preço**
- ✅ **É regressão** porque queremos um **valor numérico**
- ❌ **Não é classificação** porque não é categoria

---

## 📐 2. Regressão Linear Simples

### Matemática (Simples!)
Lembra da equação da reta?
```
y = a + b × x
```

Em ML vira:
```
Preço = β₀ + β₁ × Tamanho
```

Onde:
- **β₀** = intercepto (onde corta o eixo Y)
- **β₁** = coeficiente angular (inclinação)

### Objetivo
Encontrar os melhores valores de β₀ e β₁ que fazem a reta passar o mais próximo possível dos dados.

---

## 💻 3. Implementação Prática

### Código Completo com Explicações

```python
# 📚 Importando bibliotecas
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

print("✅ Bibliotecas importadas!")

# 🏠 Carregando dados de casas da Califórnia
print("📥 Carregando dados...")
housing = fetch_california_housing()
df = pd.DataFrame(housing.data, columns=housing.feature_names)
df['target'] = housing.target

print(f"📊 Dataset: {df.shape[0]} linhas, {df.shape[1]} colunas")
print("🔍 Primeiras linhas:")
print(df.head())

# 📖 Significado das colunas:
# MedInc: Renda média (em dezenas de milhares)
# HouseAge: Idade média das casas
# AveRooms: Número médio de quartos
# AveBedrms: Número médio de quartos de dormir
# Population: População da área
# AveOccup: Ocupação média
# Latitude/Longitude: Coordenadas geográficas
# target: PREÇO (em centenas de milhares de dólares)

# 🔍 Informações básicas
print("\\n📋 Informações do dataset:")
print(df.info())
print("\\n📊 Estatísticas:")
print(df.describe().round(2))

# 🚨 Verificando dados faltantes
print("\\n🔍 Dados faltantes:")
print(df.isnull().sum())

# 📊 Visualizações
plt.figure(figsize=(15, 10))

# Histogramas
for i, col in enumerate(df.columns[:9], 1):
    plt.subplot(3, 3, i)
    plt.hist(df[col], bins=30, alpha=0.7)
    plt.title(f'{col}')
    plt.xlabel(col)
    plt.ylabel('Frequência')

plt.tight_layout()
plt.suptitle('📊 Distribuição das Variáveis', y=1.02, fontsize=16)
plt.show()

# 🔗 Matriz de Correlação
plt.figure(figsize=(10, 8))
correlation_matrix = df.corr()
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0, 
            square=True, linewidths=0.5)
plt.title('🔗 Matriz de Correlação', fontsize=16, fontweight='bold')
plt.show()

# 🎯 Correlações com o target
print("\\n🎯 Correlações com o preço (target):")
correlacoes = correlation_matrix['target'].sort_values(ascending=False)
for var, corr in correlacoes.items():
    if var != 'target':
        emoji = "📈" if corr > 0 else "📉"
        print(f"{emoji} {var}: {corr:.3f}")

# 📈 Scatter plots das variáveis mais correlacionadas
fig, axes = plt.subplots(2, 2, figsize=(12, 10))
fig.suptitle('📈 Relação com o Preço das Casas', fontsize=16)

# Top correlações positivas e negativas
top_vars = ['MedInc', 'AveRooms', 'HouseAge', 'AveBedrms']

for i, var in enumerate(top_vars):
    row = i // 2
    col = i % 2
    axes[row, col].scatter(df[var], df['target'], alpha=0.5)
    axes[row, col].set_xlabel(var)
    axes[row, col].set_ylabel('Preço')
    axes[row, col].set_title(f'{var} vs Preço')

plt.tight_layout()
plt.show()

# 🎯 Preparando dados para o modelo
# Vamos começar simples: usar apenas a renda (MedInc) para predizer preço
X_simples = df[['MedInc']]  # Feature: Renda
y = df['target']            # Target: Preço

print(f"\\n🎯 Dados preparados:")
print(f"Features (X): {X_simples.shape}")
print(f"Target (y): {y.shape}")

# ✂️ Dividindo dados em treino e teste
X_train, X_test, y_train, y_test = train_test_split(
    X_simples, y, test_size=0.2, random_state=42
)

print(f"\\n✂️ Divisão dos dados:")
print(f"Treino: {X_train.shape[0]} amostras")
print(f"Teste: {X_test.shape[0]} amostras")

# 🤖 Criando e treinando o modelo
print("\\n🤖 Treinando modelo de regressão linear...")
modelo = LinearRegression()
modelo.fit(X_train, y_train)

print("✅ Modelo treinado!")

# 📊 Coeficientes do modelo
print(f"\\n📊 Coeficientes do modelo:")
print(f"Intercepto (β₀): {modelo.intercept_:.4f}")
print(f"Coeficiente (β₁): {modelo.coef_[0]:.4f}")
print(f"\\n📝 Equação: Preço = {modelo.intercept_:.4f} + {modelo.coef_[0]:.4f} × Renda")

# 🔮 Fazendo predições
y_pred = modelo.predict(X_test)

print(f"\\n🔮 Exemplos de predições:")
for i in range(5):
    renda = X_test.iloc[i, 0]
    real = y_test.iloc[i]
    predito = y_pred[i]
    print(f"Renda: {renda:.2f} → Real: ${real:.1f}k, Predito: ${predito:.1f}k")

# 📏 Avaliando o modelo
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"\\n📏 Métricas de Avaliação:")
print(f"MSE (Erro Quadrático Médio): {mse:.4f}")
print(f"RMSE (Raiz do MSE): {rmse:.4f}")
print(f"MAE (Erro Absoluto Médio): {mae:.4f}")
print(f"R² (Coeficiente de Determinação): {r2:.4f}")

print(f"\\n💡 Interpretação do R²:")
print(f"Nosso modelo explica {r2*100:.1f}% da variação nos preços")

# 📈 Visualizando resultados
plt.figure(figsize=(12, 5))

# Gráfico 1: Reta de regressão
plt.subplot(1, 2, 1)
plt.scatter(X_test, y_test, alpha=0.5, label='Dados reais')
plt.plot(X_test, y_pred, color='red', linewidth=2, label='Regressão Linear')
plt.xlabel('Renda Média')
plt.ylabel('Preço das Casas')
plt.title('📈 Regressão Linear')
plt.legend()

# Gráfico 2: Predito vs Real
plt.subplot(1, 2, 2)
plt.scatter(y_test, y_pred, alpha=0.5)
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', linewidth=2)
plt.xlabel('Preço Real')
plt.ylabel('Preço Predito')
plt.title('📊 Real vs Predito')

plt.tight_layout()
plt.show()

# 🌟 Melhorando o modelo: usando múltiplas features
print("\\n🌟 Vamos melhorar! Usando múltiplas variáveis...")

# Selecionando as features mais correlacionadas
features_importantes = ['MedInc', 'AveRooms', 'HouseAge', 'AveBedrms']
X_multiplo = df[features_importantes]

# Dividindo novamente
X_train_mult, X_test_mult, y_train_mult, y_test_mult = train_test_split(
    X_multiplo, y, test_size=0.2, random_state=42
)

# Treinando modelo múltiplo
modelo_mult = LinearRegression()
modelo_mult.fit(X_train_mult, y_train_mult)

# Predições
y_pred_mult = modelo_mult.predict(X_test_mult)

# Avaliação
r2_mult = r2_score(y_test_mult, y_pred_mult)
rmse_mult = np.sqrt(mean_squared_error(y_test_mult, y_pred_mult))

print(f"\\n📊 Comparação dos modelos:")
print(f"Modelo Simples (1 variável):")
print(f"  R²: {r2:.4f} | RMSE: {rmse:.4f}")
print(f"Modelo Múltiplo (4 variáveis):")
print(f"  R²: {r2_mult:.4f} | RMSE: {rmse_mult:.4f}")

melhoria_r2 = ((r2_mult - r2) / r2) * 100
print(f"\\n🚀 Melhoria no R²: {melhoria_r2:.1f}%")

# 📊 Importância das features
print(f"\\n📊 Importância das variáveis (coeficientes):")
for feature, coef in zip(features_importantes, modelo_mult.coef_):
    print(f"{feature}: {coef:.4f}")

# 🔄 Regressão Polinomial
print("\\n🔄 Explorando Regressão Polinomial...")
print("(Para capturar relações não-lineares)")

# Usando apenas renda para simplicidade
X_poly_base = df[['MedInc']]
y_poly = df['target']

# Testando diferentes graus
graus = [1, 2, 3, 4, 5]
resultados_poly = {}

plt.figure(figsize=(15, 10))

for i, grau in enumerate(graus, 1):
    # Transformação polinomial
    poly_features = PolynomialFeatures(degree=grau)
    X_poly = poly_features.fit_transform(X_poly_base)
    
    # Divisão treino/teste
    X_train_poly, X_test_poly, y_train_poly, y_test_poly = train_test_split(
        X_poly, y_poly, test_size=0.2, random_state=42
    )
    
    # Modelo
    modelo_poly = LinearRegression()
    modelo_poly.fit(X_train_poly, y_train_poly)
    
    # Predições
    y_pred_poly = modelo_poly.predict(X_test_poly)
    
    # Métricas
    r2_poly = r2_score(y_test_poly, y_pred_poly)
    rmse_poly = np.sqrt(mean_squared_error(y_test_poly, y_pred_poly))
    
    resultados_poly[grau] = {'r2': r2_poly, 'rmse': rmse_poly}
    
    # Plotando
    plt.subplot(2, 3, i)
    
    # Dados para plotar a curva suave
    X_plot = np.linspace(X_poly_base.min().values[0], X_poly_base.max().values[0], 100).reshape(-1, 1)
    X_plot_poly = poly_features.transform(X_plot)
    y_plot = modelo_poly.predict(X_plot_poly)
    
    # Amostra dos dados para não sobrecarregar o gráfico
    sample_idx = np.random.choice(len(X_test_poly), 1000, replace=False)
    X_sample = X_poly_base.iloc[sample_idx]
    y_sample = y_poly.iloc[sample_idx]
    
    plt.scatter(X_sample, y_sample, alpha=0.3, s=10)
    plt.plot(X_plot, y_plot, color='red', linewidth=2)
    plt.title(f'Grau {grau} (R²={r2_poly:.3f})')
    plt.xlabel('Renda')
    plt.ylabel('Preço')

# Gráfico de comparação
plt.subplot(2, 3, 6)
graus_list = list(resultados_poly.keys())
r2_list = [resultados_poly[g]['r2'] for g in graus_list]
rmse_list = [resultados_poly[g]['rmse'] for g in graus_list]

plt.plot(graus_list, r2_list, 'o-', label='R²', linewidth=2)
plt.xlabel('Grau do Polinômio')
plt.ylabel('R²')
plt.title('📈 Performance vs Complexidade')
plt.grid(True, alpha=0.3)
plt.legend()

plt.tight_layout()
plt.show()

# 📊 Resultados dos polinômios
print(f"\\n📊 Resultados da Regressão Polinomial:")
for grau, metricas in resultados_poly.items():
    print(f"Grau {grau}: R² = {metricas['r2']:.4f}, RMSE = {metricas['rmse']:.4f}")

# 🎯 Conclusões
print(f"\\n🎯 CONCLUSÕES E APRENDIZADOS:")
print(f"=" * 50)
print(f"1. 📈 Regressão Linear é útil para relações lineares")
print(f"2. 📊 Múltiplas variáveis geralmente melhoram a predição")
print(f"3. 🔄 Polinômios capturam relações não-lineares")
print(f"4. ⚠️  Graus muito altos podem causar overfitting")
print(f"5. 📏 R² mede o quanto o modelo explica a variação")
print(f"6. 🎯 RMSE dá o erro médio em unidades originais")

print(f"\\n🚀 Próximos passos:")
print(f"• Experimentar outros algoritmos (Random Forest, SVM)")
print(f"• Usar validação cruzada")
print(f"• Feature engineering (criar novas variáveis)")
print(f"• Regularização (Ridge, Lasso)")

print(f"\\n✅ Parabéns! Você completou sua introdução à regressão!")
```

---

## 🎯 4. Exercícios Práticos

### 📝 Exercício 1: Predição Simples
1. Use apenas a variável `HouseAge` para predizer preço
2. Calcule as métricas (R², RMSE, MAE)
3. Compare com o modelo que usa `MedInc`

### 📝 Exercício 2: Múltiplas Variáveis
1. Crie um modelo usando todas as 8 variáveis
2. Compare a performance com o modelo de 4 variáveis
3. Qual teve melhor resultado?

### 📝 Exercício 3: Regressão Polinomial
1. Teste graus 1 a 10 para a variável `AveRooms`
2. Identifique qual grau dá melhor R² no teste
3. Há sinais de overfitting?

---

## 🎓 5. Conceitos Importantes

### Overfitting vs Underfitting
- **Underfitting**: Modelo muito simples (baixo R² tanto no treino quanto no teste)
- **Overfitting**: Modelo muito complexo (alto R² no treino, baixo no teste)
- **Just Right**: Modelo equilibrado (R² similar no treino e teste)

### Métricas de Avaliação
- **R²**: % da variação explicada (0 a 1, quanto maior melhor)
- **MSE**: Erro quadrático médio (quanto menor melhor)
- **RMSE**: MSE em unidades originais (quanto menor melhor)
- **MAE**: Erro absoluto médio (robusto a outliers)

### Quando Usar Regressão
- ✅ Target é **numérico contínuo**
- ✅ Relação linear ou polinomial
- ✅ Dados têm poucos outliers
- ❌ Target é categórico → use classificação

---

## 📚 6. Próximos Passos

1. **Algoritmos mais avançados**: Random Forest, XGBoost
2. **Regularização**: Ridge, Lasso, Elastic Net
3. **Validação cruzada**: Avaliação mais robusta
4. **Feature engineering**: Criar variáveis melhores
5. **Ensemble methods**: Combinar múltiplos modelos

---

**🎉 Parabéns!** Você completou sua introdução à regressão em Machine Learning!
