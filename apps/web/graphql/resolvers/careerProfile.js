import {
  deleteCareerEducation,
  deleteCareerExperience,
  deleteCareerSkill,
  ensureCareerProfile,
  getCareerProfile,
  updateCareerPreferences,
  updateCareerProfileSummary,
  upsertCareerEducation,
  upsertCareerExperience,
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
    careerProfile: async (_, __, { user }) => {
      const authenticatedUser = requireUser(user);

      return getCareerProfile(authenticatedUser.id);
    },
  },

  Mutation: {
    createCareerProfile: async (_, __, { user }) => {
      const authenticatedUser = requireUser(user);

      await ensureCareerProfile(authenticatedUser.id);

      return getCareerProfile(authenticatedUser.id);
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
    updateCareerPreferences: async (_, { input }, { user }) => {
      const authenticatedUser = requireUser(user);

      return updateCareerPreferences(authenticatedUser.id, input);
    },
  },
};
