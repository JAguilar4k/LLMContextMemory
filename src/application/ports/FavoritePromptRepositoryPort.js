/**
 * @typedef {import("../../domain/favorites/FavoritePrompt.js").FavoritePrompt} FavoritePrompt
 *
 * @typedef {object} FavoritePromptRepositoryPort
 * @property {() => string[]} findAll
 * @property {(favoritePrompt: FavoritePrompt) => string[]} append
 */

export {};
