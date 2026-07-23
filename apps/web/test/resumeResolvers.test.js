import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ??= "postgresql://user:password@example.com/aspaire_test";

const { createResumeResolvers } = await import("../graphql/resolvers/resumes.js");

function createRepository(overrides = {}) {
  return {
    archiveResume: async () => assert.fail("unexpected archiveResume call"),
    createResume: async () => assert.fail("unexpected createResume call"),
    deleteResume: async () => assert.fail("unexpected deleteResume call"),
    deleteResumeFile: async () => assert.fail("unexpected deleteResumeFile call"),
    getPrimaryResume: async () => assert.fail("unexpected getPrimaryResume call"),
    getResumeById: async () => assert.fail("unexpected getResumeById call"),
    listResumes: async () => assert.fail("unexpected listResumes call"),
    restoreResume: async () => assert.fail("unexpected restoreResume call"),
    setPrimaryResume: async () => assert.fail("unexpected setPrimaryResume call"),
    updateResume: async () => assert.fail("unexpected updateResume call"),
    ...overrides,
  };
}

test("resume operations require authentication", async () => {
  const resolvers = createResumeResolvers(createRepository());
  const context = { user: null };

  await assert.rejects(resolvers.Query.resumes(null, {}, context), /Unauthorized/);
  await assert.rejects(
    resolvers.Mutation.createResume(null, { input: {} }, context),
    /Unauthorized/,
  );
  await assert.rejects(
    resolvers.Mutation.deleteResume(null, { resumeId: "resume-1" }, context),
    /Unauthorized/,
  );
});

test("resume list is scoped to the authenticated user", async () => {
  let received;
  const resolvers = createResumeResolvers(
    createRepository({
      listResumes: async (userId, filters) => {
        received = { userId, filters };
        return [];
      },
    }),
  );

  await resolvers.Query.resumes(
    null,
    { includeArchived: false },
    { user: { id: "user-1" } },
  );

  assert.deepEqual(received, {
    userId: "user-1",
    filters: { includeArchived: false },
  });
});

test("resume mutations derive ownership from context", async () => {
  let received;
  const resolvers = createResumeResolvers(
    createRepository({
      createResume: async (userId, input) => {
        received = { userId, input };
        return { resumeId: "resume-1" };
      },
    }),
  );

  await resolvers.Mutation.createResume(
    null,
    { input: { userId: "another-user", title: "Resume" } },
    { user: { id: "user-1" } },
  );

  assert.equal(received.userId, "user-1");
  assert.equal(received.input.userId, "another-user");
});

test("setting a primary resume is scoped to the authenticated user", async () => {
  let received;
  const resolvers = createResumeResolvers(
    createRepository({
      setPrimaryResume: async (userId, resumeId) => {
        received = { userId, resumeId };
        return { resumeId };
      },
    }),
  );

  await resolvers.Mutation.setPrimaryResume(
    null,
    { resumeId: "resume-1" },
    { user: { id: "user-1" } },
  );

  assert.deepEqual(received, {
    userId: "user-1",
    resumeId: "resume-1",
  });
});

test("deleting a resume file is scoped to the authenticated user", async () => {
  let received;
  const resolvers = createResumeResolvers(
    createRepository({
      deleteResumeFile: async (userId, resumeId, fileId) => {
        received = { userId, resumeId, fileId };
        return { resumeId };
      },
    }),
  );

  await resolvers.Mutation.deleteResumeFile(
    null,
    { resumeId: "resume-1", fileId: "file-1" },
    { user: { id: "user-1" } },
  );

  assert.deepEqual(received, {
    userId: "user-1",
    resumeId: "resume-1",
    fileId: "file-1",
  });
});

test("resume date fields serialize to ISO strings", () => {
  const resolvers = createResumeResolvers(createRepository());
  const createdAt = new Date("2026-07-23T18:00:00.000Z");
  const updatedAt = new Date("2026-07-23T19:00:00.000Z");

  assert.equal(
    resolvers.Resume.createdAt({ createdAt }),
    "2026-07-23T18:00:00.000Z",
  );
  assert.equal(
    resolvers.Resume.updatedAt({ updatedAt }),
    "2026-07-23T19:00:00.000Z",
  );
  assert.equal(
    resolvers.ResumeFile.uploadedAt({ uploadedAt: createdAt }),
    "2026-07-23T18:00:00.000Z",
  );
  assert.equal(
    resolvers.ResumeDeletionReceipt.deletedAt({ deletedAt: updatedAt }),
    "2026-07-23T19:00:00.000Z",
  );
});
