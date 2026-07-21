const SELECTORS = {
  chat: "#conversation-feed",
  closeModal: "#close-modal",
  devtoolsCookie: "#devtools-cookie",
  devtoolsLocal: "#devtools-local",
  devtoolsNetwork: "#devtools-network",
  devtoolsSession: "#devtools-session",
  favorites: "#favorites-list",
  favoritesCount: "#favorites-count",
  form: "#prompt-form",
  issueToken: "#issue-token",
  messageCount: "#message-count",
  modal: "#expired-modal",
  prompt: "#prompt-input",
  renewToken: "#renew-token",
  saveFavorite: "#save-favorite",
  sendPrompt: "#send-prompt",
  status: "#form-status",
  tokenBadge: "#token-countdown"
};

export class WorkspaceUi {
  constructor({ root = document, workspaceApp }) {
    this.root = root;
    this.workspaceApp = workspaceApp;
    this.lastFocusedElement = null;
    this.countdownIntervalId = null;
    this.lastNetworkRequest = null;
  }

  mount() {
    const initialState = this.workspaceApp.getInitialState();
    this.renderChat(initialState.conversation);
    this.renderFavorites(initialState.favoritePrompts);
    this.renderDevTools(initialState);
    this.updateTokenCountdown();
    this.#bindEvents();

    this.countdownIntervalId = window.setInterval(() => this.updateTokenCountdown(), 1000);
  }

