import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ??= "postgresql://user:password@example.com/aspaire_test";

const { createResumeRepository } = await import("../repositories/resumeRepository.js");

class SelectQuery {
  constructor(rows) {
    this.rows = rows;
  }

  from() {
    return this;
  }

  where() {
    return this;
  }

  limit() {
    return this.rows;
  }

  orderBy() {
    return this.rows;
  }

  then(resolve, reject) {
    return Promise.resolve(this.rows).then(resolve, reject);
  }
}

function createDeleteQuery(onDelete) {
  return {
    where() {
      onDelete();
      return Promise.resolve();
    },
  };
}

function createInsertQuery(onInsert) {
  return {
    values(value) {
      onInsert(value);
      return {
        returning() {
          return Promise.resolve([
            {
              ...value,
              uploadedAt: new Date("2026-07-23T19:00:00.000Z"),
              createdAt: new Date("2026-07-23T19:00:00.000Z"),
              updatedAt: new Date("2026-07-23T19:00:00.000Z"),
            },
          ]);
        },
      };
    },
  };
}

function createUpdateQuery(onUpdate) {
  return {
    set(value) {
      onUpdate(value);
      return {
        where() {
          return Promise.resolve();
        },
      };
    },
  };
}

test("resume deletion removes uploaded originals from storage before deleting metadata", async () => {
  const deletedStorageKeys = [];
  let deletedRecord = false;
  const uploadedAt = new Date("2026-07-23T19:00:00.000Z");
  const fileRows = [
    {
      fileId: "file-1",
      resumeId: "resume-1",
      userId: "user-1",
      originalFilename: "resume.pdf",
      contentType: "application/pdf",
      fileSize: 100,
      storageKey: "users/user-1/resumes/resume-1/file-1-resume.pdf",
      textExtractionStatus: "pending",
      uploadedAt,
      createdAt: uploadedAt,
      updatedAt: uploadedAt,
    },
    {
      fileId: "file-2",
      resumeId: "resume-1",
      userId: "user-1",
      originalFilename: "resume.txt",
      contentType: "text/plain",
      fileSize: 50,
      storageKey: "users/user-1/resumes/resume-1/file-2-resume.txt",
      textExtractionStatus: "pending",
      uploadedAt,
      createdAt: uploadedAt,
      updatedAt: uploadedAt,
    },
  ];
  const selectResults = [
    [
      {
        resumeId: "resume-1",
        userId: "user-1",
        title: "Resume",
        files: [],
      },
    ],
    fileRows,
    fileRows,
  ];
  const repository = createResumeRepository({
    database: {
      select() {
        return new SelectQuery(selectResults.shift() ?? []);
      },
      delete() {
        return createDeleteQuery(() => {
          deletedRecord = true;
        });
      },
    },
    deleteStoredOriginal: async (storageKey) => {
      assert.equal(deletedRecord, false);
      deletedStorageKeys.push(storageKey);
    },
  });

  const receipt = await repository.deleteResume("user-1", "resume-1");

  assert.deepEqual(deletedStorageKeys, [
    "users/user-1/resumes/resume-1/file-1-resume.pdf",
    "users/user-1/resumes/resume-1/file-2-resume.txt",
  ]);
  assert.equal(deletedRecord, true);
  assert.equal(receipt.uploadedOriginalDeleted, true);
  assert.equal(receipt.uploadedOriginalCount, 2);
});

test("resume file deletion removes one uploaded original and metadata row", async () => {
  const deletedStorageKeys = [];
  let deletedFileMetadata = false;
  const uploadedAt = new Date("2026-07-23T19:00:00.000Z");
  const resumeRow = {
    resumeId: "resume-1",
    userId: "user-1",
    title: "Resume",
    files: [],
  };
  const fileRow = {
    fileId: "file-1",
    resumeId: "resume-1",
    userId: "user-1",
    originalFilename: "resume.pdf",
    contentType: "application/pdf",
    fileSize: 100,
    storageKey: "users/user-1/resumes/resume-1/file-1-resume.pdf",
    textExtractionStatus: "pending",
    uploadedAt,
    createdAt: uploadedAt,
    updatedAt: uploadedAt,
  };
  const selectResults = [[resumeRow], [fileRow], [fileRow], [resumeRow], []];
  const repository = createResumeRepository({
    database: {
      select() {
        return new SelectQuery(selectResults.shift() ?? []);
      },
      delete() {
        return createDeleteQuery(() => {
          deletedFileMetadata = true;
        });
      },
    },
    deleteStoredOriginal: async (storageKey) => {
      assert.equal(deletedFileMetadata, false);
      deletedStorageKeys.push(storageKey);
    },
  });

  const updatedResume = await repository.deleteResumeFile(
    "user-1",
    "resume-1",
    "file-1",
  );

  assert.deepEqual(deletedStorageKeys, [
    "users/user-1/resumes/resume-1/file-1-resume.pdf",
  ]);
  assert.equal(deletedFileMetadata, true);
  assert.equal(updatedResume.resumeId, "resume-1");
  assert.deepEqual(updatedResume.files, []);
});

test("resume file creation does not apply extracted text without review", async () => {
  let insertedFile = null;
  let resumeUpdate = null;
  const resumeRow = {
    resumeId: "resume-1",
    userId: "user-1",
    title: "Resume",
    resumeText: "",
    sourceType: "manual",
    status: "draft",
    files: [],
  };
  const selectResults = [[resumeRow], []];
  const repository = createResumeRepository({
    database: {
      select() {
        return new SelectQuery(selectResults.shift() ?? []);
      },
      insert() {
        return createInsertQuery((value) => {
          insertedFile = value;
        });
      },
      update() {
        return createUpdateQuery((value) => {
          resumeUpdate = value;
        });
      },
    },
  });

  const file = await repository.createResumeFile("user-1", "resume-1", {
    fileId: "file-1",
    originalFilename: "resume.txt",
    contentType: "text/plain",
    fileSize: 100,
    storageKey: "users/user-1/resumes/resume-1/file-1-resume.txt",
    textExtractionStatus: "completed",
    extractedText: "Parsed resume text",
  });

  assert.equal(file.fileId, "file-1");
  assert.equal(insertedFile.textExtractionStatus, "completed");
  assert.equal("resumeText" in resumeUpdate, false);
  assert.equal("sourceType" in resumeUpdate, false);
  assert.equal("status" in resumeUpdate, false);
});

test("resume file creation preserves existing resume text before review", async () => {
  let resumeUpdate = null;
  const resumeRow = {
    resumeId: "resume-1",
    userId: "user-1",
    title: "Resume",
    resumeText: "Manual resume text",
    sourceType: "manual",
    status: "active",
    files: [],
  };
  const selectResults = [[resumeRow], []];
  const repository = createResumeRepository({
    database: {
      select() {
        return new SelectQuery(selectResults.shift() ?? []);
      },
      insert() {
        return createInsertQuery(() => {});
      },
      update() {
        return createUpdateQuery((value) => {
          resumeUpdate = value;
        });
      },
    },
  });

  await repository.createResumeFile("user-1", "resume-1", {
    fileId: "file-1",
    originalFilename: "resume.txt",
    contentType: "text/plain",
    fileSize: 100,
    storageKey: "users/user-1/resumes/resume-1/file-1-resume.txt",
    textExtractionStatus: "completed",
    extractedText: "Parsed resume text",
  });

  assert.equal("resumeText" in resumeUpdate, false);
  assert.equal("sourceType" in resumeUpdate, false);
  assert.equal("status" in resumeUpdate, false);
});
