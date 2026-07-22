import { GetTokenStateUseCase } from "../application/use-cases/GetTokenStateUseCase.js";
import { GetWorkspaceStateUseCase } from "../application/use-cases/GetWorkspaceStateUseCase.js";
import { RenewTokenUseCase } from "../application/use-cases/RenewTokenUseCase.js";
import { SaveFavoritePromptUseCase } from "../application/use-cases/SaveFavoritePromptUseCase.js";
import { SendPromptUseCase } from "../application/use-cases/SendPromptUseCase.js";
import { MockLlmGateway } from "../infrastructure/api/MockLlmGateway.js?v=20260722-architecture-v1";
import { CookieTokenRepository } from "../infrastructure/browser/CookieTokenRepository.js";
import { LocalFavoritePromptRepository } from "../infrastructure/browser/LocalFavoritePromptRepository.js";
import { SessionConversationRepository } from "../infrastructure/browser/SessionConversationRepository.js";
import { SecureTokenGenerator } from "../infrastructure/security/SecureTokenGenerator.js";

export function createWorkspaceApp() {
  const tokenRepository = new CookieTokenRepository();
  const conversationRepository = new SessionConversationRepository();
  const favoritePromptRepository = new LocalFavoritePromptRepository();
  const tokenGenerator = new SecureTokenGenerator();
  const llmGateway = new MockLlmGateway({ tokenRepository });

  const getWorkspaceState = new GetWorkspaceStateUseCase({
    conversationRepository,
    favoritePromptRepository
  });
  const sendPrompt = new SendPromptUseCase({ conversationRepository, llmGateway });
  const saveFavoritePrompt = new SaveFavoritePromptUseCase({ favoritePromptRepository });
  const renewToken = new RenewTokenUseCase({ tokenRepository, tokenGenerator });
  const getTokenState = new GetTokenStateUseCase({ tokenRepository });

  return Object.freeze({
    getInitialState: () => getWorkspaceState.execute(),
    sendPrompt: promptText => sendPrompt.execute(promptText),
    saveFavoritePrompt: promptText => saveFavoritePrompt.execute(promptText),
    renewToken: minutes => renewToken.execute(minutes),
    getTokenState: () => getTokenState.execute()
  });
}
