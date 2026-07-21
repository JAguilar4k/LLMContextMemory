import { DomainError } from "../errors/DomainError.js";

const MAX_PROMPT_LENGTH = 2000;

export class PromptText {
  constructor(value) {
    const normalizedValue = typeof value === "string" ? value.trim() : "";

    if (!normalizedValue) {
      throw new DomainError("El prompt no puede estar vacío.");
    }

    if (normalizedValue.length > MAX_PROMPT_LENGTH) {
      throw new DomainError(`El prompt no puede superar ${MAX_PROMPT_LENGTH} caracteres.`);
    }

    this.value = normalizedValue;
    Object.freeze(this);
  }

  toString() {
    return this.value;
  }
}
