import { assertPort } from "../ports/assertPort.js";

export class GetWorkspaceStateUseCase {
  #conversationRepository;
  #favoritePromptRepository;

  constructor({ conversationRepository, favoritePromptRepository }) {
    assertPort("ConversationRepositoryPort", conversationRepository, ["findCurrent"]);
    assertPort("FavoritePromptRepositoryPort", favoritePromptRepository, ["findAll"]);

    this.#conversationRepository = conversationRepository;
    this.#favoritePromptRepository = favoritePromptRepository;
    Object.freeze(this);
  }

  execute() {
    return {
      conversation: this.#conversationRepository.findCurrent().toPrimitives(),
      favoritePrompts: this.#favoritePromptRepository.findAll()
    };
  }
}
