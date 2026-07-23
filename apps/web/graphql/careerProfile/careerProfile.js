import { authRequest } from "@/graphql/authRequest";

export const CAREER_PROFILE_FIELDS = `
  profileId
  headline
  summary
  careerGoals
  experience {
    experienceId
    company
    title
    location
    startDate
    endDate
    isCurrent
    description
    achievements
    sortOrder
  }
  education {
    educationId
    institution
    degree
    fieldOfStudy
    startDate
    endDate
    notes
    sortOrder
  }
  skills {
    skillId
    name
    category
    proficiency
    evidence
    sortOrder
  }
  preferences {
    preferenceId
    targetRoles
    targetIndustries
    locations
    workModes
    compensationGoals
    constraints
  }
`;

export async function createCareerProfile() {
  const result = await authRequest({
    query: `
      mutation CreateCareerProfile {
        createCareerProfile {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
  });

  return result.createCareerProfile;
}

export async function updateCareerProfileSummary(input) {
  const result = await authRequest({
    query: `
      mutation UpdateCareerProfileSummary($input: UpdateCareerProfileSummaryInput!) {
        updateCareerProfileSummary(input: $input) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { input },
  });

  return result.updateCareerProfileSummary;
}

export async function upsertCareerExperience(input) {
  const result = await authRequest({
    query: `
      mutation UpsertCareerExperience($input: UpsertCareerExperienceInput!) {
        upsertCareerExperience(input: $input) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { input },
  });

  return result.upsertCareerExperience;
}

export async function deleteCareerExperience(experienceId) {
  const result = await authRequest({
    query: `
      mutation DeleteCareerExperience($experienceId: String!) {
        deleteCareerExperience(experienceId: $experienceId) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { experienceId },
  });

  return result.deleteCareerExperience;
}

export async function upsertCareerEducation(input) {
  const result = await authRequest({
    query: `
      mutation UpsertCareerEducation($input: UpsertCareerEducationInput!) {
        upsertCareerEducation(input: $input) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { input },
  });

  return result.upsertCareerEducation;
}

export async function deleteCareerEducation(educationId) {
  const result = await authRequest({
    query: `
      mutation DeleteCareerEducation($educationId: String!) {
        deleteCareerEducation(educationId: $educationId) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { educationId },
  });

  return result.deleteCareerEducation;
}

export async function upsertCareerSkill(input) {
  const result = await authRequest({
    query: `
      mutation UpsertCareerSkill($input: UpsertCareerSkillInput!) {
        upsertCareerSkill(input: $input) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { input },
  });

  return result.upsertCareerSkill;
}

export async function deleteCareerSkill(skillId) {
  const result = await authRequest({
    query: `
      mutation DeleteCareerSkill($skillId: String!) {
        deleteCareerSkill(skillId: $skillId) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { skillId },
  });

  return result.deleteCareerSkill;
}

export async function updateCareerPreferences(input) {
  const result = await authRequest({
    query: `
      mutation UpdateCareerPreferences($input: UpdateCareerPreferencesInput!) {
        updateCareerPreferences(input: $input) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { input },
  });

  return result.updateCareerPreferences;
}
