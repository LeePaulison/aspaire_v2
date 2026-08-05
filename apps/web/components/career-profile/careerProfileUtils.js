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

export const emptyContactInfo = {
  email: "",
  phone: "",
  location: "",
  links: [],
};

export function arrayToText(value) {
  if (Array.isArray(value)) {
    return value.join("\n");
  }

  return typeof value === "string" ? value : "";
}

export function getFormValue(formData, key) {
  return String(formData.get(key) ?? "");
}

export function normalizeContactInfo(value = {}) {
  const source =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const links = Array.isArray(source.links)
    ? source.links
        .map((link) => ({
          label: typeof link.label === "string" ? link.label.trim() : "",
          url: typeof link.url === "string" ? link.url.trim() : "",
        }))
        .filter((link) => link.label || link.url)
    : [];

  return {
    email: typeof source.email === "string" ? source.email.trim() : "",
    phone: typeof source.phone === "string" ? source.phone.trim() : "",
    location: typeof source.location === "string" ? source.location.trim() : "",
    links,
  };
}

export function contactLinksToText(links = []) {
  return Array.isArray(links)
    ? links
        .map((link) => {
          const label = typeof link.label === "string" ? link.label.trim() : "";
          const url = typeof link.url === "string" ? link.url.trim() : "";

          if (!label && !url) {
            return "";
          }

          return label ? `${label}: ${url}` : url;
        })
        .filter(Boolean)
        .join("\n")
    : "";
}

export function parseContactLinks(value) {
  if (Array.isArray(value)) {
    return normalizeContactInfo({ links: value }).links;
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...urlParts] = line.split(/:\s+/);

      if (urlParts.length === 0) {
        return { label: "", url: line };
      }

      return {
        label: label.trim(),
        url: urlParts.join(": ").trim(),
      };
    })
    .filter((link) => link.label || link.url);
}

export function getContactInfoFromForm(formData) {
  return normalizeContactInfo({
    email: getFormValue(formData, "contactEmail"),
    phone: getFormValue(formData, "contactPhone"),
    location: getFormValue(formData, "contactLocation"),
    links: parseContactLinks(getFormValue(formData, "contactLinks")),
  });
}

export function achievementMarkdown(achievements) {
  if (typeof achievements === "string") {
    return achievements;
  }

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
