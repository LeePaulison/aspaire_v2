import {
  getAiAgentById,
  getAiAgents,
} from "@/repositories/aiAgentsRepository.js";

export const aiAgentsResolvers = {
  Query: {
    aiAgents: (_) => getAiAgents(),
    aiAgentConfiguration: (_, { agentId }, context) => {
      if (!context.authenticated) {
        throw new Error("Unauthorized");
      }

      return getAiAgentById(agentId);
    },
  },
};
