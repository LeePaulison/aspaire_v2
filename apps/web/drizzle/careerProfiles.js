import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema.ts";

export const careerProfiles = pgTable(
  "career_profiles",
  {
    profileId: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    name: text("name").notNull().default("Default Profile"),
    focus: text("focus").notNull().default(""),
    isDefault: boolean("is_default").notNull().default(false),
    headline: text("headline").notNull().default(""),
    summary: text("summary").notNull().default(""),
    careerGoals: text("career_goals").notNull().default(""),
    contactInfo: jsonb("contact_info").notNull().default({}),
    additionalNotes: text("additional_notes").notNull().default(""),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("career_profiles_user_id_default_unique")
      .on(table.userId)
      .where(sql`${table.isDefault} = true`),
    index("career_profiles_user_id_idx").on(table.userId),
  ],
);

export const careerProfileExperience = pgTable(
  "career_profile_experience",
  {
    experienceId: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => careerProfiles.profileId, { onDelete: "cascade" }),

    company: text("company").notNull().default(""),
    title: text("title").notNull().default(""),
    location: text("location").notNull().default(""),
    startDate: date("start_date"),
    endDate: date("end_date"),
    isCurrent: boolean("is_current").notNull().default(false),
    description: text("description").notNull().default(""),
    achievements: jsonb("achievements").notNull().default([]),
    sortOrder: integer("sort_order").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("career_profile_experience_profile_id_idx").on(table.profileId)],
);

export const careerProfileEducation = pgTable(
  "career_profile_education",
  {
    educationId: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => careerProfiles.profileId, { onDelete: "cascade" }),

    institution: text("institution").notNull().default(""),
    degree: text("degree").notNull().default(""),
    fieldOfStudy: text("field_of_study").notNull().default(""),
    startDate: date("start_date"),
    endDate: date("end_date"),
    notes: text("notes").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("career_profile_education_profile_id_idx").on(table.profileId)],
);

export const careerProfileSkills = pgTable(
  "career_profile_skills",
  {
    skillId: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => careerProfiles.profileId, { onDelete: "cascade" }),

    name: text("name").notNull(),
    category: text("category").notNull().default("General"),
    proficiency: text("proficiency").notNull().default(""),
    evidence: text("evidence").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("career_profile_skills_profile_id_idx").on(table.profileId),
    index("career_profile_skills_name_idx").on(table.name),
  ],
);

export const careerProfileProjects = pgTable(
  "career_profile_projects",
  {
    projectId: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => careerProfiles.profileId, { onDelete: "cascade" }),

    name: text("name").notNull(),
    role: text("role").notNull().default(""),
    description: text("description").notNull().default(""),
    outcomes: text("outcomes").notNull().default(""),
    technologies: jsonb("technologies").notNull().default([]),
    link: text("link").notNull().default(""),
    startDate: date("start_date"),
    endDate: date("end_date"),
    sortOrder: integer("sort_order").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("career_profile_projects_profile_id_idx").on(table.profileId),
    index("career_profile_projects_name_idx").on(table.name),
  ],
);

export const careerProfileCertifications = pgTable(
  "career_profile_certifications",
  {
    certificationId: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => careerProfiles.profileId, { onDelete: "cascade" }),

    name: text("name").notNull(),
    issuer: text("issuer").notNull().default(""),
    issueDate: date("issue_date"),
    expirationDate: date("expiration_date"),
    credentialId: text("credential_id").notNull().default(""),
    credentialUrl: text("credential_url").notNull().default(""),
    notes: text("notes").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("career_profile_certifications_profile_id_idx").on(table.profileId),
    index("career_profile_certifications_name_idx").on(table.name),
  ],
);

export const careerProfilePreferences = pgTable(
  "career_profile_preferences",
  {
    preferenceId: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => careerProfiles.profileId, { onDelete: "cascade" }),

    targetRoles: jsonb("target_roles").notNull().default([]),
    targetIndustries: jsonb("target_industries").notNull().default([]),
    locations: jsonb("locations").notNull().default([]),
    workModes: jsonb("work_modes").notNull().default([]),
    compensationGoals: text("compensation_goals").notNull().default(""),
    constraints: text("constraints").notNull().default(""),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("career_profile_preferences_profile_id_unique").on(
      table.profileId,
    ),
  ],
);

export const careerProfilesRelations = relations(
  careerProfiles,
  ({ one, many }) => ({
    user: one(user, {
      fields: [careerProfiles.userId],
      references: [user.id],
    }),
    experience: many(careerProfileExperience),
    education: many(careerProfileEducation),
    skills: many(careerProfileSkills),
    projects: many(careerProfileProjects),
    certifications: many(careerProfileCertifications),
    preferences: many(careerProfilePreferences),
  }),
);
