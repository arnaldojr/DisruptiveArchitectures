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
        .da-rag-sources { margin-top: 6px; font-size: 11.5px; opacity: 0.75; }
        .da-rag-sources a { color: inherit; }
        #da-rag-input-row { display: flex; border-top: 1px solid rgba(0,0,0,0.1); }
        #da-rag-input {
          flex: 1; border: none; padding: 10px; font-size: 13.5px; outline: none;
          background: transparent; color: inherit;
        }
        #da-rag-send { border: none; background: none; cursor: pointer; padding: 0 14px; font-size: 16px; }
        .da-rag-loading { opacity: 0.6; font-style: italic; }
      `;
      document.head.appendChild(style);
    }

    const bubble = document.createElement("button");
    bubble.id = "da-rag-bubble";
    bubble.title = "Assistente do curso";
    bubble.textContent = "💬";
    document.body.appendChild(bubble);

    const widget = document.createElement("div");
    widget.id = "da-rag-widget";
    widget.innerHTML = `
      <div id="da-rag-header">
        <span>Assistente do curso</span>
        <button id="da-rag-close">✕</button>
      </div>
      <div id="da-rag-messages"></div>
      <div id="da-rag-input-row">
        <input id="da-rag-input" type="text" placeholder="Pergunte sobre o conteúdo do curso..." />
        <button id="da-rag-send">➤</button>
      </div>
    `;
    document.body.appendChild(widget);

    const messagesEl = widget.querySelector("#da-rag-messages");
    const inputEl = widget.querySelector("#da-rag-input");

    // Restaura conversa e estado aberto/fechado de antes da navegação
    estado.mensagens.forEach((m) => renderizarMensagem(messagesEl, m));
    if (estado.aberto) widget.classList.add("open");

    function renderizarMensagem(container, m) {
      const wrap = document.createElement("div");
      wrap.className = `da-rag-msg ${m.who}`;
      const bubbleEl = document.createElement("div");
      bubbleEl.className = "bubble";
      bubbleEl.textContent = m.texto;
      wrap.appendChild(bubbleEl);

      if (m.fontes && m.fontes.length) {
        const src = document.createElement("div");
        src.className = "da-rag-sources";
        src.innerHTML =
          "Fontes: " +
          m.fontes.map((f) => `<a href="${f.url}" target="_blank">${f.titulo}</a>`).join(" · ");
        wrap.appendChild(src);
      }

      container.appendChild(wrap);
      container.scrollTop = container.scrollHeight;
      return wrap;
    }

    function addMessage(texto, who, fontes) {
      const m = { texto, who, fontes };
      estado.mensagens.push(m);
      return renderizarMensagem(messagesEl, m);
    }

    async function enviarPergunta() {
      const pergunta = inputEl.value.trim();
      if (!pergunta) return;
      inputEl.value = "";
      addMessage(pergunta, "user");

      const loadingEl = addMessage("Pensando...", "bot");
      loadingEl.querySelector(".bubble").classList.add("da-rag-loading");

      try {
        const resp = await fetch(WORKER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pergunta }),
        });
        const data = await resp.json();

        // Remove a mensagem "Pensando..." tanto do DOM quanto do estado
        loadingEl.remove();
        estado.mensagens.pop();

        if (data.erro) {
          addMessage("Ops, deu um erro: " + data.erro, "bot");
        } else {
          addMessage(data.resposta, "bot", data.fontes);
        }
      } catch (e) {
        loadingEl.remove();
        estado.mensagens.pop();
        addMessage("Não consegui falar com o assistente agora. Tente novamente.", "bot");
      }
    }

    bubble.addEventListener("click", () => {
      widget.classList.toggle("open");
      estado.aberto = widget.classList.contains("open");
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
    });
    widget.querySelector("#da-rag-send").addEventListener("click", enviarPergunta);
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") enviarPergunta();
    });
  }

  // mkdocs-material com navigation.instant expõe um observable global
  // `document$` que emite toda vez que uma página é carregada (inclusive
  // a primeira). Isso garante que o widget seja recriado após cada troca
  // de página via navegação instantânea.
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(() => montarWidget());
  } else {
    // Fallback pra sites sem navigation.instant (carregamento normal)
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", montarWidget);
    } else {
      montarWidget();
    }
  }
})();