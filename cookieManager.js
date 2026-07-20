/**
 * Access Token Layer
 * ------------------
 * This module is the only place that reads or writes the browser cookie used
 * by the network layer. JavaScript cannot create HttpOnly cookies, so a real
 * backend should still set sensitive production tokens whenever possible.
 */

const TOKEN_COOKIE_NAME = "access_token";
const TOKEN_EXPIRY_COOKIE_NAME = "access_token_expires_at";
const COOKIE_PATH = "/";

/**
 * Decodes a cookie segment safely. Invalid escape sequences should not break
 * token lookup; they simply make that cookie unusable.
 */
function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

/**
 * Verifies that the browser cookie API is available before writing cookies.
 */
function assertCookieSupport() {
  if (typeof document === "undefined") {
    throw new Error("Cookie API no disponible fuera del navegador.");
  }
}

/**
 * Sets the access token cookie for the exact duration requested.
 *
 * @param {string} tokenValue - Token value to persist in the access_token cookie.
 * @param {number} minutes - Number of minutes before the cookie expires.
 */
export function setToken(tokenValue, minutes) {
  assertCookieSupport();

  if (typeof tokenValue !== "string" || tokenValue.trim() === "") {
    throw new TypeError("El token debe ser un string no vacío.");
  }

  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw new RangeError("La expiración debe ser un número positivo de minutos.");
  }

  const durationMs = minutes * 60 * 1000;
  const expiresAt = new Date(Date.now() + durationMs);

  /*
   * Max-Age is the most direct browser instruction for relative expiration.
   * Expires is included as a compatibility fallback for older clients.
   */
  const maxAgeSeconds = Math.ceil(durationMs / 1000);
  const encodedName = encodeURIComponent(TOKEN_COOKIE_NAME);
  const encodedValue = encodeURIComponent(tokenValue);

  document.cookie = [
    `${encodedName}=${encodedValue}`,
    `Max-Age=${maxAgeSeconds}`,
    `Expires=${expiresAt.toUTCString()}`,
    `Path=${COOKIE_PATH}`,
    "SameSite=Lax"
  ].join("; ");

  // Browsers intentionally do not expose a cookie's Expires attribute to
  // JavaScript. A matching, non-sensitive timestamp cookie lets the UI show
  // the real countdown after a refresh without inspecting the token value.
  document.cookie = [
    `${encodeURIComponent(TOKEN_EXPIRY_COOKIE_NAME)}=${expiresAt.getTime()}`,
    `Max-Age=${maxAgeSeconds}`,
    `Expires=${expiresAt.toUTCString()}`,
    `Path=${COOKIE_PATH}`,
    "SameSite=Lax"
  ].join("; ");
}

/**
 * Retrieves the current access token.
 *
 * @returns {string|null} The token value, or null when the cookie is missing,
 * expired, malformed, or inaccessible.
 */
export function getToken() {
  if (typeof document === "undefined" || typeof document.cookie !== "string") {
    return null;
  }

  const cookies = document.cookie ? document.cookie.split("; ") : [];

  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf("=");
    const rawName = separatorIndex >= 0 ? cookie.slice(0, separatorIndex) : cookie;
    const rawValue = separatorIndex >= 0 ? cookie.slice(separatorIndex + 1) : "";
    const name = safeDecode(rawName);

    if (name === TOKEN_COOKIE_NAME) {
      return safeDecode(rawValue);
    }
  }

  return null;
}

/**
 * Gets the expiry associated with the current access token.
 * @returns {Date|null}
 */
export function getTokenExpiration() {
  if (typeof document === "undefined" || typeof document.cookie !== "string") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .map(cookie => cookie.split("="))
    .find(([name]) => safeDecode(name) === TOKEN_EXPIRY_COOKIE_NAME);
  const milliseconds = match ? Number(safeDecode(match.slice(1).join("="))) : NaN;

  return Number.isFinite(milliseconds) && milliseconds > Date.now()
    ? new Date(milliseconds)
    : null;
}

/**
 * Explicitly expires the access token cookie.
 */
export function deleteToken() {
  assertCookieSupport();

  document.cookie = [
    `${encodeURIComponent(TOKEN_COOKIE_NAME)}=`,
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    `Path=${COOKIE_PATH}`,
    "SameSite=Lax"
  ].join("; ");
  document.cookie = [
    `${encodeURIComponent(TOKEN_EXPIRY_COOKIE_NAME)}=`,
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    `Path=${COOKIE_PATH}`,
    "SameSite=Lax"
  ].join("; ");
}

export default {
  setToken,
  getToken,
  getTokenExpiration,
  deleteToken
};
