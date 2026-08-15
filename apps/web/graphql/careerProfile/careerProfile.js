import { authRequest } from "@/graphql/authRequest";

export const CAREER_PROFILE_FIELDS = `
  profileId
  name
  focus
  isDefault
  headline
  summary
  careerGoals
  contactInfo {
    email
    phone
    location
    links {
      label
      url
    }
  }
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

export async function createCareerProfileFromDraft(input) {
  const result = await authRequest({
    query: `
      mutation CreateCareerProfileFromDraft($input: CreateCareerProfileFromDraftInput!) {
        createCareerProfileFromDraft(input: $input) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { input },
  });

  return result.createCareerProfileFromDraft;
}

export async function deleteCareerProfile(profileId) {
  const result = await authRequest({
    query: `
      mutation DeleteCareerProfile($profileId: String!) {
        deleteCareerProfile(profileId: $profileId) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { profileId },
  });

  return result.deleteCareerProfile;
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

export async function deleteCareerExperience(experienceId, profileId = null) {
  const result = await authRequest({
    query: `
      mutation DeleteCareerExperience($experienceId: String!, $profileId: String) {
        deleteCareerExperience(experienceId: $experienceId, profileId: $profileId) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { experienceId, profileId },
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

export async function deleteCareerEducation(educationId, profileId = null) {
  const result = await authRequest({
    query: `
      mutation DeleteCareerEducation($educationId: String!, $profileId: String) {
        deleteCareerEducation(educationId: $educationId, profileId: $profileId) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { educationId, profileId },
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

export async function deleteCareerSkill(skillId, profileId = null) {
  const result = await authRequest({
    query: `
      mutation DeleteCareerSkill($skillId: String!, $profileId: String) {
        deleteCareerSkill(skillId: $skillId, profileId: $profileId) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { skillId, profileId },
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

export async function deleteCareerProject(projectId, profileId = null) {
  const result = await authRequest({
    query: `
      mutation DeleteCareerProject($projectId: String!, $profileId: String) {
        deleteCareerProject(projectId: $projectId, profileId: $profileId) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { projectId, profileId },
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

export async function deleteCareerCertification(certificationId, profileId = null) {
  const result = await authRequest({
    query: `
      mutation DeleteCareerCertification($certificationId: String!, $profileId: String) {
        deleteCareerCertification(certificationId: $certificationId, profileId: $profileId) {
          ${CAREER_PROFILE_FIELDS}
        }
      }
    `,
    variables: { certificationId, profileId },
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
