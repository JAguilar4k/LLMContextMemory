import { FavoritePrompt } from "../../domain/favorites/FavoritePrompt.js";
import { assertPort } from "../ports/assertPort.js";

export class SaveFavoritePromptUseCase {
  #favoritePromptRepository;

  constructor({ favoritePromptRepository }) {
    assertPort("FavoritePromptRepositoryPort", favoritePromptRepository, ["append"]);

    this.#favoritePromptRepository = favoritePromptRepository;
    Object.freeze(this);
  }

  execute(promptText) {
    const favoritePrompt = new FavoritePrompt(promptText);
    return this.#favoritePromptRepository.append(favoritePrompt);
  }
}
