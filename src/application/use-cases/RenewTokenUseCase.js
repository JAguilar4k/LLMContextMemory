import { assertPort } from "../ports/assertPort.js";

const DEFAULT_TOKEN_MINUTES = 2;

export class RenewTokenUseCase {
  #tokenRepository;
  #tokenGenerator;

  constructor({ tokenRepository, tokenGenerator }) {
    assertPort("TokenRepositoryPort", tokenRepository, ["setToken"]);
    assertPort("TokenGeneratorPort", tokenGenerator, ["generate"]);

    this.#tokenRepository = tokenRepository;
    this.#tokenGenerator = tokenGenerator;
    Object.freeze(this);
  }

  execute(minutes = DEFAULT_TOKEN_MINUTES) {
    const tokenLifetimeMinutes = Number.isFinite(minutes) && minutes > 0
      ? minutes
      : DEFAULT_TOKEN_MINUTES;

    this.#tokenRepository.setToken(this.#tokenGenerator.generate(), tokenLifetimeMinutes);

    return {
      expiresAt: new Date(Date.now() + tokenLifetimeMinutes * 60 * 1000)
    };
  }
}
