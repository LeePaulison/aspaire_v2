function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function id(prefix, index) {
  return `draft-${prefix}-${index}`;
}

function withDraftIds(items, idKey, prefix) {
  return Array.isArray(items)
    ? items.map((item, index) => ({
        ...item,
        [idKey]: item[idKey] ?? id(prefix, index),
        sortOrder: Number.isInteger(item.sortOrder) ? item.sortOrder : index,
      }))
    : [];
}

export function createReviewableCareerProfileDraft(draft, resume = {}) {
  if (draft === null || typeof draft !== "object" || Array.isArray(draft)) {
    throw new Error("Resume parser returned an invalid draft.");
  }

  return {
    ...draft,
    profileId: "draft",
    sourceResumeId: resume.resumeId ?? draft.sourceResumeId ?? null,
    name: text(draft.name) || `${text(resume.title) || "Resume"} profile draft`,
    focus: text(draft.focus) || text(resume.targetRole),
    isDefault: Boolean(draft.isDefault),
    experience: withDraftIds(draft.experience, "experienceId", "experience"),
    education: withDraftIds(draft.education, "educationId", "education"),
    skills: withDraftIds(draft.skills, "skillId", "skill"),
    projects: withDraftIds(draft.projects, "projectId", "project"),
    certifications: withDraftIds(
      draft.certifications,
      "certificationId",
      "certification",
    ),
    preferences: {
      preferenceId: "draft-preferences",
      ...(draft.preferences ?? {}),
    },
  };
}

export function parseCareerProfileDraftResponse(value, resume = {}) {
  const rawText = text(value);

  if (!rawText) {
    throw new Error("Resume parser returned an empty draft.");
  }

  return createReviewableCareerProfileDraft(JSON.parse(rawText), resume);
}
