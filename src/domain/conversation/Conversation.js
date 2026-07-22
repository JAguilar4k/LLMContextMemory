import { ChatMessage } from "./ChatMessage.js";

export class Conversation {
  #messages;

  constructor(messages = []) {
    this.#messages = Object.freeze(messages.map(message =>
      message instanceof ChatMessage ? message : ChatMessage.fromPrimitives(message)
    ));
    Object.freeze(this);
  }

  static empty() {
    return new Conversation([]);
  }

  static fromPrimitives(messages) {
    return Array.isArray(messages) ? new Conversation(messages) : Conversation.empty();
  }

  addUserPrompt(promptText) {
    return new Conversation([...this.#messages, ChatMessage.user(promptText.toString())]);
  }

  addAssistantResponse(responseText) {
    return new Conversation([...this.#messages, ChatMessage.assistant(responseText)]);
  }

  toPrimitives() {
    return this.#messages.map(message => message.toPrimitives());
  }
}
