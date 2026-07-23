import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ??= "postgresql://user:password@example.com/aspaire_test";

const {
  createResumeStorageKey,
  sanitizeFilename,
  validateResumeUploadFile,
} = await import("../lib/resumes/resumeFileStorage.js");

test("resume upload validation allows supported resume file types", () => {
  const file = new File(["resume"], "Resume Draft.pdf", {
    type: "application/pdf",
  });

  assert.deepEqual(validateResumeUploadFile(file), {
    contentType: "application/pdf",
    filename: "Resume-Draft.pdf",
    fileSize: 6,
  });
});

test("resume upload validation rejects unsupported file types", () => {
  const file = new File(["resume"], "resume.png", { type: "image/png" });

  assert.throws(
    () => validateResumeUploadFile(file),
    /Upload a PDF, DOCX, or plain text resume/,
  );
});

test("resume storage keys are scoped by user and resume", () => {
  assert.equal(
    createResumeStorageKey({
      userId: "user 1",
      resumeId: "resume/1",
      fileId: "file-1",
      filename: sanitizeFilename("../Lee Resume.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
    }),
    "users/user%201/resumes/resume%2F1/file-1-Lee-Resume.docx",
  );
});