  renderChat(history = []) {
    const chat = this.#element("chat");
    const count = this.#element("messageCount");
    chat.replaceChildren();
    count.textContent = this.#formatMessageCount(history.length);

    if (!history.length) {
      chat.append(this.#createEmptyState("Aún no hay mensajes."));
      return;
    }

    history.forEach(message => {
      const isUser = message?.role === "user";
      const article = document.createElement("article");
      article.className = isUser
        ? "ml-auto max-w-[85%] rounded-lg bg-sky-700 px-4 py-3 text-white shadow-sm motion-safe:animate-[slide-up_220ms_ease-out_both]"
        : "mr-auto max-w-[85%] rounded-lg bg-zinc-200 px-4 py-3 text-zinc-950 shadow-sm motion-safe:animate-[slide-up_220ms_ease-out_both]";

      const label = document.createElement("p");
      label.className = "mb-1 text-xs font-black uppercase tracking-wide opacity-80";
      label.textContent = isUser ? "Tú" : "Asistente";

      const content = document.createElement("p");
      content.className = "whitespace-pre-wrap break-words text-sm leading-6";
      content.textContent = typeof message?.content === "string" ? message.content : "";

      article.append(label, content);
      chat.append(article);
    });

    chat.scrollTop = chat.scrollHeight;
  }

  renderFavorites(favoritePrompts = []) {
    const favorites = this.#element("favorites");
    const count = this.#element("favoritesCount");
    favorites.replaceChildren();
    count.textContent = String(favoritePrompts.length);

    if (!favoritePrompts.length) {
      favorites.append(this.#createEmptyState("No hay favoritos guardados."));
      return;
    }

    favoritePrompts.forEach((prompt, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "w-full rounded-lg border border-zinc-300 bg-stone-50 p-3 text-left text-sm font-semibold text-zinc-950 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-600 hover:bg-sky-50 hover:shadow-md active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300";
      button.textContent = prompt;
      button.setAttribute("aria-label", `Usar prompt favorito ${index + 1}`);
      button.addEventListener("click", () => {
        this.#element("prompt").value = prompt;
        this.#element("prompt").focus();
        this.#setStatus("");
      });

      favorites.append(button);
    });
  }

  renderDevTools(state = this.workspaceApp.getInitialState()) {
    const { conversation = [], favoritePrompts = [] } = state;
    const { hasToken, expiresAt } = this.workspaceApp.getTokenState();

    this.#element("devtoolsSession").textContent = JSON.stringify(conversation, null, 2);
    this.#element("devtoolsLocal").textContent = JSON.stringify(favoritePrompts, null, 2);
    this.#element("devtoolsCookie").textContent = this.#formatCookieState({ hasToken, expiresAt });
    const network = this.#element("devtoolsNetwork");
    network.textContent = this.#formatNetworkState();
    network.className = `mt-1 whitespace-pre-wrap text-xs leading-5 ${this.#networkTextClass()}`;
  }

  updateTokenCountdown() {
    const tokenBadge = this.#element("tokenBadge");
    const { hasToken, expiresAt } = this.workspaceApp.getTokenState();
    this.renderDevTools();

    tokenBadge.classList.remove("border-sky-400", "motion-safe:animate-[soft-glow_1600ms_ease-in-out_infinite]");

    if (!hasToken) {
      tokenBadge.textContent = "Token: sin sesión";
      return;
    }

    if (!expiresAt) {
      tokenBadge.textContent = "Token: activo";
      return;
    }

    const remainingTime = expiresAt.getTime() - Date.now();
    tokenBadge.textContent = remainingTime > 0
      ? `Token expira en ${this.#formatRemaining(remainingTime)}`
      : "Token: expirado";

    if (remainingTime > 0) {
      tokenBadge.classList.add("border-sky-400", "motion-safe:animate-[soft-glow_1600ms_ease-in-out_infinite]");
    }
  }

  showExpiredModal() {
    this.lastFocusedElement = document.activeElement;
    this.#element("modal").classList.remove("hidden");
    this.#element("modal").classList.add("grid");
    document.body.classList.add("overflow-hidden");
    this.#element("renewToken").focus();
  }

  hideExpiredModal() {
    this.#element("modal").classList.add("hidden");
    this.#element("modal").classList.remove("grid");
    document.body.classList.remove("overflow-hidden");
    this.lastFocusedElement?.focus?.();
  }

  #bindEvents() {
    this.#element("form").addEventListener("submit", async event => {
      event.preventDefault();

      const prompt = this.#element("prompt").value;

      if (!prompt.trim()) {
        this.#setStatus("Escribe un prompt antes de enviarlo.");
        return;
      }

      this.#setSubmitting(true);
      this.#setStatus("Enviando...", "success");
      this.#setNetworkRequest({ method: "POST", endpoint: "/api/llm", status: "Pendiente" });

      try {
        const conversation = await this.workspaceApp.sendPrompt(prompt);
        this.renderChat(conversation);
        this.#setNetworkRequest({ method: "POST", endpoint: "/api/llm", status: 200 });
        this.#element("prompt").value = "";
        this.#setStatus("");
      } catch (error) {
        this.#setNetworkRequest({
          method: "POST",
          endpoint: "/api/llm",
          status: error?.status || "Error",
          detail: error?.status === 401 ? "token expirado" : error?.message
        });
        if (error?.status === 401) {
          this.renderChat([]);
          this.showExpiredModal();
          this.#setStatus("");
        } else {
          this.#setStatus(error?.message || "No se pudo enviar el prompt.");
        }
      } finally {
        this.#setSubmitting(false);
        this.updateTokenCountdown();
      }
    });

    this.#element("saveFavorite").addEventListener("click", () => {
      const prompt = this.#element("prompt").value;

      if (!prompt.trim()) {
        this.#setStatus("Escribe un prompt para guardarlo como favorito.");
        return;
      }

      try {
        const favoritePrompts = this.workspaceApp.saveFavoritePrompt(prompt);
        this.renderFavorites(favoritePrompts);
        this.renderDevTools({ ...this.workspaceApp.getInitialState(), favoritePrompts });
        this.#setStatus("Prompt guardado en favoritos.", "success");
      } catch (error) {
        this.#setStatus(error?.message || "No se pudo guardar el favorito.");
      }
    });

    const renewToken = () => {
      this.workspaceApp.renewToken();
      this.hideExpiredModal();
      this.updateTokenCountdown();
      this.#setStatus("Token renovado.", "success");
      this.#element("prompt").focus();
    };

    this.#element("issueToken").addEventListener("click", renewToken);
    this.#element("renewToken").addEventListener("click", renewToken);
    this.#element("closeModal").addEventListener("click", () => this.hideExpiredModal());
    this.#element("modal").addEventListener("keydown", event => this.#trapModalFocus(event));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !this.#element("modal").classList.contains("hidden")) {
        this.hideExpiredModal();
      }
    });
  }

  #element(name) {
    const element = this.root.querySelector(SELECTORS[name]);

    if (!element) {
      throw new Error(`Elemento requerido no encontrado: ${SELECTORS[name]}`);
    }

    return element;
  }

  #setStatus(message = "", tone = "error") {
    const status = this.#element("status");
    status.textContent = message;
    status.className = tone === "success"
      ? "min-h-6 text-sm font-bold text-emerald-800"
      : "min-h-6 text-sm font-bold text-rose-800";
  }

  #setSubmitting(isSubmitting) {
    const submitButton = this.#element("sendPrompt");
    const promptInput = this.#element("prompt");

    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? "Enviando..." : "Enviar";
    promptInput.disabled = isSubmitting;
  }

  #createEmptyState(text) {
    const empty = document.createElement("p");
    empty.className = "rounded-md border border-dashed border-zinc-300 bg-stone-50 p-4 text-sm font-semibold text-zinc-600";
    empty.textContent = text;
    return empty;
  }

  #formatMessageCount(count) {
    return count === 1 ? "1 mensaje" : `${count} mensajes`;
  }

  #formatRemaining(milliseconds) {
    const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  }

  #setNetworkRequest(request) {
    this.lastNetworkRequest = request;
    this.renderDevTools();
  }

  #formatCookieState({ hasToken, expiresAt }) {
    if (!hasToken) {
      return "access_token: ausente";
    }

    if (!expiresAt) {
      return "access_token: presente\nExpira: desconocido";
    }

    const remainingTime = expiresAt.getTime() - Date.now();
    return remainingTime > 0
      ? `access_token: presente\nExpira en: ${this.#formatRemaining(remainingTime)}`
      : "access_token: expirado";
  }

  #formatNetworkState() {
    if (!this.lastNetworkRequest) {
      return "Sin solicitudes";
    }

    const { method, endpoint, status, detail } = this.lastNetworkRequest;
    return [
      `${method} ${endpoint}`,
      `Status: ${status}`,
      detail ? `(${detail})` : ""
    ].filter(Boolean).join("\n");
  }

  #networkTextClass() {
    if (this.lastNetworkRequest?.status === 401 || this.lastNetworkRequest?.status === "Error") {
      return "text-rose-300";
    }

    if (this.lastNetworkRequest?.status === 200) {
      return "text-emerald-300";
    }

    return "text-zinc-300";
  }

  #focusableModalItems() {
    return [...this.#element("modal").querySelectorAll("button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled])")];
  }

  #trapModalFocus(event) {
    if (event.key !== "Tab") {
      return;
    }

    const items = this.#focusableModalItems();

    if (!items.length) {
      return;
    }

    const first = items[0];
    const last = items.at(-1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
