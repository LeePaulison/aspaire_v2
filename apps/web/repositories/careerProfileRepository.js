import { randomUUID } from "node:crypto";

import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db/neon";
import {
  careerProfileCertifications,
  careerProfileEducation,
  careerProfileExperience,
  careerProfilePreferences,
  careerProfileProjects,
  careerProfileSkills,
  careerProfiles,
} from "@/drizzle/careerProfiles";

function parseList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalText(value) {
  return typeof value === "string" ? value.trim() : undefined;
}

function normalizeDate(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return /^\d{4}-\d{2}-\d{2}$/.test(trimmedValue) ? trimmedValue : null;
}

function normalizeProfileName(value) {
  return normalizeText(value) || "Default Profile";
}

function normalizeContactInfo(value = {}) {
  const source =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const links = Array.isArray(source.links)
    ? source.links
        .map((link) => ({
          label: normalizeText(link?.label),
          url: normalizeText(link?.url),
        }))
        .filter((link) => link.label || link.url)
    : [];

  return {
    email: normalizeText(source.email),
    phone: normalizeText(source.phone),
    location: normalizeText(source.location),
    links,
  };
}

async function getProfileRecord(userId, profileId) {
  if (profileId) {
    const [profile] = await db
      .select()
      .from(careerProfiles)
      .where(
        and(
          eq(careerProfiles.userId, userId),
          eq(careerProfiles.profileId, profileId),
        ),
      )
      .limit(1);

    return profile ?? null;
  }

  const [defaultProfile] = await db
    .select()
    .from(careerProfiles)
    .where(and(eq(careerProfiles.userId, userId), eq(careerProfiles.isDefault, true)))
    .limit(1);

  if (defaultProfile) {
    return defaultProfile;
  }

  const [profile] = await db
    .select()
    .from(careerProfiles)
    .where(eq(careerProfiles.userId, userId))
    .orderBy(asc(careerProfiles.createdAt))
    .limit(1);

  return profile ?? null;
}

async function clearDefaultProfile(userId) {
  await db
    .update(careerProfiles)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(and(eq(careerProfiles.userId, userId), eq(careerProfiles.isDefault, true)));
}

async function createProfileRecord(userId, input = {}) {
  const shouldBeDefault = Boolean(input.isDefault) || !(await getProfileRecord(userId));

  if (shouldBeDefault) {
    await clearDefaultProfile(userId);
  }

  const [profile] = await db
    .insert(careerProfiles)
    .values({
      profileId: randomUUID(),
      userId,
      name: normalizeProfileName(input.name),
      focus: normalizeText(input.focus),
      isDefault: shouldBeDefault,
      headline: normalizeText(input.headline),
      summary: normalizeText(input.summary),
      careerGoals: normalizeText(input.careerGoals),
      contactInfo: normalizeContactInfo(input.contactInfo),
      additionalNotes: normalizeText(input.additionalNotes),
    })
    .returning();

  await db.insert(careerProfilePreferences).values({
    preferenceId: randomUUID(),
    profileId: profile.profileId,
  });

  return profile;
}

export async function ensureCareerProfile(userId, profileId) {
  const existingProfile = await getProfileRecord(userId, profileId);

  if (existingProfile) {
    return existingProfile;
  }

  if (profileId) {
    return null;
  }

  return createProfileRecord(userId, { isDefault: true });
}

export async function listCareerProfiles(userId) {
  const profileRows = await db
    .select()
    .from(careerProfiles)
    .where(eq(careerProfiles.userId, userId))
    .orderBy(desc(careerProfiles.isDefault), asc(careerProfiles.name));

  return Promise.all(
    profileRows.map((profile) => getCareerProfile(userId, profile.profileId)),
  );
}

export async function createCareerProfile(userId, input = {}) {
  const profile = await createProfileRecord(userId, input);

  return getCareerProfile(userId, profile.profileId);
}

