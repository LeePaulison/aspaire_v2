import {
  getPreferencesByUserId,
  upsertPreferences,
} from "@/repositories/preferencesRepository";

export const preferencesResolver = {
  Query: {
    preferences: async (_, __, { user }) => {
      if (!user) {
        throw new Error("Unauthorized");
      }

      return getPreferencesByUserId(user.id);
    },
  },

  Mutation: {
    updatePreferences: async (_, { input }, { user }) => {
      if (!user) {
        throw new Error("Unauthorized");
      }

      return upsertPreferences({
        userId: user.id,
        ...input,
      });
    },
  },
};
