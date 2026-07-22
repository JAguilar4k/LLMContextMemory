const FAVORITES_KEY = "favoritos";

export class LocalFavoritePromptRepository {
  #storage;

  constructor(storage = globalThis.localStorage) {
    this.#storage = storage;
    Object.freeze(this);
  }

  findAll() {
    try {
      return this.#parseArray(this.#storage.getItem(FAVORITES_KEY))
        .filter(prompt => typeof prompt === "string");
    } catch {
      return [];
    }
  }

  append(favoritePrompt) {
    const updatedFavorites = [...this.findAll(), favoritePrompt.toString()];

    try {
      this.#storage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      return updatedFavorites;
    } catch (error) {
      throw this.#storageError("No se pudo guardar el prompt favorito en localStorage.", error);
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
}
