// graphql/resolvers/index.js

import { preferencesResolver } from "./preferences.js";
import { aiAgentsResolvers } from "./aiAgents.js";
import { aiModelResolvers } from "./aiModel.js";
import { reasoningLevelsResolver } from "./reasoningLevels.js";
import { verbosityLevelResolver } from "./verbosityLevel.js";
import { conversationResolvers } from "./conversations.js";

export const resolvers = {
  Query: {
    ...preferencesResolver.Query,
    ...aiAgentsResolvers.Query,
    ...aiModelResolvers.Query,
    ...reasoningLevelsResolver.Query,
    ...verbosityLevelResolver.Query,
    ...conversationResolvers.Query,
  },
  Mutation: {
    ...preferencesResolver.Mutation,
    ...conversationResolvers.Mutation,
  },
  ConversationSummary: conversationResolvers.ConversationSummary,
  Conversation: conversationResolvers.Conversation,
  Message: conversationResolvers.Message,
};
