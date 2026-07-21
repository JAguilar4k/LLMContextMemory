import { HttpError } from "./src/domain/errors/HttpError.js";
import { MockLlmGateway } from "./src/infrastructure/api/MockLlmGateway.js?v=20260721-contextual-v2";
import { getToken } from "./cookieManager.js";

const llmGateway = new MockLlmGateway({
  tokenRepository: { getToken }
});

export { HttpError };

export async function sendMessage(promptText, conversationHistory = []) {
  return llmGateway.sendMessage({
    prompt: promptText,
    conversation: conversationHistory
  });
}

export default {
  sendMessage,
  HttpError
};
