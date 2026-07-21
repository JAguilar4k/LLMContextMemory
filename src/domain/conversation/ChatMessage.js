import { DomainError } from "../errors/DomainError.js";
import { isValidMessageRole, MessageRole } from "./MessageRole.js";

export class ChatMessage {
  constructor({ role, content, createdAt = new Date().toISOString() }) {
    if (!isValidMessageRole(role)) {
      throw new DomainError("Rol de mensaje inválido.");
    }

    if (typeof content !== "string") {
      throw new DomainError("El contenido del mensaje debe ser texto.");
    }

    this.role = role;
    this.content = content;
    this.createdAt = createdAt;
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
      createdAt: typeof message?.createdAt === "string" ? message.createdAt : new Date().toISOString()
    });
  }

  toPrimitives() {
    return {
      role: this.role,
      content: this.content,
      createdAt: this.createdAt
    };
  }
}
