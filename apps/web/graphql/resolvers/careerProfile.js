import {
  deleteCareerCertification,
  deleteCareerProfile,
  deleteCareerEducation,
  deleteCareerExperience,
  deleteCareerProject,
  deleteCareerSkill,
  createCareerProfile,
  createCareerProfileFromDraft,
  getCareerProfile,
  listCareerProfiles,
  updateCareerPreferences,
  updateCareerProfileSummary,
  upsertCareerCertification,
  upsertCareerEducation,
  upsertCareerExperience,
  upsertCareerProject,
  upsertCareerSkill,
} from "@/repositories/careerProfileRepository";

function requireUser(user) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export const careerProfileResolvers = {
  Query: {
    careerProfiles: async (_, __, { user }) => {
      const authenticatedUser = requireUser(user);

      return listCareerProfiles(authenticatedUser.id);
    },
    careerProfile: async (_, { profileId } = {}, { user }) => {
      const authenticatedUser = requireUser(user);

      return getCareerProfile(authenticatedUser.id, profileId);
    },
  },

  Mutation: {
    createCareerProfile: async (_, { input } = {}, { user }) => {
      const authenticatedUser = requireUser(user);

      return createCareerProfile(authenticatedUser.id, input ?? {});
    },
    createCareerProfileFromDraft: async (_, { input }, { user }) => {
      const authenticatedUser = requireUser(user);

      return createCareerProfileFromDraft(authenticatedUser.id, input);
    },
    deleteCareerProfile: async (_, { profileId }, { user }) => {
      const authenticatedUser = requireUser(user);

      return deleteCareerProfile(authenticatedUser.id, profileId);
    },
    updateCareerProfileSummary: async (_, { input }, { user }) => {
      const authenticatedUser = requireUser(user);

      return updateCareerProfileSummary(authenticatedUser.id, input);
    },
    upsertCareerExperience: async (_, { input }, { user }) => {
      const authenticatedUser = requireUser(user);

      return upsertCareerExperience(authenticatedUser.id, input);
    },
    deleteCareerExperience: async (_, { experienceId, profileId }, { user }) => {
      const authenticatedUser = requireUser(user);

      return deleteCareerExperience(authenticatedUser.id, experienceId, profileId);
    },
    upsertCareerEducation: async (_, { input }, { user }) => {
      const authenticatedUser = requireUser(user);

      return upsertCareerEducation(authenticatedUser.id, input);
    },
    deleteCareerEducation: async (_, { educationId, profileId }, { user }) => {
      const authenticatedUser = requireUser(user);

      return deleteCareerEducation(authenticatedUser.id, educationId, profileId);
    },
    upsertCareerSkill: async (_, { input }, { user }) => {
      const authenticatedUser = requireUser(user);

      return upsertCareerSkill(authenticatedUser.id, input);
    },
    deleteCareerSkill: async (_, { skillId, profileId }, { user }) => {
      const authenticatedUser = requireUser(user);

      return deleteCareerSkill(authenticatedUser.id, skillId, profileId);
    },
    upsertCareerProject: async (_, { input }, { user }) => {
      const authenticatedUser = requireUser(user);

      return upsertCareerProject(authenticatedUser.id, input);
    },
    deleteCareerProject: async (_, { projectId, profileId }, { user }) => {
      const authenticatedUser = requireUser(user);

      return deleteCareerProject(authenticatedUser.id, projectId, profileId);
    },
    upsertCareerCertification: async (_, { input }, { user }) => {
      const authenticatedUser = requireUser(user);

      return upsertCareerCertification(authenticatedUser.id, input);
    },
    deleteCareerCertification: async (_, { certificationId, profileId }, { user }) => {
      const authenticatedUser = requireUser(user);

      return deleteCareerCertification(
        authenticatedUser.id,
        certificationId,
        profileId,
      );
    },
    updateCareerPreferences: async (_, { input }, { user }) => {
      const authenticatedUser = requireUser(user);

      return updateCareerPreferences(authenticatedUser.id, input);
    },
  },
};
