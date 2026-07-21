import { Conversation } from "./src/domain/conversation/Conversation.js";
import { FavoritePrompt } from "./src/domain/favorites/FavoritePrompt.js";
import { LocalFavoritePromptRepository } from "./src/infrastructure/browser/LocalFavoritePromptRepository.js";
import { SessionConversationRepository } from "./src/infrastructure/browser/SessionConversationRepository.js";

const conversationRepository = new SessionConversationRepository();
const favoritePromptRepository = new LocalFavoritePromptRepository();

export function saveConversation(messages) {
  conversationRepository.save(Conversation.fromPrimitives(messages));
}

export function getConversation() {
  return conversationRepository.findCurrent().toPrimitives();
}

export function clearConversation() {
  conversationRepository.clear();
}

export function saveFavoritePrompt(promptText) {
  return favoritePromptRepository.append(new FavoritePrompt(promptText));
}

export function getFavoritePrompts() {
  return favoritePromptRepository.findAll();
}

export default {
  saveConversation,
  getConversation,
  clearConversation,
  saveFavoritePrompt,
  getFavoritePrompts
};
