/**
 * Network Layer
 * -------------
 * This module simulates a POST /api/llm request. It does not know how state is
 * stored and only depends on the token accessor exposed by cookieManager.
 */

import { getToken } from "./cookieManager.js";

const MOCK_ENDPOINT = "/api/llm";
const MOCK_RESPONSE_TEXT = "Esta es una respuesta simulada basada en tu prompt";
const MOCK_LATENCY_MS = 500;

/**
 * Lightweight HTTP-style error so the controller can branch by status code.
 */
export class HttpError extends Error {
  constructor(status, message, details = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Simulates a successful asynchronous fetch call to the mock LLM endpoint.
 */
function simulateFetchRequest(payload) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        ok: true,
        status: 200,
        endpoint: MOCK_ENDPOINT,
        method: "POST",
        body: payload,
        text: MOCK_RESPONSE_TEXT
      });
    }, MOCK_LATENCY_MS);
  });
}

/**
 * Sends a prompt and its conversation history to the mock LLM endpoint.
 *
 * @param {string} promptText - User prompt to send.
 * @param {Array<object>} conversationHistory - Current chat history.
 * @returns {Promise<string>} Mocked LLM response text.
 */
export async function sendMessage(promptText, conversationHistory = []) {
  try {
    const token = getToken();

    if (!token) {
      throw new HttpError(401, "Token expirado", {
        endpoint: MOCK_ENDPOINT,
        reason: "ACCESS_TOKEN_MISSING_OR_EXPIRED"
      });
    }

    if (typeof promptText !== "string" || promptText.trim() === "") {
      throw new HttpError(400, "Prompt inválido", {
        endpoint: MOCK_ENDPOINT,
        reason: "EMPTY_PROMPT"
      });
    }

    if (!Array.isArray(conversationHistory)) {
      throw new HttpError(422, "Historial de conversación inválido", {
        endpoint: MOCK_ENDPOINT,
        reason: "CONVERSATION_HISTORY_NOT_ARRAY"
      });
    }

    const response = await simulateFetchRequest({
      prompt: promptText,
      history: conversationHistory,
      token
    });

    return response.text;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(500, "Error inesperado al enviar el mensaje", {
      endpoint: MOCK_ENDPOINT,
      originalError: error
    });
  }
}

export default {
  sendMessage,
  HttpError
};
