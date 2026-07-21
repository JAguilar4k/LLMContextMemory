import { CookieTokenRepository } from "./src/infrastructure/browser/CookieTokenRepository.js";

const tokenRepository = new CookieTokenRepository();

export function setToken(tokenValue, minutes) {
  tokenRepository.setToken(tokenValue, minutes);
}

export function getToken() {
  return tokenRepository.getToken();
}

export function getTokenExpiration() {
  return tokenRepository.getExpiration();
}

export function deleteToken() {
  tokenRepository.deleteToken();
}

export default {
  setToken,
  getToken,
  getTokenExpiration,
  deleteToken
};
