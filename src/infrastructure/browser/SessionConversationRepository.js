import { Conversation } from "../../domain/conversation/Conversation.js";

const CONVERSATION_KEY = "conversacion";
const LEGACY_FIXED_RESPONSE = "Esta es una respuesta simulada basada en tu prompt";

export class SessionConversationRepository {
  constructor(storage = globalThis.sessionStorage) {
    this.storage = storage;
  }

  findCurrent() {
    try {
      const messages = this.#parseArray(this.storage.getItem(CONVERSATION_KEY));

      if (this.#hasLegacyFixedResponses(messages)) {
        this.clear();
        return Conversation.empty();
      }

      return Conversation.fromPrimitives(messages);
    } catch {
      return Conversation.empty();
    }
  }

  save(conversation) {
    try {
      this.storage.setItem(CONVERSATION_KEY, JSON.stringify(conversation.toPrimitives()));
    } catch (error) {
      throw this.#storageError("No se pudo guardar la conversación en sessionStorage.", error);
    }
  }

  clear() {
    try {
      this.storage.removeItem(CONVERSATION_KEY);
    } catch (error) {
      throw this.#storageError("No se pudo limpiar la conversación de sessionStorage.", error);
    }
  }

  #parseArray(rawValue) {
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

  #storageError(message, originalError) {
    const error = new Error(message);
    error.cause = originalError;
    return error;
  }

  #hasLegacyFixedResponses(messages) {
    return messages.some(message =>
      message?.role === "assistant" &&
      typeof message.content === "string" &&
      message.content.includes(LEGACY_FIXED_RESPONSE)
    );
  }
}
