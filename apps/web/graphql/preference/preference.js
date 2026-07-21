import { authRequest } from "@/graphql/authRequest"

const GET_PREFERENCES_QUERY = `
  query GetPreferences {
    preferences {
      userId
      theme
      defaultModelId
      defaultReasoningId
      defaultVerbosityId
      temperature
      defaultAgentId
    }
  }
`;

export const getPreferences = async () => {
  const result = await authRequest({
    query: GET_PREFERENCES_QUERY,
  });

  return result.preferences;
};

export const updatePreferences = async (input) => {
  const result = await authRequest({
    query: `
      mutation UpdatePreferences($input: UpdatePreferencesInput!) {
        updatePreferences(input: $input) {
          userId
          theme
          defaultModelId
          defaultReasoningId
          defaultVerbosityId
          temperature
          defaultAgentId
        }
      }
    `,
    variables: { input },
  });

  return result.updatePreferences;
};
