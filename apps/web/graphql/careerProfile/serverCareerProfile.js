import { serverAuthRequest } from "@/graphql/serverAuthRequest";

import { CAREER_PROFILE_FIELDS } from "./careerProfile";

export async function getCareerProfile() {
  const result = await serverAuthRequest({
    query: `
      query CareerProfile {
        careerProfile {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
  });

  return result.careerProfile;
}
