import assert from "node:assert/strict";
import test from "node:test";

import {
  createResumeDraftFromCareerProfile,
  createResumeMarkdownFromCareerProfile,
} from "../lib/resumes/careerProfileResumeDraft.js";

const profile = {
  profileId: "profile-1",
  name: "Platform Profile",
  focus: "Platform Engineering",
  headline: "Senior Platform Engineer",
  summary: "Builds resilient developer platforms.",
  contactInfo: {
    email: "engineer@example.com",
    phone: "555-123-4567",
    location: "Remote",
    links: [
      { label: "LinkedIn", url: "https://linkedin.com/in/engineer" },
      { label: "Company", url: "https://example.com/company" },
    ],
  },
  additionalNotes: "Open to infrastructure-heavy teams.",
  experience: [
    {
      title: "Senior Developer",
      company: "Acme",
      location: "Remote",
      startDate: "2022-01-01",
      endDate: "",
      isCurrent: true,
      description: "Built deployment workflows.",
      achievements: ["Reduced deploy time", "Improved reliability"],
    },
  ],
  education: [
    {
      institution: "State University",
      degree: "BS",
      fieldOfStudy: "Computer Science",
      startDate: "2015-01-01",
      endDate: "2019-01-01",
      notes: "Graduated with honors.",
    },
  ],
  skills: [
    { name: "Node.js", category: "Languages" },
    { name: "PostgreSQL", category: "Data" },
  ],
  projects: [
    {
      name: "Migration Toolkit",
      role: "Lead",
      description: "Migrated legacy jobs.",
      outcomes: "Saved support time.",
      technologies: ["Node.js", "PostgreSQL"],
      link: "https://example.com",
      startDate: "2023-01-01",
      endDate: "2023-06-01",
    },
  ],
  certifications: [
    {
      name: "AWS Certified Developer",
      issuer: "Amazon",
      issueDate: "2024-02-01",
      expirationDate: "",
      credentialUrl: "https://credential.example",
    },
  ],
};

test("career profile resume formatter creates editable Markdown sections", () => {
  const markdown = createResumeMarkdownFromCareerProfile(profile);

  assert.match(markdown, /^# Senior Platform Engineer/);
  assert.match(
    markdown,
    /engineer@example.com \| 555-123-4567 \| Remote \| LinkedIn: https:\/\/linkedin.com\/in\/engineer \| Company: https:\/\/example.com\/company/,
  );
  assert.match(markdown, /## Experience/);
  assert.match(markdown, /Senior Developer, Acme \| Remote \| 2022-01 - Present/);
  assert.match(markdown, /- Reduced deploy time/);
  assert.match(markdown, /## Skills/);
  assert.match(markdown, /\*\*Languages:\*\* Node.js/);
  assert.match(markdown, /## Projects/);
  assert.match(markdown, /Technologies: Node.js, PostgreSQL/);
  assert.match(markdown, /## Education/);
  assert.match(markdown, /## Certifications/);
  assert.match(markdown, /## Additional Notes/);
});

test("career profile resume draft keeps source profile metadata", () => {
  const draft = createResumeDraftFromCareerProfile(profile, {
    targetRoles: "Staff Platform Engineer\nEngineering Manager",
  });

  assert.equal(draft.profileId, "profile-1");
  assert.equal(draft.title, "Platform Profile resume draft");
  assert.equal(draft.targetRole, "Staff Platform Engineer");
  assert.equal(draft.status, "draft");
  assert.equal(draft.isPrimary, false);
  assert.match(draft.notes, /Generated from Career Profile/);
});
