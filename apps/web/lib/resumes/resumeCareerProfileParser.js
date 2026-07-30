const SECTION_ALIASES = new Map([
  ["summary", "summary"],
  ["professional summary", "summary"],
  ["profile", "summary"],
  ["experience", "experience"],
  ["professional experience", "experience"],
  ["work experience", "experience"],
  ["work history", "experience"],
  ["employment history", "experience"],
  ["education", "education"],
  ["skills", "skills"],
  ["technical skills", "skills"],
  ["core skills", "skills"],
  ["projects", "projects"],
  ["selected projects", "projects"],
  ["certifications", "certifications"],
  ["certifications and awards", "certifications"],
  ["licenses", "certifications"],
]);

const SECTION_ORDER = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
];

const INLINE_SECTION_HEADINGS = [
  "WEBSITES, PORTFOLIOS, PROFILES",
  "PROFESSIONAL SUMMARY",
  "TECHNICAL SKILLS",
  "CORE SKILLS",
  "SKILLS",
  "WORK HISTORY",
  "WORK EXPERIENCE",
  "PROFESSIONAL EXPERIENCE",
  "EMPLOYMENT HISTORY",
  "EDUCATION",
  "PROJECTS",
  "CERTIFICATIONS AND AWARDS",
  "CERTIFICATIONS",
  "LICENSES",
];

const MONTHS = new Map([
  ["jan", "01"],
  ["january", "01"],
  ["feb", "02"],
  ["february", "02"],
  ["mar", "03"],
  ["march", "03"],
  ["apr", "04"],
  ["april", "04"],
  ["may", "05"],
  ["jun", "06"],
  ["june", "06"],
  ["jul", "07"],
  ["july", "07"],
  ["aug", "08"],
  ["august", "08"],
  ["sep", "09"],
  ["sept", "09"],
  ["september", "09"],
  ["oct", "10"],
  ["october", "10"],
  ["nov", "11"],
  ["november", "11"],
  ["dec", "12"],
  ["december", "12"],
]);

export function parseResumeToCareerProfileDraft(resume) {
  const resumeText = typeof resume === "string" ? resume : resume?.resumeText;
  const normalizedText = normalizeResumeText(resumeText);
  const sections = splitResumeSections(normalizedText);
  const additionalNotes = [];

  if (!normalizedText) {
    return emptyDraft({
      sourceResumeId: typeof resume === "object" ? resume?.resumeId : null,
      additionalNotes: "Resume text is empty.",
    });
  }

  const unsectionedContent = sections.get("unsectioned") ?? [];

  if (unsectionedContent.length > 0) {
    additionalNotes.push(
      ["Unsectioned resume content:", ...unsectionedContent].join("\n"),
    );
  }

  return {
    sourceResumeId: typeof resume === "object" ? resume?.resumeId ?? null : null,
    name: "",
    focus: normalizeText(resume?.targetRole),
    headline: firstContentLine(sections.get("summary")) || "",
    summary: (sections.get("summary") ?? []).join("\n"),
    careerGoals: "",
    additionalNotes: additionalNotes.join("\n\n"),
    experience: parseExperience(sections.get("experience") ?? []),
    education: parseEducation(sections.get("education") ?? []),
    skills: parseSkills(sections.get("skills") ?? []),
    projects: parseProjects(sections.get("projects") ?? []),
    certifications: parseCertifications(sections.get("certifications") ?? []),
    preferences: {
      targetRoles: normalizeText(resume?.targetRole),
      targetIndustries: "",
      locations: "",
      workModes: "",
      compensationGoals: "",
      constraints: "",
    },
  };
}

function emptyDraft({ sourceResumeId = null, additionalNotes = "" } = {}) {
  return {
    sourceResumeId,
    name: "",
    focus: "",
    headline: "",
    summary: "",
    careerGoals: "",
    additionalNotes,
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    preferences: {
      targetRoles: "",
      targetIndustries: "",
      locations: "",
      workModes: "",
      compensationGoals: "",
      constraints: "",
    },
  };
}

