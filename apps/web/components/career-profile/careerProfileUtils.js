export const emptyExperience = {
  company: "",
  title: "",
  location: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  description: "",
  achievements: "",
  sortOrder: 0,
};

export const emptyEducation = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  startDate: "",
  endDate: "",
  notes: "",
  sortOrder: 0,
};

export const emptySkill = {
  name: "",
  category: "General",
  proficiency: "",
  evidence: "",
  sortOrder: 0,
};

export const emptyProject = {
  name: "",
  role: "",
  description: "",
  outcomes: "",
  technologies: "",
  link: "",
  startDate: "",
  endDate: "",
  sortOrder: 0,
};

export const emptyCertification = {
  name: "",
  issuer: "",
  issueDate: "",
  expirationDate: "",
  credentialId: "",
  credentialUrl: "",
  notes: "",
  sortOrder: 0,
};

export const emptyPreferences = {
  targetRoles: "",
  targetIndustries: "",
  locations: "",
  workModes: "",
  compensationGoals: "",
  constraints: "",
};

export function arrayToText(value) {
  return Array.isArray(value) ? value.join("\n") : "";
}

export function getFormValue(formData, key) {
  return String(formData.get(key) ?? "");
}

export function achievementMarkdown(achievements) {
  if (!Array.isArray(achievements) || achievements.length === 0) {
    return "";
  }

  return achievements.map((item) => `- ${item}`).join("\n");
}

export function formatDisplayDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "";
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateRange(startDate, endDate, options = {}) {
  const start = formatDisplayDate(startDate);
  const end = options.isCurrent ? "Present" : formatDisplayDate(endDate);

  if (start && end) {
    return `${start} - ${end}`;
  }

  return start || end || "";
}

export function formatCertificationDateRange(issueDate, expirationDate) {
  const issued = formatDisplayDate(issueDate);
  const expires = formatDisplayDate(expirationDate);

  if (issued && expires) {
    return `${issued} - ${expires}`;
  }

  if (issued) {
    return `Issued ${issued}`;
  }

  if (expires) {
    return `Expires ${expires}`;
  }

  return "";
}

export function sortProfiles(profilesToSort) {
  return [...profilesToSort].sort((left, right) => {
    if (left.isDefault && !right.isDefault) {
      return -1;
    }

    if (!left.isDefault && right.isDefault) {
      return 1;
    }

    return left.name.localeCompare(right.name);
  });
}
