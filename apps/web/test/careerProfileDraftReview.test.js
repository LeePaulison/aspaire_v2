import assert from "node:assert/strict";
import test from "node:test";

import { careerProfileDraftResponseSchema } from "../lib/ai/careerProfileDraftResponseSchema.js";
import {
  createReviewableCareerProfileDraft,
  parseCareerProfileDraftResponse,
} from "../lib/resumes/careerProfileDraftReview.js";

test("career profile draft schema uses editable Career Profile field names", () => {
  const schema = careerProfileDraftResponseSchema.schema;

  assert.ok(careerProfileDraftResponseSchema.name);
  assert.ok(schema.properties.name);
  assert.ok(schema.properties.focus);
  assert.ok(schema.properties.headline);
  assert.ok(schema.properties.experience.items.properties.achievements);
  assert.ok(schema.properties.education.items.properties.fieldOfStudy);
  assert.ok(schema.properties.projects.items.properties.link);
  assert.ok(schema.properties.certifications.items.properties.credentialUrl);
  assert.ok(schema.properties.preferences.properties.targetIndustries);
});

test("career profile draft review helper only adds review metadata", () => {
  const draft = createReviewableCareerProfileDraft(
    {
      name: "",
      focus: "",
      headline: "Platform engineer",
      summary: "Platform engineer focused on reliability.",
      careerGoals: "",
      additionalNotes: "Needs review.",
      experience: [
        {
          company: "Acme",
          title: "Senior Developer",
          location: "Remote",
          startDate: "2022-01-01",
          endDate: "",
          isCurrent: true,
          description: "Built internal tooling.",
          achievements: "Reduced deployment time",
        },
      ],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      preferences: {
        targetRoles: "Platform Engineer",
        targetIndustries: "Developer Tools",
        locations: "Remote",
        workModes: "Remote",
        compensationGoals: "",
        constraints: "",
      },
    },
    { resumeId: "resume-1", title: "Platform resume", targetRole: "Platform" },
  );

  assert.equal(draft.name, "Platform resume profile draft");
  assert.equal(draft.focus, "Platform");
  assert.equal(draft.sourceResumeId, "resume-1");
  assert.equal(draft.experience[0].experienceId, "draft-experience-0");
  assert.equal(draft.experience[0].achievements, "Reduced deployment time");
  assert.equal(draft.preferences.targetIndustries, "Developer Tools");
});

test("career profile draft response parser rejects empty responses", () => {
  assert.throws(
    () => parseCareerProfileDraftResponse(""),
    /empty draft/,
  );
});
