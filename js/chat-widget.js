/**
 * Widget de assistente RAG - Disruptive Architectures
 *
 * Como usar:
 * 1. Suba este arquivo em material/js/chat-widget.js.
 * 2. No mkdocs.yml, adicione o caminho em extra_javascript, junto dos outros:
 *
 *    extra_javascript:
 *      - https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.0.0/js-yaml.min.js
 *      - https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js
 *      - js/chat-widget.js
 *
 * 3. Troque WORKER_URL abaixo pela URL do seu Worker publicado.
 *
 * Nota técnica: o tema mkdocs-material usa navegação instantânea
 * (feature.navigation.instant) — ao clicar num link, o <body> inteiro é
 * substituído via JS, sem reload de página. Isso apaga qualquer elemento
 * que a gente tenha injetado manualmente no DOM. Pra sobreviver a isso,
 * religamos o widget toda vez que o observable global `document$` do
 * mkdocs-material emitir um evento de navegação (inclusive na primeira
 * carga). O histórico da conversa fica guardado fora do DOM (em `estado`),
 * então não se perde ao trocar de página.
 */

(function () {
  const WORKER_URL = "https://disruptive-architectures-rag-worker.arnaldojr.workers.dev/ask";

  // Estado que sobrevive à recriação do DOM entre navegações
  const estado = {
    aberto: false,
    mensagens: [], // { texto, who: 'user'|'bot', fontes? }
    enviando: false,
  };

  function montarWidget() {
    // Se já existe (ex: script rodou 2x na mesma página), não duplica
    if (document.getElementById("da-rag-widget")) return;

    if (!document.getElementById("da-rag-style")) {
      const style = document.createElement("style");
      style.id = "da-rag-style";
      style.textContent = `
        #da-rag-bubble {
          position: fixed; bottom: 20px; right: 20px; z-index: 9999;
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--md-primary-fg-color, #673ab7);
          color: white; border: none; cursor: pointer;
          font-size: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        }
        #da-rag-bubble:focus-visible, #da-rag-close:focus-visible,
        #da-rag-send:focus-visible, #da-rag-input:focus-visible {
          outline: 3px solid var(--md-accent-fg-color, #ff4081);
          outline-offset: 2px;
        }
        #da-rag-widget {
          position: fixed; bottom: 88px; right: 20px; z-index: 9999;
          width: 340px; max-width: 90vw; height: 460px; max-height: 70vh;
          background: var(--md-default-bg-color, #fff);
          color: var(--md-default-fg-color, #000);
          border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          display: none; flex-direction: column; overflow: hidden;
          font-family: var(--md-text-font, sans-serif);
        }
        #da-rag-widget.open { display: flex; }
        #da-rag-header {
          background: var(--md-primary-fg-color, #673ab7); color: white;
          padding: 10px 14px; font-weight: 600; font-size: 14px;
          display: flex; justify-content: space-between; align-items: center;
        }
        #da-rag-close { background: none; border: none; color: white; cursor: pointer; font-size: 18px; }
        #da-rag-messages {
          flex: 1; overflow-y: auto; padding: 12px; font-size: 13.5px; line-height: 1.4;
        }
        .da-rag-msg { margin-bottom: 12px; }
        .da-rag-msg.user { text-align: right; }
        .da-rag-msg .bubble {
          display: inline-block; padding: 8px 12px; border-radius: 10px; max-width: 85%;
          text-align: left; white-space: pre-wrap;
        }
        .da-rag-msg.user .bubble { background: var(--md-primary-fg-color, #673ab7); color: white; }
        .da-rag-msg.bot .bubble { background: var(--md-code-bg-color, #f0f0f0); }
        .da-rag-msg .bubble p { margin: 0 0 6px 0; }
        .da-rag-msg .bubble p:last-child { margin-bottom: 0; }
        .da-rag-msg .bubble ul { margin: 4px 0; padding-left: 18px; }
        .da-rag-msg .bubble code {
          background: rgba(0,0,0,0.08); padding: 1px 4px; border-radius: 4px;
          font-size: 12px;
        }
        .da-rag-msg .bubble pre {
          background: rgba(0,0,0,0.08); padding: 8px 10px; border-radius: 6px;
          overflow-x: auto; margin: 6px 0; max-width: 100%;
        }
        .da-rag-msg .bubble pre code {
          background: none; padding: 0; font-size: 12px; white-space: pre;
        }
        .da-rag-sources { margin-top: 6px; font-size: 11.5px; opacity: 0.75; }
        .da-rag-sources a { color: inherit; }
        #da-rag-input-row { display: flex; border-top: 1px solid rgba(0,0,0,0.1); }
        #da-rag-input {
          flex: 1; border: none; padding: 10px; font-size: 13.5px; outline: none;
          background: transparent; color: inherit;
        }
        #da-rag-send { border: none; background: none; cursor: pointer; padding: 0 14px; font-size: 16px; }
        #da-rag-send:disabled { cursor: wait; opacity: 0.45; }
        .da-rag-loading { opacity: 0.6; font-style: italic; }
        @media (max-width: 480px) {
          #da-rag-bubble { bottom: 14px; right: 14px; }
          #da-rag-widget {
            bottom: 0; right: 0; width: 100vw; max-width: 100vw;
            height: min(560px, 86vh); max-height: 86vh; border-radius: 12px 12px 0 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const bubble = document.createElement("button");
    bubble.id = "da-rag-bubble";
    bubble.title = "Assistente do curso";
    bubble.setAttribute("aria-label", "Abrir assistente do curso");
    bubble.setAttribute("aria-expanded", "false");
    bubble.textContent = "💬";
    document.body.appendChild(bubble);

    const widget = document.createElement("div");
    widget.id = "da-rag-widget";
    widget.setAttribute("role", "dialog");
    widget.setAttribute("aria-labelledby", "da-rag-title");
    widget.innerHTML = `
      <div id="da-rag-header">
        <span id="da-rag-title">Assistente do curso</span>
        <button id="da-rag-close" aria-label="Fechar assistente">✕</button>
      </div>
      <div id="da-rag-messages" aria-live="polite" aria-busy="false"></div>
      <div id="da-rag-input-row">
        <input id="da-rag-input" type="text" placeholder="Pergunte sobre o conteúdo do curso..." aria-label="Pergunta" />
        <button id="da-rag-send" type="button" aria-label="Enviar pergunta">➤</button>
      </div>
    `;
    document.body.appendChild(widget);

    const inputEl = widget.querySelector("#da-rag-input");
    const sendButton = widget.querySelector("#da-rag-send");
    const messagesEl = widget.querySelector("#da-rag-messages");

    // Restaura conversa e estado aberto/fechado de antes da navegação.
    // Usamos o messagesEl ATUAL (widget recém-montado) explicitamente aqui,
    // já que é a única vez que precisamos de uma referência direta — o
    // resto do código (addMessage) sempre busca o container atual de novo.
    estado.mensagens.forEach((m) => renderizarMensagem(messagesEl, m));
    if (estado.aberto) {
      widget.classList.add("open");
      bubble.setAttribute("aria-expanded", "true");
    }

    async function enviarPergunta() {
      const pergunta = inputEl.value.trim();
      if (!pergunta || estado.enviando) return;
      estado.enviando = true;
      inputEl.disabled = true;
      sendButton.disabled = true;
      messagesEl.setAttribute("aria-busy", "true");
      inputEl.value = "";
      addMessage(pergunta, "user");

      const loadingId = addMessage("Consultando o material...", "bot", null, true);

      try {
        const resp = await fetch(WORKER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pergunta }),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();

        removeMessage(loadingId);

        if (data.erro) {
          addMessage("Ops, deu um erro: " + data.erro, "bot");
        } else {
          addMessage(data.resposta, "bot", data.fontes);
        }
      } catch (e) {
        removeMessage(loadingId);
        addMessage("Não consegui falar com o assistente agora. Tente novamente.", "bot");
      } finally {
        estado.enviando = false;
        // Estes elementos podem já não ser os "atuais" se o widget foi
        // recriado durante o fetch (navegação no meio da pergunta) — nesse
        // caso agir sobre eles é inofensivo (ficam órfãos, sem efeito
        // visual), e o widget novo já nasce com enviando=false de qualquer
        // forma, então não há travamento.
        inputEl.disabled = false;
        sendButton.disabled = false;
        messagesEl.setAttribute("aria-busy", "false");
        const inputAtual = document.getElementById("da-rag-input");
        if (inputAtual) inputAtual.focus();
      }
    }

    bubble.addEventListener("click", () => {
      widget.classList.toggle("open");
      estado.aberto = widget.classList.contains("open");
      bubble.setAttribute("aria-expanded", String(estado.aberto));
      if (estado.aberto) inputEl.focus();
      if (estado.aberto && estado.mensagens.length === 0) {
        addMessage(
          "Oi! Pergunte qualquer coisa sobre o conteúdo do curso (aulas, labs, conceitos).",
          "bot"
        );
      }
    });
    widget.querySelector("#da-rag-close").addEventListener("click", () => {
      widget.classList.remove("open");
      estado.aberto = false;
      bubble.setAttribute("aria-expanded", "false");
      bubble.focus();
    });
    sendButton.addEventListener("click", enviarPergunta);
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") enviarPergunta();
    });
  }

  // --- Funções de mensagem, fora de montarWidget ---------------------------
  // Ficam no escopo do módulo (não dentro de montarWidget) de propósito:
  // se o widget for recriado no meio de uma pergunta (o aluno navegou pra
  // outra página enquanto o fetch ainda estava em andamento), a resposta
  // não pode ficar "presa" a um container antigo e desconectado do DOM.
  // Por isso addMessage/renderizarMensagem sempre buscam o container ATUAL
  // via document.getElementById, nunca uma referência guardada de antes.
  let proximoId = 1;

  // Conversor leve de markdown -> HTML (escapa HTML primeiro, por segurança,
  // e só então aplica as transformações de markdown mais comuns).
  function markdownParaHtml(texto) {
    let seguro = texto
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Blocos de código ```linguagem\ncódigo\n``` -> <pre><code>, ANTES de
    // qualquer outra transformação (senão o conteúdo do código seria
    // interpretado como markdown também, ex: um "*" dentro do código).
    // Guardamos cada bloco num array e substituímos por um placeholder,
    // pra reinserir intacto no final (depois de processar o resto do texto).
    const blocosDeCodigo = [];
    seguro = seguro.replace(/```[a-zA-Z]*\n?([\s\S]*?)```/g, (_, codigo) => {
      const idx = blocosDeCodigo.length;
      blocosDeCodigo.push(codigo.replace(/\n$/, ""));
      return `%%CODEBLOCK_${idx}%%`;
    });

    seguro = seguro.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    seguro = seguro.replace(/__(.+?)__/g, "<strong>$1</strong>");
    seguro = seguro.replace(/\*(.+?)\*/g, "<em>$1</em>");
    seguro = seguro.replace(/(?<!\w)_(.+?)_(?!\w)/g, "<em>$1</em>");
    seguro = seguro.replace(/`(.+?)`/g, "<code>$1</code>");
    seguro = seguro.replace(/^#{1,6}\s+(.+)$/gm, "<strong>$1</strong>");

    const linhas = seguro.split("\n");
    let html = "";
    let dentroLista = false;
    for (const linha of linhas) {
      const itemLista = linha.match(/^\s*[-*]\s+(.+)$/);
      if (itemLista) {
        if (!dentroLista) {
          html += "<ul>";
          dentroLista = true;
        }
        html += `<li>${itemLista[1]}</li>`;
      } else {
        if (dentroLista) {
          html += "</ul>";
          dentroLista = false;
        }
        html += linha.trim() ? `<p>${linha}</p>` : "";
      }
    }
    if (dentroLista) html += "</ul>";

    // Reinsere os blocos de código no lugar dos placeholders
    html = html.replace(/%%CODEBLOCK_(\d+)%%/g, (_, idx) => {
      return `<pre><code>${blocosDeCodigo[Number(idx)]}</code></pre>`;
    });

    return html;
  }

  function renderizarMensagem(container, m) {
    const wrap = document.createElement("div");
    wrap.className = `da-rag-msg ${m.who}`;
    wrap.dataset.msgId = m.id;
    const bubbleEl = document.createElement("div");
    bubbleEl.className = "bubble";
    if (m.loading) bubbleEl.classList.add("da-rag-loading");
    if (m.who === "bot") {
      // innerHTML aqui é seguro: markdownParaHtml escapa < > & antes de
      // aplicar as tags, então não dá pra injetar HTML arbitrário.
      bubbleEl.innerHTML = markdownParaHtml(m.texto);
    } else {
      bubbleEl.textContent = m.texto;
    }
    wrap.appendChild(bubbleEl);

    if (m.fontes && m.fontes.length) {
      const src = document.createElement("div");
      src.className = "da-rag-sources";
      src.appendChild(document.createTextNode("Fontes: "));
      m.fontes.forEach((f, index) => {
        const link = document.createElement("a");
        link.href = f.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = f.titulo || f.url;
        src.appendChild(link);
        if (index < m.fontes.length - 1) src.appendChild(document.createTextNode(" · "));
      });
      wrap.appendChild(src);
    }

    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
    return wrap;
  }

  /** Adiciona mensagem ao estado E ao container atual do DOM (se existir). */
  function addMessage(texto, who, fontes, loading) {
    const id = proximoId++;
    const m = { id, texto, who, fontes, loading: !!loading };
    estado.mensagens.push(m);

    const container = document.getElementById("da-rag-messages");
    if (container) renderizarMensagem(container, m);

    return id;
  }

  /** Remove mensagem do estado E do DOM atual (se ainda estiver lá). */
  function removeMessage(id) {
    estado.mensagens = estado.mensagens.filter((m) => m.id !== id);
    const el = document.querySelector(`[data-msg-id="${id}"]`);
    if (el) el.remove();
  }

  // mkdocs-material declara `document$` com `const`/`let` no escopo global
  // do script do tema. Isso significa que a variável NÃO aparece como
  // propriedade de `window` (só `var` faz isso) — mas continua acessível
  // como identificador solto em scripts carregados depois na mesma página,
  // porque compartilham o mesmo ambiente léxico global. Por isso checamos
  // `document$` direto (com `typeof`, que nunca lança erro mesmo se a
  // variável não existir), e não `window.document$`.
  let jaSubscrito = false;
  try {
    if (typeof document$ !== "undefined" && typeof document$.subscribe === "function") {
      document$.subscribe(() => montarWidget());
      jaSubscrito = true;
    }
  } catch (e) {
    // segue pro fallback abaixo
  }

  if (!jaSubscrito) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", montarWidget);
    } else {
      montarWidget();
    }
  }

  // Rede de segurança extra, só pro caso de document$ não ter funcionado:
  // observa apenas os filhos diretos do <body> (não a árvore inteira, pra
  // não gerar overhead) e remonta o widget se ele for removido de lá.
  new MutationObserver(() => {
    if (!document.getElementById("da-rag-widget")) {
      montarWidget();
    }
  }).observe(document.body, { childList: true, subtree: false });
})();