function normalizeResumeText(value) {
  let normalizedText = normalizeText(value)
    .replace(/\r\n/g, "\n")
    .replace(/[–—]/g, "-")
    .replace(/[]/g, "")
    .replace(/[^\S\n]+/g, " ")
    .replace(/Written in LATEX by .*? Page \d+/gi, " ")
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, " ")
    .replace(/\b([A-Za-z]{3,})-\s+([a-z]{2,})\b/g, "$1$2");

  for (const heading of INLINE_SECTION_HEADINGS) {
    normalizedText = normalizedText.replace(
      new RegExp(`(^|\\s+)(${escapeRegExp(heading)})(\\s+|$)`, "gi"),
      "$1\n$2\n$3",
    );
  }

  return normalizedText
    .replace(/\s+•\s+/g, "\n• ")
    .replace(
      /([.!?])\s+([A-Z][A-Z\s-]{4,}?)\s+(\d{1,2}\/\d{4})/g,
      "$1\n$2 $3",
    )
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitResumeSections(resumeText) {
  const sections = new Map([["unsectioned", []]]);
  let currentSection = "unsectioned";

  for (const rawLine of resumeText.split("\n")) {
    const line = normalizeText(rawLine);

    if (!line) {
      continue;
    }

    const sectionName = getSectionName(line);

    if (sectionName) {
      currentSection = sectionName;

      if (!sections.has(currentSection)) {
        sections.set(currentSection, []);
      }

      continue;
    }

    sections.get(currentSection).push(line);
  }

  return sections;
}

function getSectionName(line) {
  const normalizedHeading = line
    .replace(/[:\-]+$/, "")
    .trim()
    .toLowerCase();

  if (SECTION_ALIASES.has(normalizedHeading)) {
    return SECTION_ALIASES.get(normalizedHeading);
  }

  if (line === line.toUpperCase()) {
    return SECTION_ALIASES.get(normalizedHeading) ?? null;
  }

  return null;
}

function parseExperience(lines) {
  const entries = groupSectionItems(lines);

  return entries.map((entry, index) => {
    const header = entry.header;
    const dateRange = extractDateRange(header);
    const headerWithoutDates = removeDateRange(header, dateRange);
    const parts = splitHeaderParts(headerWithoutDates);
    const inferredCompany = parts[1] || inferCompanyAfterDateRange(header, dateRange);

    return {
      company: inferredCompany,
      title: parts[0] ?? "",
      location: parts[2] ?? "",
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      isCurrent: dateRange.isCurrent,
      description: nonBulletLines(entry.details).join("\n"),
      achievements: bulletLines(entry.details).join("\n"),
      sortOrder: index,
    };
  });
}

function parseEducation(lines) {
  return groupSectionItems(lines).map((entry, index) => {
    const dateRange = extractDateRange(entry.header);
    const headerWithoutDates = dateRange.raw
      ? normalizeText(entry.header.replace(dateRange.raw, ""))
      : entry.header;
    const parts = splitHeaderParts(headerWithoutDates);

    return {
      institution: parts[0] ?? "",
      degree: parts[1] ?? "",
      fieldOfStudy: parts[2] ?? "",
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      notes: entry.details.join("\n"),
      sortOrder: index,
    };
  });
}

function parseSkills(lines) {
  return lines
    .flatMap((line) => line.split(/[,;|]/))
    .map((skill) => normalizeText(stripBullet(skill)))
    .filter(Boolean)
    .map((name, index) => ({
      name,
      category: "General",
      proficiency: "",
      evidence: "",
      sortOrder: index,
    }));
}

function parseProjects(lines) {
  return groupSectionItems(lines, { bulletStartsEntry: true }).map((entry, index) => {
    const dateRange = extractDateRange(entry.header);
    const headerWithoutDates = removeDateRange(entry.header, dateRange);
    const parts = splitHeaderParts(headerWithoutDates);

    return {
      name: parts[0] ?? "",
      role: parts[1] ?? "",
      description: nonBulletLines(entry.details).join("\n"),
      outcomes: bulletLines(entry.details).join("\n"),
      technologies: "",
      link: findUrl(entry.header) || findUrl(entry.details.join(" ")) || "",
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      sortOrder: index,
    };
  });
}

function parseCertifications(lines) {
  return groupSectionItems(lines, { bulletStartsEntry: true }).map((entry, index) => {
    const dateRange = extractDateRange(entry.header);
    const headerWithoutDates = removeDateRange(entry.header, dateRange);
    const parts = splitHeaderParts(headerWithoutDates);

    return {
      name: parts[0] ?? "",
      issuer: parts[1] ?? "",
      issueDate: dateRange.startDate,
      expirationDate: dateRange.endDate,
      credentialId: "",
      credentialUrl: findUrl(entry.header) || findUrl(entry.details.join(" ")) || "",
      notes: entry.details.join("\n"),
      sortOrder: index,
    };
  });
}

