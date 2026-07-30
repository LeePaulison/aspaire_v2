import assert from "node:assert/strict";
import test from "node:test";

import { parseResumeToCareerProfileDraft } from "../lib/resumes/resumeCareerProfileParser.js";

test("resume parser maps common resume sections to a career profile draft", () => {
  const draft = parseResumeToCareerProfileDraft({
    resumeId: "resume-1",
    targetRole: "Platform Engineer",
    resumeText: `
Professional Summary
Platform engineer focused on resilient developer tooling.

Professional Experience
Senior Developer - Acme Corp - Remote - Jan 2022 - Present
- Built deployment automation
- Reduced incident response time
Developer | Beta LLC | New York | 2019 - 2021
Maintained internal applications.

Education
State University | BS Computer Science | Software Engineering | 2015 - 2019

Technical Skills
Node.js, PostgreSQL, AWS

Projects
Migration Toolkit | Lead Engineer | 2023-01-15 - 2023-09-30
- Migrated legacy jobs

Certifications
AWS Certified Developer | Amazon | Feb 2024
`,
  });

  assert.equal(draft.sourceResumeId, "resume-1");
  assert.equal(draft.focus, "Platform Engineer");
  assert.equal(draft.headline, "Platform engineer focused on resilient developer tooling.");
  assert.equal(draft.experience.length, 2);
  assert.deepEqual(draft.experience[0], {
    company: "Acme Corp",
    title: "Senior Developer",
    location: "Remote",
    startDate: "2022-01-01",
    endDate: "",
    isCurrent: true,
    description: "",
    achievements: "Built deployment automation\nReduced incident response time",
    sortOrder: 0,
  });
  assert.equal(draft.experience[1].startDate, "2019-01-01");
  assert.equal(draft.experience[1].endDate, "2021-01-01");
  assert.equal(draft.education[0].institution, "State University");
  assert.equal(draft.education[0].degree, "BS Computer Science");
  assert.equal(draft.skills.length, 3);
  assert.deepEqual(
    draft.skills.map((skill) => skill.name),
    ["Node.js", "PostgreSQL", "AWS"],
  );
  assert.equal(draft.projects[0].name, "Migration Toolkit");
  assert.equal(draft.projects[0].startDate, "2023-01-15");
  assert.equal(draft.certifications[0].name, "AWS Certified Developer");
  assert.equal(draft.certifications[0].issuer, "Amazon");
  assert.equal(draft.certifications[0].issueDate, "2024-02-01");
});

test("resume parser places unsectioned resume content into additional notes", () => {
  const draft = parseResumeToCareerProfileDraft("Jane Candidate\njane@example.com");

  assert.match(draft.additionalNotes, /Unsectioned resume content:/);
  assert.match(draft.additionalNotes, /Jane Candidate/);
  assert.equal(draft.experience.length, 0);
});

test("resume parser returns an empty draft for blank resume text", () => {
  const draft = parseResumeToCareerProfileDraft({
    resumeId: "resume-empty",
    resumeText: "",
  });

  assert.equal(draft.sourceResumeId, "resume-empty");
  assert.equal(draft.additionalNotes, "Resume text is empty.");
  assert.deepEqual(draft.experience, []);
});