export async function createCareerProfileFromDraft(userId, input = {}) {
  const profile = await createProfileRecord(userId, input);
  const now = new Date();

  const experienceRows = Array.isArray(input.experience)
    ? input.experience.map((item, index) => ({
        experienceId: randomUUID(),
        profileId: profile.profileId,
        company: normalizeText(item.company),
        title: normalizeText(item.title),
        location: normalizeText(item.location),
        startDate: normalizeDate(item.startDate),
        endDate: normalizeDate(item.endDate),
        isCurrent: Boolean(item.isCurrent),
        description: normalizeText(item.description),
        achievements: parseList(item.achievements),
        sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : index,
        updatedAt: now,
      }))
    : [];
  const educationRows = Array.isArray(input.education)
    ? input.education.map((item, index) => ({
        educationId: randomUUID(),
        profileId: profile.profileId,
        institution: normalizeText(item.institution),
        degree: normalizeText(item.degree),
        fieldOfStudy: normalizeText(item.fieldOfStudy),
        startDate: normalizeDate(item.startDate),
        endDate: normalizeDate(item.endDate),
        notes: normalizeText(item.notes),
        sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : index,
        updatedAt: now,
      }))
    : [];
  const skillRows = Array.isArray(input.skills)
    ? input.skills
        .map((item, index) => ({
          skillId: randomUUID(),
          profileId: profile.profileId,
          name: normalizeText(item.name),
          category: normalizeText(item.category) || "General",
          proficiency: normalizeText(item.proficiency),
          evidence: normalizeText(item.evidence),
          sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : index,
          updatedAt: now,
        }))
        .filter((item) => item.name)
    : [];
  const projectRows = Array.isArray(input.projects)
    ? input.projects
        .map((item, index) => ({
          projectId: randomUUID(),
          profileId: profile.profileId,
          name: normalizeText(item.name),
          role: normalizeText(item.role),
          description: normalizeText(item.description),
          outcomes: normalizeText(item.outcomes),
          technologies: parseList(item.technologies),
          link: normalizeText(item.link),
          startDate: normalizeDate(item.startDate),
          endDate: normalizeDate(item.endDate),
          sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : index,
          updatedAt: now,
        }))
        .filter((item) => item.name)
    : [];
  const certificationRows = Array.isArray(input.certifications)
    ? input.certifications
        .map((item, index) => ({
          certificationId: randomUUID(),
          profileId: profile.profileId,
          name: normalizeText(item.name),
          issuer: normalizeText(item.issuer),
          issueDate: normalizeDate(item.issueDate),
          expirationDate: normalizeDate(item.expirationDate),
          credentialId: normalizeText(item.credentialId),
          credentialUrl: normalizeText(item.credentialUrl),
          notes: normalizeText(item.notes),
          sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : index,
          updatedAt: now,
        }))
        .filter((item) => item.name)
    : [];
  const preferences = input.preferences ?? {};

  await Promise.all([
    experienceRows.length > 0
      ? db.insert(careerProfileExperience).values(experienceRows)
      : Promise.resolve(),
    educationRows.length > 0
      ? db.insert(careerProfileEducation).values(educationRows)
      : Promise.resolve(),
    skillRows.length > 0
      ? db.insert(careerProfileSkills).values(skillRows)
      : Promise.resolve(),
    projectRows.length > 0
      ? db.insert(careerProfileProjects).values(projectRows)
      : Promise.resolve(),
    certificationRows.length > 0
      ? db.insert(careerProfileCertifications).values(certificationRows)
      : Promise.resolve(),
    db
      .insert(careerProfilePreferences)
      .values({
        preferenceId: randomUUID(),
        profileId: profile.profileId,
        targetRoles: parseList(preferences.targetRoles),
        targetIndustries: parseList(preferences.targetIndustries),
        locations: parseList(preferences.locations),
        workModes: parseList(preferences.workModes),
        compensationGoals: normalizeText(preferences.compensationGoals),
        constraints: normalizeText(preferences.constraints),
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: careerProfilePreferences.profileId,
        set: {
          targetRoles: parseList(preferences.targetRoles),
          targetIndustries: parseList(preferences.targetIndustries),
          locations: parseList(preferences.locations),
          workModes: parseList(preferences.workModes),
          compensationGoals: normalizeText(preferences.compensationGoals),
          constraints: normalizeText(preferences.constraints),
          updatedAt: now,
        },
      }),
  ]);

  return getCareerProfile(userId, profile.profileId);
}

