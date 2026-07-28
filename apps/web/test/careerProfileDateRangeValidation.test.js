import assert from "node:assert/strict";
import test from "node:test";

import {
  careerCertificationSchema,
  careerExperienceSchema,
  careerProjectSchema,
} from "../lib/careerProfile/dateRangeValidation.js";

test("career date range validation allows blank optional dates", async () => {
  await assert.doesNotReject(() =>
    careerExperienceSchema.validate({
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: true,
      description: "",
      achievements: "",
    }),
  );
});

test("career date range validation rejects end dates before start dates", async () => {
  await assert.rejects(
    () =>
      careerProjectSchema.validate({
        name: "Migration",
        role: "",
        startDate: "2026-07-28",
        endDate: "2026-07-27",
        link: "",
        description: "",
        outcomes: "",
        technologies: "",
      }),
    /End date must be on or after start date/,
  );
});

test("career certification validation rejects expiration dates before issue dates", async () => {
  await assert.rejects(
    () =>
      careerCertificationSchema.validate({
        name: "Credential",
        issuer: "",
        issueDate: "2026-07-28",
        expirationDate: "2026-07-27",
        credentialId: "",
        credentialUrl: "",
        notes: "",
      }),
    /Expiration date must be on or after issue date/,
  );
});
