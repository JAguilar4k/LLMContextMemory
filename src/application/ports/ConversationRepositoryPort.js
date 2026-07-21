/**
 * @typedef {import("../../domain/conversation/Conversation.js").Conversation} Conversation
 *
 * @typedef {object} ConversationRepositoryPort
 * @property {() => Conversation} findCurrent
 * @property {(conversation: Conversation) => void} save
 * @property {() => void} clear
 */

export {};
