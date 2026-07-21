const DEFAULT_TOKEN_MINUTES = 2;

export class RenewTokenUseCase {
  constructor({ tokenRepository, tokenGenerator }) {
    this.tokenRepository = tokenRepository;
    this.tokenGenerator = tokenGenerator;
  }

  execute(minutes = DEFAULT_TOKEN_MINUTES) {
    const tokenLifetimeMinutes = Number.isFinite(minutes) && minutes > 0
      ? minutes
      : DEFAULT_TOKEN_MINUTES;

    this.tokenRepository.setToken(this.tokenGenerator.generate(), tokenLifetimeMinutes);

    return {
      expiresAt: new Date(Date.now() + tokenLifetimeMinutes * 60 * 1000)
    };
  }
}
