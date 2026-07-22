import { assertPort } from "../ports/assertPort.js";

export class GetTokenStateUseCase {
  #tokenRepository;

  constructor({ tokenRepository }) {
    assertPort("TokenRepositoryPort", tokenRepository, ["getToken", "getExpiration"]);

    this.#tokenRepository = tokenRepository;
    Object.freeze(this);
  }

  execute() {
    return {
      hasToken: Boolean(this.#tokenRepository.getToken()),
      expiresAt: this.#tokenRepository.getExpiration()
    };
  }
}
