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

export async function listCareerProfiles() {
  const result = await serverAuthRequest({
    query: `
      query CareerProfiles {
        careerProfiles {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
  });

  return result.careerProfiles;
}
