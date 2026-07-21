export class SecureTokenGenerator {
  generate() {
    if (globalThis.crypto?.randomUUID) {
      return `mock_${globalThis.crypto.randomUUID()}`;
    }

    if (globalThis.crypto?.getRandomValues) {
      const randomBytes = new Uint32Array(4);
      globalThis.crypto.getRandomValues(randomBytes);
      return `mock_${Array.from(randomBytes, value => value.toString(16).padStart(8, "0")).join("")}`;
    }

    return `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}
