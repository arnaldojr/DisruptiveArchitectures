# Avaliação Prática: Assistente Virtual Pet Shop "Cão & Gato"

## 1. O Desafio
O Pet Shop **Cão & Gato** precisa de um assistente virtual construído em Python para realizar o pré-agendamento de serviços de estética (banho, tosa e hidratação). 

O assistente deve interagir com o cliente de forma natural, entender a demanda, calcular o orçamento, verificar a disponibilidade de agenda e, ao final, gerar uma ficha de atendimento estruturada.

**⚠️ Regra de Ouro (Segurança):** O escopo do assistente é puramente estético. Se o cliente relatar que o pet está machucado, doente, apático ou apresentar qualquer sintoma, o assistente **não pode** dar diagnósticos ou seguir com o agendamento. Ele deve, obrigatoriamente, recomendar a busca por um médico veterinário.

---

## 2. Regras de Negócio

O modelo **não deve** calcular preços ou adivinhar vagas por conta própria. Ele deve ser instruído a consumir ferramentas (funções Python) que contenham as regras abaixo.

### Tabela de Preços

| Serviço | Pequeno | Médio | Grande |
| :--- | :--- | :--- | :--- |
| **Banho** | R$ 45,00 | R$ 60,00 | R$ 80,00 |
| **Tosa** | R$ 35,00 | R$ 50,00 | R$ 65,00 |
| **Hidratação** | R$ 20,00 | R$ 30,00 | R$ 40,00 |

### Disponibilidade de Agenda

| Dia | Manhã | Tarde |
| :--- | :--- | :--- |
| **Segunda-feira** | Disponível | Indisponível |
| **Quarta-feira** | Indisponível | Disponível |
| **Sábado** | Disponível | Indisponível |

---

## 3. Requisitos Técnicos

Sua entrega, desenvolvida em um notebook do Google Colab utilizando a biblioteca `google-genai`, deverá conter obrigatoriamente:

1. **System Prompt Robusto:** Defina a persona do assistente, a regra de segurança veterinária e a instrução clara de que ele deve confirmar todos os dados com o cliente antes de gerar a ficha final.
2. **Duas Ferramentas (Tool Calling):**
   * `calcular_orcamento(porte: str, servicos: list[str])`: Função Python que recebe os parâmetros, consulta a tabela de preços e devolve o valor numérico.
   * `verificar_disponibilidade(dia: str, periodo: str)`: Função Python que verifica a matriz de agenda e retorna a disponibilidade.
3. **Histórico de Conversa (Memória):** O assistente não pode esquecer informações já passadas (ex: nome ou porte do pet) no meio do atendimento. Utilize o gerenciamento de sessão de chat da API.
4. **Saída Estruturada (Pydantic):** Após a confirmação do cliente, o fluxo deve ser encerrado gerando um objeto JSON rigoroso, validado por uma classe Pydantic com a seguinte estrutura:
   * `nome_pet` (str)
   * `especie` (Literal: "cao" ou "gato")
   * `porte` (Literal: "pequeno", "medio", "grande")
   * `servicos` (list[str])
   * `dia` (str)
   * `periodo` (str)
   * `valor_total` (float)

---

## 4. Roteiro de Testes (Simulações)

Para comprovar o funcionamento da sua arquitetura, você deverá executar e registrar no seu Colab **três simulações de conversa completas**:

* **Simulação 1 (O Caminho Feliz):** O cliente pede um banho e tosa para um cachorro pequeno na segunda-feira de manhã. O robô atende, usa as ferramentas, o cliente confirma e a ficha Pydantic é gerada perfeitamente.
* **Simulação 2 (O Cliente Esquecido e o Horário Lotado):** O cliente pede um banho na segunda-feira à tarde para o "Rex", mas esquece de dizer o porte e a espécie. O robô deve perguntar o que falta, avisar que segunda à tarde não tem vaga (usando a ferramenta) e sugerir quarta à tarde. Após o ajuste, o cliente confirma e a ficha é gerada.
* **Simulação 3 (O Guardrail Veterinário):** O cliente diz: *"Quero marcar um banho pro meu gato grande, mas ele está vomitando desde ontem e o olho tá vermelho. Pode ser sábado?"*. O robô deve barrar o atendimento estético, orientar a busca por um veterinário e recusar a geração da ficha Pydantic.

---

## 5. Critérios de Avaliação (Total: 10 Pontos)

* **[2,0]** Criação correta das funções Python (Tools) refletindo a lógica de preços e agenda.
* **[2,0]** System Prompt eficiente (blinda o modelo contra alucinações de preço e respeita a regra veterinária).
* **[3,0]** Orquestração do Chat: O modelo mantém o contexto e chama as ferramentas no momento certo, de forma fluida.
* **[2,0]** Geração final da Ficha Estruturada usando Pydantic no momento correto (apenas após confirmação e se não houver bloqueio veterinário).
* **[1,0]** Reflexão sobre IA: Ao final do Colab, inclua uma célula de texto (Markdown) explicando qual foi a maior dificuldade na integração e como você utilizou IA para ajudar no desenvolvimento, citando obrigatoriamente pelo menos um erro ou sugestão inadequada que a IA tenha fornecido durante o seu processo.

---

## 6. Instruções de Entrega

* Entregue um único arquivo `.ipynb` (Notebook do Colab).
* As chaves de API **não devem** estar expostas no código (utilize o `userdata.get()` do Colab Secrets).
* O notebook deve ser executável de cima para baixo. Garanta que as saídas dos 3 testes solicitados estejam visíveis no arquivo salvo.