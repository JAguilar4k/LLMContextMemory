import { DomainError } from "../errors/DomainError.js";
import { isValidMessageRole, MessageRole } from "./MessageRole.js";

export class ChatMessage {
  #role;
  #content;
  #createdAt;

  constructor({ role, content, createdAt = new Date().toISOString() }) {
    if (!isValidMessageRole(role)) {
      throw new DomainError("Rol de mensaje inválido.");
    }

    if (typeof content !== "string") {
      throw new DomainError("El contenido del mensaje debe ser texto.");
    }

    this.#role = role;
    this.#content = content;
    this.#createdAt = this.#normalizeCreatedAt(createdAt);
    Object.freeze(this);
  }

  static user(content) {
    return new ChatMessage({ role: MessageRole.USER, content });
  }

  static assistant(content) {
    return new ChatMessage({ role: MessageRole.ASSISTANT, content });
  }

  static fromPrimitives(message) {
    return new ChatMessage({
      role: message?.role,
      content: typeof message?.content === "string" ? message.content : "",
      createdAt: message?.createdAt
    });
  }

  get role() {
    return this.#role;
  }

  get content() {
    return this.#content;
  }

  get createdAt() {
    return this.#createdAt;
  }

  toPrimitives() {
    return {
      role: this.#role,
      content: this.#content,
      createdAt: this.#createdAt
    };
  }

  #normalizeCreatedAt(createdAt) {
    if (typeof createdAt !== "string") {
      return new Date().toISOString();
    }

    const parsedDate = new Date(createdAt);
    return Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : createdAt;
  }
}
