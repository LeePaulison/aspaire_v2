import { authRequest } from "@/graphql/authRequest";

const GET_AIMODELS_QUERY = `
  query GetAiModels {
    aiModels {
      modelId
      name
      provider
      description
      supportsTemperature
      supportsReasoning
      supportsVerbosity
    }
  }
  `;

export const getAiModels = async () => {
  const result = await authRequest({
    query: GET_AIMODELS_QUERY,
  });

  return result.aiModels;
};
