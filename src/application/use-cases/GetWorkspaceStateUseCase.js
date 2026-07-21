export class GetWorkspaceStateUseCase {
  constructor({ conversationRepository, favoritePromptRepository }) {
    this.conversationRepository = conversationRepository;
    this.favoritePromptRepository = favoritePromptRepository;
  }

  execute() {
    return {
      conversation: this.conversationRepository.findCurrent().toPrimitives(),
      favoritePrompts: this.favoritePromptRepository.findAll()
    };
  }
}
