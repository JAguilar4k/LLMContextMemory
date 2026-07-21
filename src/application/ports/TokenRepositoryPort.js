/**
 * @typedef {object} TokenRepositoryPort
 * @property {(tokenValue: string, minutes: number) => void} setToken
 * @property {() => string|null} getToken
 * @property {() => Date|null} getExpiration
 * @property {() => void} deleteToken
 **/

export {};
