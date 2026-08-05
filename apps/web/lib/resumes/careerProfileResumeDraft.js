function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function list(value) {
  if (Array.isArray(value)) {
    return value.map(text).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map(text)
      .filter(Boolean);
  }

  return [];
}

function line(...parts) {
  return parts.map(text).filter(Boolean).join(" | ");
}

function dateRange(startDate, endDate, isCurrent = false) {
  const start = text(startDate).slice(0, 7);
  const end = isCurrent ? "Present" : text(endDate).slice(0, 7);

  return [start, end].filter(Boolean).join(" - ");
}

function section(title, body) {
  const content = text(body);

  return content ? `## ${title}\n${content}` : "";
}

function bullets(items) {
  return list(items).map((item) => `- ${item}`).join("\n");
}

function profileTitle(profile) {
  return text(profile.headline) || text(profile.name) || "Resume";
}

function normalizeContactInfo(value = {}) {
  const source =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const links = Array.isArray(source.links)
    ? source.links
        .map((link) => ({
          label: text(link?.label),
          url: text(link?.url),
        }))
        .filter((link) => link.label || link.url)
    : [];

  return {
    email: text(source.email),
    phone: text(source.phone),
    location: text(source.location),
    links,
  };
}

function formatContactInfo(contactInfo) {
  const contact = normalizeContactInfo(contactInfo);
  const links = contact.links.map((link) =>
    [link.label, link.url].filter(Boolean).join(": "),
  );

  return [contact.email, contact.phone, contact.location, ...links]
    .filter(Boolean)
    .join(" | ");
}

function formatExperience(items) {
  return Array.isArray(items)
    ? items
        .map((item) => {
          const heading = line(
            [text(item.title), text(item.company)].filter(Boolean).join(", "),
            text(item.location),
            dateRange(item.startDate, item.endDate, item.isCurrent),
          );
          const details = [
            heading ? `### ${heading}` : "",
            text(item.description),
            bullets(item.achievements),
          ].filter(Boolean);

          return details.join("\n");
        })
        .filter(Boolean)
        .join("\n\n")
    : "";
}

function formatEducation(items) {
  return Array.isArray(items)
    ? items
        .map((item) => {
          const heading = line(
            text(item.institution),
            [text(item.degree), text(item.fieldOfStudy)].filter(Boolean).join(", "),
            dateRange(item.startDate, item.endDate),
          );
          return [heading ? `### ${heading}` : "", text(item.notes)]
            .filter(Boolean)
            .join("\n");
        })
        .filter(Boolean)
        .join("\n\n")
    : "";
}

function formatSkills(items) {
  if (!Array.isArray(items)) {
    return "";
  }

  const byCategory = new Map();

  for (const skill of items) {
    const name = text(skill.name);
    if (!name) continue;

    const category = text(skill.category) || "General";
    byCategory.set(category, [...(byCategory.get(category) ?? []), name]);
  }

  return [...byCategory.entries()]
    .map(([category, names]) => `- **${category}:** ${names.join(", ")}`)
    .join("\n");
}

function formatProjects(items) {
  return Array.isArray(items)
    ? items
        .map((item) => {
          const heading = line(
            text(item.name),
            text(item.role),
            dateRange(item.startDate, item.endDate),
          );
          const details = [
            heading ? `### ${heading}` : "",
            text(item.description),
            text(item.outcomes),
            list(item.technologies).length > 0
              ? `Technologies: ${list(item.technologies).join(", ")}`
              : "",
            text(item.link),
          ].filter(Boolean);

          return details.join("\n");
        })
        .filter(Boolean)
        .join("\n\n")
    : "";
}

function formatCertifications(items) {
  return Array.isArray(items)
    ? items
        .map((item) =>
          line(
            text(item.name),
            text(item.issuer),
            dateRange(item.issueDate, item.expirationDate),
            text(item.credentialUrl),
          ),
        )
        .filter(Boolean)
        .map((item) => `- ${item}`)
        .join("\n")
    : "";
}

export function createResumeMarkdownFromCareerProfile(profile) {
  const sections = [
    `# ${profileTitle(profile)}`,
    formatContactInfo(profile.contactInfo),
    text(profile.summary),
    section("Experience", formatExperience(profile.experience)),
    section("Skills", formatSkills(profile.skills)),
    section("Projects", formatProjects(profile.projects)),
    section("Education", formatEducation(profile.education)),
    section("Certifications", formatCertifications(profile.certifications)),
    section("Additional Notes", text(profile.additionalNotes)),
  ];

  return sections.filter(Boolean).join("\n\n").trim();
}

export function createResumeDraftFromCareerProfile(profile, preferences = {}) {
  const targetRole =
    list(preferences.targetRoles)[0] || text(profile.focus) || text(profile.name);

  return {
    profileId: profile.profileId,
    title: `${text(profile.name) || "Career Profile"} resume draft`,
    targetRole,
    notes: [
      `Generated from Career Profile "${text(profile.name) || "Untitled profile"}".`,
      "Review this Markdown before saving it to the Resume Library.",
    ].join("\n"),
    resumeText: createResumeMarkdownFromCareerProfile(profile, preferences),
    status: "draft",
    isPrimary: false,
  };
}
