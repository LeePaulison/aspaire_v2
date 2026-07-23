function requireUser(user) {
  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

function serializeDate(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "number") {
    return new Date(value).toISOString();
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : value;
  }

  return null;
}

const defaultRepository = {
  async archiveResume(...args) {
    const repository = await import("../../repositories/resumeRepository.js");
    return repository.archiveResume(...args);
  },
  async createResume(...args) {
    const repository = await import("../../repositories/resumeRepository.js");
    return repository.createResume(...args);
  },
  async deleteResume(...args) {
    const repository = await import("../../repositories/resumeRepository.js");
    return repository.deleteResume(...args);
  },
  async deleteResumeFile(...args) {
    const repository = await import("../../repositories/resumeRepository.js");
    return repository.deleteResumeFile(...args);
  },
  async getPrimaryResume(...args) {
    const repository = await import("../../repositories/resumeRepository.js");
    return repository.getPrimaryResume(...args);
  },
  async getResumeById(...args) {
    const repository = await import("../../repositories/resumeRepository.js");
    return repository.getResumeById(...args);
  },
  async listResumes(...args) {
    const repository = await import("../../repositories/resumeRepository.js");
    return repository.listResumes(...args);
  },
  async restoreResume(...args) {
    const repository = await import("../../repositories/resumeRepository.js");
    return repository.restoreResume(...args);
  },
  async setPrimaryResume(...args) {
    const repository = await import("../../repositories/resumeRepository.js");
    return repository.setPrimaryResume(...args);
  },
  async updateResume(...args) {
    const repository = await import("../../repositories/resumeRepository.js");
    return repository.updateResume(...args);
  },
};

export function createResumeResolvers(repository = defaultRepository) {
  return {
    Query: {
      resumes: async (_, { includeArchived = true } = {}, { user }) => {
        const authenticatedUser = requireUser(user);

        return repository.listResumes(authenticatedUser.id, { includeArchived });
      },
      resume: async (_, { resumeId }, { user }) => {
        const authenticatedUser = requireUser(user);

        return repository.getResumeById(authenticatedUser.id, resumeId);
      },
      primaryResume: async (_, __, { user }) => {
        const authenticatedUser = requireUser(user);

        return repository.getPrimaryResume(authenticatedUser.id);
      },
    },

    Mutation: {
      createResume: async (_, { input }, { user }) => {
        const authenticatedUser = requireUser(user);

        return repository.createResume(authenticatedUser.id, input);
      },
      updateResume: async (_, { resumeId, input }, { user }) => {
        const authenticatedUser = requireUser(user);

        return repository.updateResume(authenticatedUser.id, resumeId, input);
      },
      setPrimaryResume: async (_, { resumeId }, { user }) => {
        const authenticatedUser = requireUser(user);

        return repository.setPrimaryResume(authenticatedUser.id, resumeId);
      },
      archiveResume: async (_, { resumeId }, { user }) => {
        const authenticatedUser = requireUser(user);

        return repository.archiveResume(authenticatedUser.id, resumeId);
      },
      restoreResume: async (_, { resumeId }, { user }) => {
        const authenticatedUser = requireUser(user);

        return repository.restoreResume(authenticatedUser.id, resumeId);
      },
      deleteResume: async (_, { resumeId }, { user }) => {
        const authenticatedUser = requireUser(user);

        return repository.deleteResume(authenticatedUser.id, resumeId);
      },
      deleteResumeFile: async (_, { resumeId, fileId }, { user }) => {
        const authenticatedUser = requireUser(user);

        return repository.deleteResumeFile(authenticatedUser.id, resumeId, fileId);
      },
    },

    Resume: {
      createdAt: (resume) => serializeDate(resume.createdAt),
      updatedAt: (resume) => serializeDate(resume.updatedAt),
    },

    ResumeFile: {
      uploadedAt: (file) => serializeDate(file.uploadedAt),
      createdAt: (file) => serializeDate(file.createdAt),
      updatedAt: (file) => serializeDate(file.updatedAt),
    },

    ResumeDeletionReceipt: {
      deletedAt: (receipt) => serializeDate(receipt.deletedAt),
    },
  };
}

export const resumeResolvers = createResumeResolvers();
