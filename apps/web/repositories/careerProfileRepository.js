import { randomUUID } from "node:crypto";

import { and, asc, eq } from "drizzle-orm";

import { db } from "@/lib/db/neon";
import {
  careerProfileEducation,
  careerProfileExperience,
  careerProfilePreferences,
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

async function getProfileRecord(userId) {
  const [profile] = await db
    .select()
    .from(careerProfiles)
    .where(eq(careerProfiles.userId, userId))
    .limit(1);

  return profile ?? null;
}

async function createProfileRecord(userId) {
  const [profile] = await db
    .insert(careerProfiles)
    .values({
      profileId: randomUUID(),
      userId,
    })
    .returning();

  await db.insert(careerProfilePreferences).values({
    preferenceId: randomUUID(),
    profileId: profile.profileId,
  });

  return profile;
}

export async function ensureCareerProfile(userId) {
  const existingProfile = await getProfileRecord(userId);

  if (existingProfile) {
    return existingProfile;
  }

  return createProfileRecord(userId);
}

export async function getCareerProfile(userId) {
  const profile = await getProfileRecord(userId);

  if (!profile) {
    return null;
  }

  const [experience, education, skills, preferencesRows] = await Promise.all([
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
      .from(careerProfilePreferences)
      .where(eq(careerProfilePreferences.profileId, profile.profileId))
      .limit(1),
  ]);

  return {
    ...profile,
    experience,
    education,
    skills,
    preferences: preferencesRows[0] ?? null,
  };
}

export async function updateCareerProfileSummary(userId, input) {
  const profile = await ensureCareerProfile(userId);

  const [updatedProfile] = await db
    .update(careerProfiles)
    .set({
      headline: normalizeOptionalText(input.headline) ?? profile.headline,
      summary: normalizeOptionalText(input.summary) ?? profile.summary,
      careerGoals: normalizeOptionalText(input.careerGoals) ?? profile.careerGoals,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(careerProfiles.profileId, profile.profileId),
        eq(careerProfiles.userId, userId),
      ),
    )
    .returning();

  return getCareerProfile(updatedProfile.userId);
}

export async function upsertCareerExperience(userId, input) {
  const profile = await ensureCareerProfile(userId);
  const values = {
    company: normalizeText(input.company),
    title: normalizeText(input.title),
    location: normalizeText(input.location),
    startDate: normalizeText(input.startDate),
    endDate: normalizeText(input.endDate),
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

  return getCareerProfile(userId);
}

export async function deleteCareerExperience(userId, experienceId) {
  const profile = await ensureCareerProfile(userId);

  await db
    .delete(careerProfileExperience)
    .where(
      and(
        eq(careerProfileExperience.experienceId, experienceId),
        eq(careerProfileExperience.profileId, profile.profileId),
      ),
    );

  return getCareerProfile(userId);
}

export async function upsertCareerEducation(userId, input) {
  const profile = await ensureCareerProfile(userId);
  const values = {
    institution: normalizeText(input.institution),
    degree: normalizeText(input.degree),
    fieldOfStudy: normalizeText(input.fieldOfStudy),
    startDate: normalizeText(input.startDate),
    endDate: normalizeText(input.endDate),
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

  return getCareerProfile(userId);
}

export async function deleteCareerEducation(userId, educationId) {
  const profile = await ensureCareerProfile(userId);

  await db
    .delete(careerProfileEducation)
    .where(
      and(
        eq(careerProfileEducation.educationId, educationId),
        eq(careerProfileEducation.profileId, profile.profileId),
      ),
    );

  return getCareerProfile(userId);
}

export async function upsertCareerSkill(userId, input) {
  const profile = await ensureCareerProfile(userId);
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

  return getCareerProfile(userId);
}

export async function deleteCareerSkill(userId, skillId) {
  const profile = await ensureCareerProfile(userId);

  await db
    .delete(careerProfileSkills)
    .where(
      and(
        eq(careerProfileSkills.skillId, skillId),
        eq(careerProfileSkills.profileId, profile.profileId),
      ),
    );

  return getCareerProfile(userId);
}

export async function updateCareerPreferences(userId, input) {
  const profile = await ensureCareerProfile(userId);
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

  return getCareerProfile(userId);
}
