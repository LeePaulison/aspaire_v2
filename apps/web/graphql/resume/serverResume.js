import { serverAuthRequest } from "@/graphql/serverAuthRequest";

import { RESUME_FIELDS } from "./resume";

export async function getResumes() {
  const result = await serverAuthRequest({
    query: `
      query Resumes {
        resumes {
          ${RESUME_FIELDS}
        }
      }
    `,
  });

  return result.resumes;
}
