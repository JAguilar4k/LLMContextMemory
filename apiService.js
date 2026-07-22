import { HttpError } from "./src/application/errors/HttpError.js";
import { MockLlmGateway } from "./src/infrastructure/api/MockLlmGateway.js?v=20260722-architecture-v1";
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
