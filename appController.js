/**
 * Integration / Orchestration Layer
 * ---------------------------------
 * The UI imports this controller, registers callbacks, and calls the exported
 * handlers. This file coordinates storage and network modules without owning
 * DOM selectors, markup, styling, or rendering details.
 */

import {
  clearConversation,
  getConversation,
  getFavoritePrompts,
  saveConversation,
  saveFavoritePrompt
} from "./storageManager.js";
import { sendMessage } from "./apiService.js";

const ROLE_USER = "user";
const ROLE_ASSISTANT = "assistant";

const defaultCallbacks = {
  onConversationUpdate: () => {},
  onFavoritesUpdate: () => {},
  onSessionExpired: () => {},
  onError: () => {}
};

let callbacks = { ...defaultCallbacks };

/**
 * Registers UI callbacks without coupling this module to any specific DOM.
 *
 * @param {object} nextCallbacks
 * @param {(messages: Array<object>) => void} [nextCallbacks.onConversationUpdate]
 * @param {(favorites: string[]) => void} [nextCallbacks.onFavoritesUpdate]
 * @param {(payload: object) => void} [nextCallbacks.onSessionExpired]
 * @param {(error: Error) => void} [nextCallbacks.onError]
 */
export function configureAppController(nextCallbacks = {}) {
  callbacks = {
    ...callbacks,
    ...Object.fromEntries(
      Object.entries(nextCallbacks).filter(([, callback]) => typeof callback === "function")
    )
  };
}

/**
 * Runs UI callbacks defensively so rendering failures do not corrupt state or
 * get mistaken for API/storage failures.
 */
function notify(callbackName, payload) {
  try {
    callbacks[callbackName](payload);
  } catch (error) {
    callbacks.onError(error);
  }
}

/**
 * Creates a normalized chat message object for persistent conversation state.
 */
function createMessage(role, content) {
  return {
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

/**
 * Main prompt flow used by the UI.
 *
 * @param {string} promptText - Raw prompt text received from the UI.
 * @returns {Promise<Array<object>>} Latest conversation after the operation.
 */
export async function handleSendPrompt(promptText) {
  try {
    const normalizedPrompt = typeof promptText === "string" ? promptText.trim() : "";

    if (!normalizedPrompt) {
      return getConversation();
    }

    const currentHistory = getConversation();
    const historyWithUserPrompt = [
      ...currentHistory,
      createMessage(ROLE_USER, normalizedPrompt)
    ];

    saveConversation(historyWithUserPrompt);
    notify("onConversationUpdate", historyWithUserPrompt);

    const responseText = await sendMessage(normalizedPrompt, historyWithUserPrompt);
    const completedHistory = [
      ...historyWithUserPrompt,
      createMessage(ROLE_ASSISTANT, responseText)
    ];

    saveConversation(completedHistory);
    notify("onConversationUpdate", completedHistory);

    return completedHistory;
  } catch (error) {
    if (error && error.status === 401) {
      clearConversation();
      notify("onConversationUpdate", []);
      notify("onSessionExpired", {
        status: 401,
        message: "Sesión expirada (401)",
        error
      });

      return [];
    }

    notify("onError", error);
    throw error;
  }
}

/**
 * Optional orchestration helper for the favorites workflow.
 */
export function handleSaveFavoritePrompt(promptText) {
  const normalizedPrompt = typeof promptText === "string" ? promptText.trim() : "";

  if (!normalizedPrompt) {
    return getFavoritePrompts();
  }

  const updatedFavorites = saveFavoritePrompt(normalizedPrompt);
  notify("onFavoritesUpdate", updatedFavorites);

  return updatedFavorites;
}

/**
 * Gives the UI a clean bootstrapping snapshot without reading storage itself.
 */
export function getInitialAppState() {
  return {
    conversation: getConversation(),
    favoritePrompts: getFavoritePrompts()
  };
}

export default {
  configureAppController,
  handleSendPrompt,
  handleSaveFavoritePrompt,
  getInitialAppState
};
