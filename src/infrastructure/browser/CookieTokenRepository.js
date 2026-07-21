const ACCESS_TOKEN_COOKIE = "access_token";
const ACCESS_TOKEN_EXPIRY_COOKIE = "access_token_expires_at";
const COOKIE_PATH = "/";

export class CookieTokenRepository {
  constructor({ documentRef = globalThis.document, locationRef = globalThis.location } = {}) {
    this.documentRef = documentRef;
    this.locationRef = locationRef;
  }

  setToken(tokenValue, minutes) {
    this.#assertCookieSupport();

    if (typeof tokenValue !== "string" || tokenValue.trim() === "") {
      throw new TypeError("El token debe ser un string no vacío.");
    }

    if (!Number.isFinite(minutes) || minutes <= 0) {
      throw new RangeError("La expiración debe ser un número positivo de minutos.");
    }

    const durationMs = minutes * 60 * 1000;
    const maxAgeSeconds = Math.max(1, Math.ceil(durationMs / 1000));
    const expiresAt = new Date(Date.now() + durationMs);
    const attributes = this.#buildCookieAttributes(maxAgeSeconds, expiresAt);

    this.documentRef.cookie = [
      `${encodeURIComponent(ACCESS_TOKEN_COOKIE)}=${encodeURIComponent(tokenValue)}`,
      ...attributes
    ].join("; ");

    this.documentRef.cookie = [
      `${encodeURIComponent(ACCESS_TOKEN_EXPIRY_COOKIE)}=${String(expiresAt.getTime())}`,
      ...attributes
    ].join("; ");
  }

  getToken() {
    return this.#getCookieValue(ACCESS_TOKEN_COOKIE);
  }

  getExpiration() {
    if (!this.getToken()) {
      return null;
    }

    const milliseconds = Number(this.#getCookieValue(ACCESS_TOKEN_EXPIRY_COOKIE));

    return Number.isFinite(milliseconds) && milliseconds > Date.now()
      ? new Date(milliseconds)
      : null;
  }

  deleteToken() {
    this.#assertCookieSupport();

    const attributes = this.#buildCookieAttributes(0, new Date(0));

    this.documentRef.cookie = [
      `${encodeURIComponent(ACCESS_TOKEN_COOKIE)}=`,
      ...attributes
    ].join("; ");

    this.documentRef.cookie = [
      `${encodeURIComponent(ACCESS_TOKEN_EXPIRY_COOKIE)}=`,
      ...attributes
    ].join("; ");
  }

  #assertCookieSupport() {
    if (!this.documentRef || typeof this.documentRef.cookie !== "string") {
      throw new Error("Cookie API no disponible fuera del navegador.");
    }
  }

  #buildCookieAttributes(maxAgeSeconds, expiresAt) {
    return [
      `Max-Age=${maxAgeSeconds}`,
      `Expires=${expiresAt.toUTCString()}`,
      `Path=${COOKIE_PATH}`,
      "SameSite=Strict",
      this.locationRef?.protocol === "https:" ? "Secure" : null
    ].filter(Boolean);
  }

  #getCookieValue(cookieName) {
    if (!this.documentRef || typeof this.documentRef.cookie !== "string") {
      return null;
    }

    const cookies = this.documentRef.cookie ? this.documentRef.cookie.split("; ") : [];

    for (const cookie of cookies) {
      const separatorIndex = cookie.indexOf("=");
      const rawName = separatorIndex >= 0 ? cookie.slice(0, separatorIndex) : cookie;
      const rawValue = separatorIndex >= 0 ? cookie.slice(separatorIndex + 1) : "";

      if (this.#safeDecode(rawName) === cookieName) {
        return this.#safeDecode(rawValue);
      }
    }

    return null;
  }

  #safeDecode(value) {
    try {
      return decodeURIComponent(value);
    } catch {
      return null;
    }
  }
}
