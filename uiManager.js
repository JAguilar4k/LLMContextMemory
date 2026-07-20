/**
 * Presentation layer only: renders DOM, handles browser events, and delegates
 * all persistence, authentication, and request work to appController.
 */
import {
  configureAppController,
  getInitialAppState,
  getTokenState,
  handleRenewToken,
  handleSaveFavoritePrompt,
  handleSendPrompt
} from "./appController.js";

const SELECTORS = {
  chat: "#conversation-feed",
  favorites: "#favorites-list",
  form: "#prompt-form",
  prompt: "#prompt-input",
  saveFavorite: "#save-favorite",
  modal: "#expired-modal",
  renew: "#renew-token",
  issue: "#issue-token",
  tokenBadge: "#token-countdown",
  status: "#form-status",
  sessionValue: "#devtools-session",
  localValue: "#devtools-local",
  cookieValue: "#devtools-cookie",
  networkValue: "#devtools-network"
};

let elements;
let lastFocusedElement;
let latestNetwork = { method: "—", endpoint: "—", status: "Sin solicitudes" };

function el(name) { return elements.querySelector(SELECTORS[name]); }
function messageText(message) { return message.content ?? message.contenido ?? ""; }
function messageRole(message) { return message.role ?? (message.rol === "ia" ? "assistant" : message.rol); }

function pretty(value) { return JSON.stringify(value, null, 2); }

export function renderChat(history = []) {
  const chat = el("chat");
  chat.replaceChildren();

  if (!history.length) {
    const empty = document.createElement("p");
    empty.className = "text-slate-700";
    empty.textContent = "Aún no hay mensajes. Escribe un prompt para comenzar.";
    chat.append(empty);
  }

  history.forEach(message => {
    const isUser = messageRole(message) === "user";
    const article = document.createElement("article");
    article.className = isUser
      ? "ml-auto max-w-[85%] rounded-xl bg-blue-800 px-4 py-3 text-white shadow-sm"
      : "mr-auto max-w-[85%] rounded-xl bg-slate-200 px-4 py-3 text-slate-950 shadow-sm";
    const label = document.createElement("p");
    label.className = "mb-1 text-sm font-bold";
    label.textContent = isUser ? "Tú" : "Asistente";
    const content = document.createElement("p");
    content.className = "whitespace-pre-wrap break-words";
    content.textContent = messageText(message);
    article.append(label, content);
    chat.append(article);
  });
  chat.scrollTop = chat.scrollHeight;
}

export function renderFavorites(list = []) {
  const favorites = el("favorites");
  favorites.replaceChildren();
  if (!list.length) {
    const empty = document.createElement("p");
    empty.className = "text-slate-700";
    empty.textContent = "No has guardado prompts todavía.";
    favorites.append(empty);
  }
  list.forEach((prompt, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "w-full rounded-lg border-2 border-slate-400 bg-white p-3 text-left text-slate-950 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600";
    button.textContent = prompt;
    button.setAttribute("aria-label", `Usar prompt favorito ${index + 1}: ${prompt}`);
    button.addEventListener("click", () => {
      el("prompt").value = prompt;
      el("prompt").focus();
    });
    favorites.append(button);
  });
}

export function updateDevToolsPanel(state = {}) {
  const conversation = state.conversation ?? [];
  const favoritePrompts = state.favoritePrompts ?? [];
  el("sessionValue").textContent = pretty(conversation);
  el("localValue").textContent = pretty(favoritePrompts);
  const { hasToken, expiresAt } = getTokenState();
  el("cookieValue").textContent = hasToken
    ? `access_token: presente\nExpira: ${expiresAt ? expiresAt.toLocaleTimeString("es-CR") : "desconocido"}`
    : "access_token: no presente";
  el("networkValue").textContent = `${latestNetwork.method} ${latestNetwork.endpoint}\nEstado: ${latestNetwork.status}`;
}

function setStatus(message = "") { el("status").textContent = message; }
function formatRemaining(milliseconds) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function updateTokenCountdown() {
  const { hasToken, expiresAt: expiration } = getTokenState();
  const tokenBadge = el("tokenBadge");
  if (!hasToken || !expiration) {
    tokenBadge.textContent = "Token: sin sesión";
    updateDevToolsPanel(getInitialAppState());
    return;
  }
  const left = expiration.getTime() - Date.now();
  tokenBadge.textContent = left > 0 ? `Token expira en: ${formatRemaining(left)}` : "Token: expirado";
  updateDevToolsPanel(getInitialAppState());
}

function focusableModalItems() {
  return [...el("modal").querySelectorAll('button:not([disabled]), [href], input:not([disabled])')];
}

function trapFocus(event) {
  if (event.key !== "Tab") return;
  const items = focusableModalItems();
  if (!items.length) return;
  const first = items[0], last = items.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

export function showExpiredModal() {
  lastFocusedElement = document.activeElement;
  el("modal").classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
  el("renew").focus();
}

export function hideExpiredModal() {
  el("modal").classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
  lastFocusedElement?.focus?.();
}

function bindEvents() {
  el("form").addEventListener("submit", async event => {
    event.preventDefault();
    const prompt = el("prompt").value;
    if (!prompt.trim()) { setStatus("Escribe un prompt antes de enviarlo."); return; }
    setStatus("Enviando…");
    el("prompt").value = "";
    try { await handleSendPrompt(prompt); setStatus(""); }
    catch { setStatus("No se pudo enviar el prompt. Inténtalo de nuevo."); }
  });
  el("saveFavorite").addEventListener("click", () => {
    const prompt = el("prompt").value;
    if (!prompt.trim()) { setStatus("Escribe un prompt para guardarlo como favorito."); return; }
    handleSaveFavoritePrompt(prompt);
    setStatus("Prompt guardado en favoritos.");
  });
  const renew = () => { handleRenewToken(); hideExpiredModal(); updateTokenCountdown(); el("prompt").focus(); };
  el("renew").addEventListener("click", renew);
  el("issue").addEventListener("click", renew);
  el("modal").addEventListener("keydown", trapFocus);
}

export function mountUI(root = document) {
  elements = root;
  configureAppController({
    onConversationUpdate: conversation => { renderChat(conversation); updateDevToolsPanel({ ...getInitialAppState(), conversation }); },
    onFavoritesUpdate: favoritePrompts => { renderFavorites(favoritePrompts); updateDevToolsPanel({ ...getInitialAppState(), favoritePrompts }); },
    onSessionExpired: () => { showExpiredModal(); updateDevToolsPanel(getInitialAppState()); },
    onNetworkStatus: network => { latestNetwork = network; updateDevToolsPanel(getInitialAppState()); },
    onError: error => setStatus(error?.message || "Ocurrió un error inesperado.")
  });
  const initial = getInitialAppState();
  renderChat(initial.conversation);
  renderFavorites(initial.favoritePrompts);
  updateDevToolsPanel(initial);
  updateTokenCountdown();
  bindEvents();
  window.setInterval(updateTokenCountdown, 1000);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => mountUI());
else mountUI();