export async function deleteCareerProfile(userId, profileId) {
  const profile = await getProfileRecord(userId, profileId);

  if (!profile) {
    return listCareerProfiles(userId);
  }

  const profiles = await listCareerProfiles(userId);

  if (profiles.length <= 1) {
    throw new Error("At least one career profile is required");
  }

  await db
    .delete(careerProfiles)
    .where(
      and(
        eq(careerProfiles.userId, userId),
        eq(careerProfiles.profileId, profileId),
      ),
    );

  if (profile.isDefault) {
    const [nextProfile] = await db
      .select()
      .from(careerProfiles)
      .where(eq(careerProfiles.userId, userId))
      .orderBy(asc(careerProfiles.createdAt))
      .limit(1);

    if (nextProfile) {
      await clearDefaultProfile(userId);
      await db
        .update(careerProfiles)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(
          and(
            eq(careerProfiles.userId, userId),
            eq(careerProfiles.profileId, nextProfile.profileId),
          ),
        );
    }
  }

  return listCareerProfiles(userId);
}

export async function getCareerProfile(userId, profileId) {
  const profile = await getProfileRecord(userId, profileId);

  if (!profile) {
    return null;
  }

  const [
    experience,
    education,
    skills,
    projects,
    certifications,
    preferencesRows,
  ] = await Promise.all([
    db
      .select()
      .from(careerProfileExperience)
      .where(eq(careerProfileExperience.profileId, profile.profileId))
      .orderBy(asc(careerProfileExperience.sortOrder), asc(careerProfileExperience.createdAt)),
    db
      .select()
      .from(careerProfileEducation)
      .where(eq(careerProfileEducation.profileId, profile.profileId))
      .orderBy(asc(careerProfileEducation.sortOrder), asc(careerProfileEducation.createdAt)),
    db
      .select()
      .from(careerProfileSkills)
      .where(eq(careerProfileSkills.profileId, profile.profileId))
      .orderBy(asc(careerProfileSkills.sortOrder), asc(careerProfileSkills.name)),
    db
      .select()
      .from(careerProfileProjects)
      .where(eq(careerProfileProjects.profileId, profile.profileId))
      .orderBy(asc(careerProfileProjects.sortOrder), asc(careerProfileProjects.name)),
    db
      .select()
      .from(careerProfileCertifications)
      .where(eq(careerProfileCertifications.profileId, profile.profileId))
      .orderBy(
        asc(careerProfileCertifications.sortOrder),
        asc(careerProfileCertifications.name),
      ),
    db
      .select()
      .from(careerProfilePreferences)
      .where(eq(careerProfilePreferences.profileId, profile.profileId))
      .limit(1),
  ]);

  return {
    ...profile,
    contactInfo: normalizeContactInfo(profile.contactInfo),
    experience,
    education,
    skills,
    projects,
    certifications,
    preferences: preferencesRows[0] ?? null,
  };
}

export async function updateCareerProfileSummary(userId, input) {
  const profile = await ensureCareerProfile(userId, input.profileId);

  if (!profile) {
    return null;
  }

  if (input.isDefault === true && !profile.isDefault) {
    await clearDefaultProfile(userId);
  }

  const [updatedProfile] = await db
    .update(careerProfiles)
    .set({
      name: normalizeOptionalText(input.name) ?? profile.name,
      focus: normalizeOptionalText(input.focus) ?? profile.focus,
      isDefault:
        input.isDefault === undefined ? profile.isDefault : Boolean(input.isDefault),
      headline: normalizeOptionalText(input.headline) ?? profile.headline,
      summary: normalizeOptionalText(input.summary) ?? profile.summary,
      careerGoals: normalizeOptionalText(input.careerGoals) ?? profile.careerGoals,
      contactInfo:
        input.contactInfo === undefined
          ? normalizeContactInfo(profile.contactInfo)
          : normalizeContactInfo(input.contactInfo),
      additionalNotes:
        normalizeOptionalText(input.additionalNotes) ?? profile.additionalNotes,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(careerProfiles.profileId, profile.profileId),
        eq(careerProfiles.userId, userId),
      ),
    )
    .returning();

  return getCareerProfile(updatedProfile.userId, updatedProfile.profileId);
}