function groupSectionItems(lines, { bulletStartsEntry = false } = {}) {
  const entries = [];
  let currentEntry = null;

  for (const line of lines) {
    if (!currentEntry || looksLikeHeaderLine(line, { bulletStartsEntry })) {
      currentEntry = {
        header: stripBullet(line),
        details: [],
      };
      entries.push(currentEntry);
    } else {
      currentEntry.details.push(line);
    }
  }

  return entries;
}

function looksLikeHeaderLine(line, { bulletStartsEntry = false } = {}) {
  if (isBulletLine(line)) {
    if (bulletStartsEntry) {
      return true;
    }

    return false;
  }

  return (
    splitHeaderParts(line).length > 1 ||
    Boolean(extractDateRange(line).raw) ||
    !/[.!?]$/.test(line)
  );
}

function splitHeaderParts(line) {
  return trimHeaderPunctuation(line)
    .split(/\s+\|\s+|\s+–\s+|\s+—\s+|\s+-\s+|\s+@\s+/)
    .map((part) => trimHeaderPunctuation(part))
    .filter(Boolean);
}

function trimHeaderPunctuation(value) {
  return normalizeText(value.replace(/[\s,|–—-]+$/g, ""));
}

function extractDateRange(line) {
  const datePattern =
    "(?:\\d{4}-\\d{2}-\\d{2}|\\d{1,2}/\\d{4}|(?:Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December)\\.?\\s+\\d{4}|\\d{4})";
  const rangePattern = new RegExp(
    `(${datePattern})\\s*(?:-|–|—|to)\\s*(${datePattern}|Present|Current)(?:,\\s*${datePattern}\\s*(?:-|–|—|to)\\s*(?:${datePattern}|Present|Current))*`,
    "i",
  );
  const singlePattern = new RegExp(`(${datePattern})`, "i");
  const rangeMatch = line.match(rangePattern);

  if (rangeMatch) {
    const raw = rangeMatch[0];
    const dateMatches = [
      ...raw.matchAll(new RegExp(`${datePattern}|Present|Current`, "gi")),
    ].map((match) => match[0]);
    const endText = dateMatches[dateMatches.length - 1];

    return {
      raw,
      startDate: parseDateText(dateMatches[0]),
      endDate: /present|current/i.test(endText) ? "" : parseDateText(endText),
      isCurrent: /present|current/i.test(endText),
    };
  }

  const singleMatch = line.match(singlePattern);

  if (singleMatch) {
    return {
      raw: singleMatch[0],
      startDate: parseDateText(singleMatch[1]),
      endDate: "",
      isCurrent: false,
    };
  }

  return {
    raw: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
  };
}

function parseDateText(value) {
  const normalizedValue = normalizeText(value).replace(".", "");

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    return normalizedValue;
  }

  if (/^\d{4}$/.test(normalizedValue)) {
    return `${normalizedValue}-01-01`;
  }

  const numericMonthYearMatch = normalizedValue.match(/^(\d{1,2})\/(\d{4})$/);

  if (numericMonthYearMatch) {
    return `${numericMonthYearMatch[2]}-${numericMonthYearMatch[1].padStart(2, "0")}-01`;
  }

  const monthYearMatch = normalizedValue.match(/^([A-Za-z]+)\s+(\d{4})$/);

  if (monthYearMatch) {
    const month = MONTHS.get(monthYearMatch[1].toLowerCase());

    if (month) {
      return `${monthYearMatch[2]}-${month}-01`;
    }
  }

  return "";
}

function firstContentLine(lines = []) {
  return lines.find(Boolean) ?? "";
}

function bulletLines(lines) {
  return lines.filter(isBulletLine).map(stripBullet);
}

function nonBulletLines(lines) {
  return lines.filter((line) => !isBulletLine(line)).map(stripBullet);
}

function isBulletLine(line) {
  return /^[-*•]\s+/.test(line);
}

function stripBullet(line) {
  return normalizeText(line.replace(/^[-*•]\s+/, ""));
}

function findUrl(value) {
  return normalizeText(value).match(/https?:\/\/\S+/)?.[0] ?? "";
}

function removeDateRange(header, dateRange) {
  return dateRange.raw ? normalizeText(header.replace(dateRange.raw, "")) : header;
}

function inferCompanyAfterDateRange(header, dateRange) {
  if (!dateRange.raw) {
    return "";
  }

  const afterDateRange = normalizeText(header.split(dateRange.raw).at(-1));

  return trimHeaderPunctuation(afterDateRange.split("|")[0] ?? "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}
