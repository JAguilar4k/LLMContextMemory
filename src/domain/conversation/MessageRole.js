export const MessageRole = Object.freeze({
  USER: "user",
  ASSISTANT: "assistant"
});

export function isValidMessageRole(role) {
  return role === MessageRole.USER || role === MessageRole.ASSISTANT;
}
