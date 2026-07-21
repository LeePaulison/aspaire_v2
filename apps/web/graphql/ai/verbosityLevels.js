import { authRequest } from "@/graphql/authRequest";

const GET_VERBOSITY_LEVELS_QUERY = `
  query GetVerbosityLevels {
    verbosityLevels {
      levelId
      name
      description
    }
  }
`;

export async function getVerbosityLevels() {
  const result = await authRequest({
    query: GET_VERBOSITY_LEVELS_QUERY,
  });

  return result.verbosityLevels;
}
