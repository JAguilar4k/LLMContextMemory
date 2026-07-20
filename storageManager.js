/**
 * State Persistence Layer
 * -----------------------
 * Conversation state is scoped to one browser tab through sessionStorage.
 * Favorite prompts are durable across browser restarts through localStorage.
 */

const CONVERSATION_KEY = "prompt_workspace_conversation";
const FAVORITES_KEY = "prompt_workspace_favorite_prompts";

/**
 * Parses a JSON array from storage with a safe default. Corrupted or unexpected
 * storage values are treated as empty arrays instead of crashing the app.
 */
function parseStoredArray(rawValue) {
  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

/**
 * Wraps storage write errors with a clear application-level message.
 */
function createStorageError(message, originalError) {
  const error = new Error(message);
  error.cause = originalError;
  return error;
}

/**
 * Saves the full conversation in sessionStorage.
 *
 * @param {Array<object>} messages - Current chat history.
 */
export function saveConversation(messages) {
  if (!Array.isArray(messages)) {
    throw new TypeError("La conversación debe ser un arreglo.");
  }

  try {
    sessionStorage.setItem(CONVERSATION_KEY, JSON.stringify(messages));
  } catch (error) {
    throw createStorageError("No se pudo guardar la conversación en sessionStorage.", error);
  }
}

/**
 * Retrieves the current conversation from sessionStorage.
 *
 * @returns {Array<object>} Stored conversation, or an empty array when missing.
 */
export function getConversation() {
  try {
    return parseStoredArray(sessionStorage.getItem(CONVERSATION_KEY));
  } catch {
    return [];
  }
}

/**
 * Clears only the current conversation from sessionStorage.
 */
export function clearConversation() {
  try {
    sessionStorage.removeItem(CONVERSATION_KEY);
  } catch (error) {
    throw createStorageError("No se pudo limpiar la conversación de sessionStorage.", error);
  }
}

/**
 * Appends one prompt to the durable favorites list without overwriting the
 * prompts already saved by the user.
 *
 * @param {string} promptText - Prompt to add to localStorage favorites.
 * @returns {string[]} Updated favorite prompt list.
 */
export function saveFavoritePrompt(promptText) {
  if (typeof promptText !== "string" || promptText.trim() === "") {
    throw new TypeError("El prompt favorito debe ser un string no vacío.");
  }

  const favoritePrompts = getFavoritePrompts();
  const updatedFavorites = [...favoritePrompts, promptText];

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    return updatedFavorites;
  } catch (error) {
    throw createStorageError("No se pudo guardar el prompt favorito en localStorage.", error);
  }
}

/**
 * Retrieves favorite prompts from localStorage.
 *
 * @returns {string[]} Stored favorite prompts, or an empty array when missing.
 */
export function getFavoritePrompts() {
  try {
    return parseStoredArray(localStorage.getItem(FAVORITES_KEY));
  } catch {
    return [];
  }
}

export default {
  saveConversation,
  getConversation,
  clearConversation,
  saveFavoritePrompt,
  getFavoritePrompts
};
