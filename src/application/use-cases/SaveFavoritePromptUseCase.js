import { FavoritePrompt } from "../../domain/favorites/FavoritePrompt.js";

export class SaveFavoritePromptUseCase {
  constructor({ favoritePromptRepository }) {
    this.favoritePromptRepository = favoritePromptRepository;
  }

  execute(promptText) {
    const favoritePrompt = new FavoritePrompt(promptText);
    return this.favoritePromptRepository.append(favoritePrompt);
  }
}
