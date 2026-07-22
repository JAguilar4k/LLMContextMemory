import { PromptText } from "../../domain/prompt/PromptText.js";
import { assertPort } from "../ports/assertPort.js";

export class SendPromptUseCase {
  #conversationRepository;
  #llmGateway;

  constructor({ conversationRepository, llmGateway }) {
    assertPort("ConversationRepositoryPort", conversationRepository, ["findCurrent", "save", "clear"]);
    assertPort("LlmGatewayPort", llmGateway, ["sendMessage"]);

    this.#conversationRepository = conversationRepository;
    this.#llmGateway = llmGateway;
    Object.freeze(this);
  }

  async execute(promptText) {
    try {
      const prompt = new PromptText(promptText);
      const currentConversation = this.#conversationRepository.findCurrent();
      const conversationWithPrompt = currentConversation.addUserPrompt(prompt);

      this.#conversationRepository.save(conversationWithPrompt);

      const responseText = await this.#llmGateway.sendMessage({
        prompt: prompt.toString(),
        conversation: conversationWithPrompt.toPrimitives()
      });

      const completedConversation = conversationWithPrompt.addAssistantResponse(responseText);
      this.#conversationRepository.save(completedConversation);

      return completedConversation.toPrimitives();
    } catch (error) {
      if (error?.status === 401) {
        this.#conversationRepository.clear();
      }

      throw error;
    }
  }
}
