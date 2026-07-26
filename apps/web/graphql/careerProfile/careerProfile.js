import { authRequest } from "@/graphql/authRequest";

export const CAREER_PROFILE_FIELDS = `
  profileId
  name
  focus
  isDefault
  headline
  summary
  careerGoals
  additionalNotes
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
  projects {
    projectId
    name
    role
    description
    outcomes
    technologies
    link
    startDate
    endDate
    sortOrder
  }
  certifications {
    certificationId
    name
    issuer
    issueDate
    expirationDate
    credentialId
    credentialUrl
    notes
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

export async function listCareerProfiles() {
  const result = await authRequest({
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

export async function createCareerProfile(input = null) {
  const result = await authRequest({
    query: `
      mutation CreateCareerProfile($input: CreateCareerProfileInput) {
        createCareerProfile(input: $input) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { input },
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

export async function upsertCareerProject(input) {
  const result = await authRequest({
    query: `
      mutation UpsertCareerProject($input: UpsertCareerProjectInput!) {
        upsertCareerProject(input: $input) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { input },
  });

  return result.upsertCareerProject;
}

export async function deleteCareerProject(projectId) {
  const result = await authRequest({
    query: `
      mutation DeleteCareerProject($projectId: String!) {
        deleteCareerProject(projectId: $projectId) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { projectId },
  });

  return result.deleteCareerProject;
}

export async function upsertCareerCertification(input) {
  const result = await authRequest({
    query: `
      mutation UpsertCareerCertification($input: UpsertCareerCertificationInput!) {
        upsertCareerCertification(input: $input) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { input },
  });

  return result.upsertCareerCertification;
}

export async function deleteCareerCertification(certificationId) {
  const result = await authRequest({
    query: `
      mutation DeleteCareerCertification($certificationId: String!) {
        deleteCareerCertification(certificationId: $certificationId) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { certificationId },
  });

  return result.deleteCareerCertification;
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