export async function upsertCareerExperience(userId, input) {
  const profile = await ensureCareerProfile(userId, input.profileId);

  if (!profile) {
    return null;
  }

  const values = {
    company: normalizeText(input.company),
    title: normalizeText(input.title),
    location: normalizeText(input.location),
    startDate: normalizeDate(input.startDate),
    endDate: normalizeDate(input.endDate),
    isCurrent: Boolean(input.isCurrent),
    description: normalizeText(input.description),
    achievements: parseList(input.achievements),
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    updatedAt: new Date(),
  };

  if (input.experienceId) {
    await db
      .update(careerProfileExperience)
      .set(values)
      .where(
        and(
          eq(careerProfileExperience.experienceId, input.experienceId),
          eq(careerProfileExperience.profileId, profile.profileId),
        ),
      );
  } else {
    await db.insert(careerProfileExperience).values({
      experienceId: randomUUID(),
      profileId: profile.profileId,
      ...values,
    });
  }

  return getCareerProfile(userId, profile.profileId);
}

export async function deleteCareerExperience(userId, experienceId, profileId) {
  const profile = await ensureCareerProfile(userId, profileId);

  if (!profile) {
    return null;
  }

  await db
    .delete(careerProfileExperience)
    .where(
      and(
        eq(careerProfileExperience.experienceId, experienceId),
        eq(careerProfileExperience.profileId, profile.profileId),
      ),
    );

  return getCareerProfile(userId, profile.profileId);
}

export async function upsertCareerEducation(userId, input) {
  const profile = await ensureCareerProfile(userId, input.profileId);

  if (!profile) {
    return null;
  }

  const values = {
    institution: normalizeText(input.institution),
    degree: normalizeText(input.degree),
    fieldOfStudy: normalizeText(input.fieldOfStudy),
    startDate: normalizeDate(input.startDate),
    endDate: normalizeDate(input.endDate),
    notes: normalizeText(input.notes),
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    updatedAt: new Date(),
  };

  if (input.educationId) {
    await db
      .update(careerProfileEducation)
      .set(values)
      .where(
        and(
          eq(careerProfileEducation.educationId, input.educationId),
          eq(careerProfileEducation.profileId, profile.profileId),
        ),
      );
  } else {
    await db.insert(careerProfileEducation).values({
      educationId: randomUUID(),
      profileId: profile.profileId,
      ...values,
    });
  }

  return getCareerProfile(userId, profile.profileId);
}

export async function deleteCareerEducation(userId, educationId, profileId) {
  const profile = await ensureCareerProfile(userId, profileId);

  if (!profile) {
    return null;
  }

  await db
    .delete(careerProfileEducation)
    .where(
      and(
        eq(careerProfileEducation.educationId, educationId),
        eq(careerProfileEducation.profileId, profile.profileId),
      ),
    );

  return getCareerProfile(userId, profile.profileId);
}

export async function upsertCareerSkill(userId, input) {
  const profile = await ensureCareerProfile(userId, input.profileId);

  if (!profile) {
    return null;
  }

  const name = normalizeText(input.name);

  if (!name) {
    throw new Error("Skill name is required");
  }

  const values = {
    name,
    category: normalizeText(input.category) || "General",
    proficiency: normalizeText(input.proficiency),
    evidence: normalizeText(input.evidence),
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    updatedAt: new Date(),
  };

  if (input.skillId) {
    await db
      .update(careerProfileSkills)
      .set(values)
      .where(
        and(
          eq(careerProfileSkills.skillId, input.skillId),
          eq(careerProfileSkills.profileId, profile.profileId),
        ),
      );
  } else {
    await db.insert(careerProfileSkills).values({
      skillId: randomUUID(),
      profileId: profile.profileId,
      ...values,
    });
  }

  return getCareerProfile(userId, profile.profileId);
}

