import {
  appendMessages,
  createConversation,
  getUserConversations,
  getConversationById,
  deleteConversation,
} from "../../repositories/conversationRepository.js";

export function createConversationResolvers(repository = {
  appendMessages,
  createConversation,
  getUserConversations,
  getConversationById,
  deleteConversation,
}) {
  const {
    appendMessages: appendConversationMessages,
    createConversation: createNewConversation,
    getUserConversations: findUserConversations,
    getConversationById: findConversationById,
    deleteConversation: deleteOwnedConversation,
  } = repository;

  return {
  Query: {
    conversations: async (_, args, context) => {
      if (!context.authenticated) {
        return [];
      }

      return findUserConversations(context.user.id, {
        domain: args?.domain,
        domainId: args?.domainId,
      });
    },

    conversation: async (_, { id }, context) => {
      if (!context.authenticated) {
        return null;
      }

      const conversation = await findConversationById(id);

      if (!conversation) {
        return null;
      }

      if (conversation.userId !== context.user.id) {
        return null;
      }

      return conversation;
    },
  },

  Mutation: {
    saveConversationTurn: async (_, { input }, context) => {
      if (!context.authenticated) {
        throw new Error("Unauthorized");
      }

      const now = new Date();
      const messages = [
        { role: "user", content: input.userMessage, createdAt: now },
        { role: "assistant", content: input.assistantMessage, createdAt: now },
      ];

      if (!input.conversationId) {
        return createNewConversation({
          userId: context.user.id,
          domain: input.domain || "general",
          domainId: input.domainId || null,
          messages,
        });
      }

      const conversation = await findConversationById(input.conversationId);

      if (!conversation || conversation.userId !== context.user.id) {
        throw new Error("Conversation not found");
      }

      return appendConversationMessages({
        conversationId: input.conversationId,
        messages,
      });
    },

    deleteConversation: async (_, { id }, context) => {
      if (!context.authenticated) {
        throw new Error("Unauthorized");
      }

      return deleteOwnedConversation({
        conversationId: id,
        userId: context.user.id,
      });
    },
  },

  ConversationSummary: {
    id: (conversation) => conversation._id.toString(),

    domain: (conversation) => conversation.domain || "general",

    domainId: (conversation) => conversation.domainId || null,

    updatedAt: (conversation) => conversation.updatedAt.toISOString(),

    preview: (conversation) => conversation.messages?.[0]?.content ?? null,
  },

  Conversation: {
    id: (conversation) => conversation._id.toString(),

    domain: (conversation) => conversation.domain || "general",

    domainId: (conversation) => conversation.domainId || null,

    createdAt: (conversation) => conversation.createdAt.toISOString(),

    updatedAt: (conversation) => conversation.updatedAt.toISOString(),
  },

  Message: {
    createdAt: (message) =>
      message.createdAt instanceof Date
        ? message.createdAt.toISOString()
        : message.createdAt,
  },
  };
}

export const conversationResolvers = createConversationResolvers();
