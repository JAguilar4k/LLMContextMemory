export class GetTokenStateUseCase {
  constructor({ tokenRepository }) {
    this.tokenRepository = tokenRepository;
  }

  execute() {
    return {
      hasToken: Boolean(this.tokenRepository.getToken()),
      expiresAt: this.tokenRepository.getExpiration()
    };
  }
}
