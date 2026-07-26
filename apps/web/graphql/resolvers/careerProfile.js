import {
  deleteCareerCertification,
  deleteCareerEducation,
  deleteCareerExperience,
  deleteCareerProject,
  deleteCareerSkill,
  createCareerProfile,
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
    updateCareerProfileSummary: async (_, { input }, { user }) => {
      const authenticatedUser = requireUser(user);

      return updateCareerProfileSummary(authenticatedUser.id, input);
    },
    upsertCareerExperience: async (_, { input }, { user }) => {
      const authenticatedUser = requireUser(user);

      return upsertCareerExperience(authenticatedUser.id, input);
    },
    deleteCareerExperience: async (_, { experienceId }, { user }) => {
      const authenticatedUser = requireUser(user);

      return deleteCareerExperience(authenticatedUser.id, experienceId);
    },
    upsertCareerEducation: async (_, { input }, { user }) => {
      const authenticatedUser = requireUser(user);

      return upsertCareerEducation(authenticatedUser.id, input);
    },
    deleteCareerEducation: async (_, { educationId }, { user }) => {
      const authenticatedUser = requireUser(user);

      return deleteCareerEducation(authenticatedUser.id, educationId);
    },
    upsertCareerSkill: async (_, { input }, { user }) => {
      const authenticatedUser = requireUser(user);

      return upsertCareerSkill(authenticatedUser.id, input);
    },
    deleteCareerSkill: async (_, { skillId }, { user }) => {
      const authenticatedUser = requireUser(user);

      return deleteCareerSkill(authenticatedUser.id, skillId);
    },
    upsertCareerProject: async (_, { input }, { user }) => {
      const authenticatedUser = requireUser(user);

      return upsertCareerProject(authenticatedUser.id, input);
    },
    deleteCareerProject: async (_, { projectId }, { user }) => {
      const authenticatedUser = requireUser(user);

      return deleteCareerProject(authenticatedUser.id, projectId);
    },
    upsertCareerCertification: async (_, { input }, { user }) => {
      const authenticatedUser = requireUser(user);

      return upsertCareerCertification(authenticatedUser.id, input);
    },
    deleteCareerCertification: async (_, { certificationId }, { user }) => {
      const authenticatedUser = requireUser(user);

      return deleteCareerCertification(authenticatedUser.id, certificationId);
    },
    updateCareerPreferences: async (_, { input }, { user }) => {
      const authenticatedUser = requireUser(user);

      return updateCareerPreferences(authenticatedUser.id, input);
    },
  },
};