export async function deleteCareerSkill(userId, skillId, profileId) {
  const profile = await ensureCareerProfile(userId, profileId);

  if (!profile) {
    return null;
  }

  await db
    .delete(careerProfileSkills)
    .where(
      and(
        eq(careerProfileSkills.skillId, skillId),
        eq(careerProfileSkills.profileId, profile.profileId),
      ),
    );

  return getCareerProfile(userId, profile.profileId);
}

export async function upsertCareerProject(userId, input) {
  const profile = await ensureCareerProfile(userId, input.profileId);

  if (!profile) {
    return null;
  }

  const name = normalizeText(input.name);

  if (!name) {
    throw new Error("Project name is required");
  }

  const values = {
    name,
    role: normalizeText(input.role),
    description: normalizeText(input.description),
    outcomes: normalizeText(input.outcomes),
    technologies: parseList(input.technologies),
    link: normalizeText(input.link),
    startDate: normalizeDate(input.startDate),
    endDate: normalizeDate(input.endDate),
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    updatedAt: new Date(),
  };

  if (input.projectId) {
    await db
      .update(careerProfileProjects)
      .set(values)
      .where(
        and(
          eq(careerProfileProjects.projectId, input.projectId),
          eq(careerProfileProjects.profileId, profile.profileId),
        ),
      );
  } else {
    await db.insert(careerProfileProjects).values({
      projectId: randomUUID(),
      profileId: profile.profileId,
      ...values,
    });
  }

  return getCareerProfile(userId, profile.profileId);
}

export async function deleteCareerProject(userId, projectId, profileId) {
  const profile = await ensureCareerProfile(userId, profileId);

  if (!profile) {
    return null;
  }

  await db
    .delete(careerProfileProjects)
    .where(
      and(
        eq(careerProfileProjects.projectId, projectId),
        eq(careerProfileProjects.profileId, profile.profileId),
      ),
    );

  return getCareerProfile(userId, profile.profileId);
}

export async function upsertCareerCertification(userId, input) {
  const profile = await ensureCareerProfile(userId, input.profileId);

  if (!profile) {
    return null;
  }

  const name = normalizeText(input.name);

  if (!name) {
    throw new Error("Certification name is required");
  }

  const values = {
    name,
    issuer: normalizeText(input.issuer),
    issueDate: normalizeDate(input.issueDate),
    expirationDate: normalizeDate(input.expirationDate),
    credentialId: normalizeText(input.credentialId),
    credentialUrl: normalizeText(input.credentialUrl),
    notes: normalizeText(input.notes),
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    updatedAt: new Date(),
  };

  if (input.certificationId) {
    await db
      .update(careerProfileCertifications)
      .set(values)
      .where(
        and(
          eq(careerProfileCertifications.certificationId, input.certificationId),
          eq(careerProfileCertifications.profileId, profile.profileId),
        ),
      );
  } else {
    await db.insert(careerProfileCertifications).values({
      certificationId: randomUUID(),
      profileId: profile.profileId,
      ...values,
    });
  }

  return getCareerProfile(userId, profile.profileId);
}

export async function deleteCareerCertification(userId, certificationId, profileId) {
  const profile = await ensureCareerProfile(userId, profileId);

  if (!profile) {
    return null;
  }

  await db
    .delete(careerProfileCertifications)
    .where(
      and(
        eq(careerProfileCertifications.certificationId, certificationId),
        eq(careerProfileCertifications.profileId, profile.profileId),
      ),
    );

  return getCareerProfile(userId, profile.profileId);
}

export async function updateCareerPreferences(userId, input) {
  const profile = await ensureCareerProfile(userId, input.profileId);

  if (!profile) {
    return null;
  }

  const values = {
    targetRoles: parseList(input.targetRoles),
    targetIndustries: parseList(input.targetIndustries),
    locations: parseList(input.locations),
    workModes: parseList(input.workModes),
    compensationGoals: normalizeText(input.compensationGoals),
    constraints: normalizeText(input.constraints),
    updatedAt: new Date(),
  };

  await db
    .insert(careerProfilePreferences)
    .values({
      preferenceId: randomUUID(),
      profileId: profile.profileId,
      ...values,
    })
    .onConflictDoUpdate({
      target: careerProfilePreferences.profileId,
      set: values,
    });

  return getCareerProfile(userId, profile.profileId);
}
