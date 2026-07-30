import {
  getAiAgentById,
  getAiAgents,
} from "@/repositories/aiAgentsRepository.js";
import { getDomainPreference } from "@/repositories/domainPreferencesRepository.js";

export const aiAgentsResolvers = {
  Query: {
    aiAgents: (_) => getAiAgents(),
    aiAgentConfiguration: (_, { agentId }, context) => {
      if (!context.authenticated) {
        throw new Error("Unauthorized");
      }

      return getAiAgentById(agentId);
    },
    domainPreference: (_, { domain, workflowType }, context) => {
      if (!context.authenticated) {
        throw new Error("Unauthorized");
      }

      return getDomainPreference(domain, workflowType);
    },
  },
  DomainPreference: {
    responseSchema: (preference) => {
      if (preference.responseSchema == null) {
        return null;
      }

      return typeof preference.responseSchema === "string"
        ? preference.responseSchema
        : JSON.stringify(preference.responseSchema);
    },
  },
};
