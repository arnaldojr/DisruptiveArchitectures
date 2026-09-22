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
    // Em navegação instantânea do Material for MkDocs, partes do DOM/head
    // podem ser atualizadas sem recarregar este arquivo. Por isso,
    // garantimos o CSS antes de decidir se o widget precisa ser recriado.
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

    // O Material pode preservar um elemento e substituir outro durante a
    // navegação instantânea. Só consideramos o widget íntegro se ambos existirem.
    const widgetExistente = document.getElementById("da-rag-widget");
    const bubbleExistente = document.getElementById("da-rag-bubble");

    if (widgetExistente && bubbleExistente) return;

    // Se ficou apenas metade da interface, limpa e monta o par novamente.
    if (widgetExistente) widgetExistente.remove();
    if (bubbleExistente) bubbleExistente.remove();

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

  let proximoId = 1;

  function markdownParaHtml(texto) {
    let seguro = texto
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

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

  function addMessage(texto, who, fontes, loading) {
    const id = proximoId++;
    const m = { id, texto, who, fontes, loading: !!loading };
    estado.mensagens.push(m);

    const container = document.getElementById("da-rag-messages");
    if (container) renderizarMensagem(container, m);

    return id;
  }

  function removeMessage(id) {
    estado.mensagens = estado.mensagens.filter((m) => m.id !== id);
    const el = document.querySelector(`[data-msg-id="${id}"]`);
    if (el) el.remove();
  }

  // Material for MkDocs com navigation.instant funciona como SPA.
  // document$ emite novamente após cada navegação interna.
  function reinicializarWidget() {
    // Espera o Material concluir a atualização do DOM/head desta navegação.
    requestAnimationFrame(() => montarWidget());
  }

  if (typeof document$ !== "undefined" && typeof document$.subscribe === "function") {
    document$.subscribe(reinicializarWidget);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", montarWidget, { once: true });
  } else {
    montarWidget();
  }

  // Fallback leve para casos em que outro script externo remova o widget.
  // Observamos o documento inteiro, não apenas o body antigo.
  const observer = new MutationObserver(() => {
    const temWidget = document.getElementById("da-rag-widget");
    const temBubble = document.getElementById("da-rag-bubble");
    const temStyle = document.getElementById("da-rag-style");

    if (!temWidget || !temBubble || !temStyle) {
      reinicializarWidget();
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
})();