import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { careerProfiles } from "./careerProfiles";
import { resumes } from "./resumes";
import { savedJobs } from "./savedJobs";

export const resumeAnalyses = pgTable(
  "resume_analyses",
  {
    analysisId: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    profileId: text("profile_id").references(() => careerProfiles.profileId, {
      onDelete: "set null",
    }),
    resumeId: text("resume_id")
      .notNull()
      .references(() => resumes.resumeId, { onDelete: "cascade" }),
    savedJobId: text("saved_job_id")
      .notNull()
      .references(() => savedJobs.savedJobId, { onDelete: "cascade" }),

    status: text("status").notNull().default("completed"),
    fitScore: integer("fit_score"),
    fitSummary: text("fit_summary").notNull().default(""),
    strengths: jsonb("strengths").notNull().default([]),
    gaps: jsonb("gaps").notNull().default([]),
    missingKeywords: jsonb("missing_keywords").notNull().default([]),
    resumeSuggestions: jsonb("resume_suggestions").notNull().default([]),
    positioningGuidance: text("positioning_guidance").notNull().default(""),
    modelId: text("model_id").notNull().default(""),
    promptVersion: integer("prompt_version").notNull().default(1),
    rawOutput: jsonb("raw_output"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("resume_analyses_user_id_idx").on(table.userId),
    index("resume_analyses_resume_id_idx").on(table.resumeId),
    index("resume_analyses_saved_job_id_idx").on(table.savedJobId),
  ],
);

export const resumeAnalysesRelations = relations(resumeAnalyses, ({ one }) => ({
  user: one(user, {
    fields: [resumeAnalyses.userId],
    references: [user.id],
  }),
  profile: one(careerProfiles, {
    fields: [resumeAnalyses.profileId],
    references: [careerProfiles.profileId],
  }),
  resume: one(resumes, {
    fields: [resumeAnalyses.resumeId],
    references: [resumes.resumeId],
  }),
  savedJob: one(savedJobs, {
    fields: [resumeAnalyses.savedJobId],
    references: [savedJobs.savedJobId],
  }),
}));
