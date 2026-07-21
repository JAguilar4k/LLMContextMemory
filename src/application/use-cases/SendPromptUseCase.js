import { PromptText } from "../../domain/prompt/PromptText.js";

export class SendPromptUseCase {
  constructor({ conversationRepository, llmGateway }) {
    this.conversationRepository = conversationRepository;
    this.llmGateway = llmGateway;
  }

  async execute(promptText) {
    try {
      const prompt = new PromptText(promptText);
      const currentConversation = this.conversationRepository.findCurrent();
      const conversationWithPrompt = currentConversation.addUserPrompt(prompt);

      this.conversationRepository.save(conversationWithPrompt);

      const responseText = await this.llmGateway.sendMessage({
        prompt: prompt.toString(),
        conversation: conversationWithPrompt.toPrimitives()
      });

      const completedConversation = conversationWithPrompt.addAssistantResponse(responseText);
      this.conversationRepository.save(completedConversation);

      return completedConversation.toPrimitives();
    } catch (error) {
      if (error?.status === 401) {
        this.conversationRepository.clear();
      }

      throw error;
    }
  }
}
