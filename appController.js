import { createWorkspaceApp } from "./src/composition/createWorkspaceApp.js";

const workspaceApp = createWorkspaceApp();

const defaultCallbacks = {
  onConversationUpdate: () => {},
  onFavoritesUpdate: () => {},
  onSessionExpired: () => {},
  onError: () => {}
};

let callbacks = { ...defaultCallbacks };

export function configureAppController(nextCallbacks = {}) {
  callbacks = {
    ...callbacks,
    ...Object.fromEntries(
      Object.entries(nextCallbacks).filter(([, callback]) => typeof callback === "function")
    )
  };
}

function notify(callbackName, payload) {
  try {
    callbacks[callbackName](payload);
  } catch (error) {
    callbacks.onError(error);
  }
}

export async function handleSendPrompt(promptText) {
  try {
    const conversation = await workspaceApp.sendPrompt(promptText);
    notify("onConversationUpdate", conversation);
    return conversation;
  } catch (error) {
    if (error?.status === 401) {
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

export function handleSaveFavoritePrompt(promptText) {
  const favoritePrompts = workspaceApp.saveFavoritePrompt(promptText);
  notify("onFavoritesUpdate", favoritePrompts);
  return favoritePrompts;
}

export function handleRenewToken(minutes = 2) {
  return workspaceApp.renewToken(minutes);
}

export function getTokenState() {
  return workspaceApp.getTokenState();
}

export function getInitialAppState() {
  return workspaceApp.getInitialState();
}

export default {
  configureAppController,
  handleSendPrompt,
  handleSaveFavoritePrompt,
  handleRenewToken,
  getTokenState,
  getInitialAppState
};
