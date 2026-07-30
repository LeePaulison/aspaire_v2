import { graphqlRequest } from "../lib/graphql/request.js";

const DOMAIN_PREFERENCE_FIELDS = `
  domainPreferenceId
  domain
  workflowType
  agentId
  defaultModelId
  temperature
  defaultReasoningId
  defaultVerbosityId
  responseFormat
  responseSchema
  enabled
`;

export async function getDomainPreference({ token, domain, workflowType }) {
  const data = await graphqlRequest({
    token,
    query: `
      query DomainPreference($domain: String!, $workflowType: String!) {
        domainPreference(domain: $domain, workflowType: $workflowType) {
          ${DOMAIN_PREFERENCE_FIELDS}
        }
      }
    `,
    variables: { domain, workflowType },
  });

  return data.domainPreference;
}
