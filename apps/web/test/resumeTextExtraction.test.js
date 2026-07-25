import assert from "node:assert/strict";
import test from "node:test";

const { extractResumeText } = await import(
  "../lib/resumes/resumeTextExtraction.js"
);

test("plain text resume extraction normalizes line endings and excess blanks", async () => {
  const text = await extractResumeText({
    buffer: Buffer.from("Summary\r\n\r\n\r\nExperience  \r\n"),
    contentType: "text/plain",
  });

  assert.equal(text, "Summary\n\nExperience");
});

test("resume extraction rejects unsupported content types", async () => {
  await assert.rejects(
    () =>
      extractResumeText({
        buffer: Buffer.from("resume"),
        contentType: "image/png",
      }),
    /Unsupported resume file type/,
  );
});
