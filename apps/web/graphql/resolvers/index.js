// graphql/resolvers/index.js

import { preferencesResolver } from "./preferences.js";
import { aiAgentsResolvers } from "./aiAgents.js";
import { aiModelResolvers } from "./aiModel.js";
import { reasoningLevelsResolver } from "./reasoningLevels.js";
import { verbosityLevelResolver } from "./verbosityLevel.js";
import { conversationResolvers } from "./conversations.js";
import { careerProfileResolvers } from "./careerProfile.js";
import { resumeResolvers } from "./resumes.js";

export const resolvers = {
  Query: {
    ...preferencesResolver.Query,
    ...aiAgentsResolvers.Query,
    ...aiModelResolvers.Query,
    ...reasoningLevelsResolver.Query,
    ...verbosityLevelResolver.Query,
    ...conversationResolvers.Query,
    ...careerProfileResolvers.Query,
    ...resumeResolvers.Query,
  },
  Mutation: {
    ...preferencesResolver.Mutation,
    ...conversationResolvers.Mutation,
    ...careerProfileResolvers.Mutation,
    ...resumeResolvers.Mutation,
  },
  ConversationSummary: conversationResolvers.ConversationSummary,
  Conversation: conversationResolvers.Conversation,
  Message: conversationResolvers.Message,
  Resume: resumeResolvers.Resume,
  ResumeFile: resumeResolvers.ResumeFile,
  ResumeDeletionReceipt: resumeResolvers.ResumeDeletionReceipt,
  DomainPreference: aiAgentsResolvers.DomainPreference,
};
