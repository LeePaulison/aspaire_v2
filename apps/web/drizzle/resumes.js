import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema.ts";
import { careerProfiles } from "./careerProfiles.js";

export const resumes = pgTable(
  "resumes",
  {
    resumeId: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    profileId: text("profile_id").references(() => careerProfiles.profileId, {
      onDelete: "set null",
    }),

    title: text("title").notNull(),
    targetRole: text("target_role").notNull().default(""),
    notes: text("notes").notNull().default(""),
    resumeText: text("resume_text").notNull().default(""),
    status: text("status").notNull().default("draft"),
    sourceType: text("source_type").notNull().default("manual"),
    isPrimary: boolean("is_primary").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("resumes_user_id_idx").on(table.userId),
    index("resumes_profile_id_idx").on(table.profileId),
    index("resumes_status_idx").on(table.status),
  ],
);

export const resumeFiles = pgTable(
  "resume_files",
  {
    fileId: text("id").primaryKey(),
    resumeId: text("resume_id")
      .notNull()
      .references(() => resumes.resumeId, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    originalFilename: text("original_filename").notNull(),
    contentType: text("content_type").notNull(),
    fileSize: integer("file_size").notNull(),
    storageKey: text("storage_key").notNull(),
    textExtractionStatus: text("text_extraction_status")
      .notNull()
      .default("pending"),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("resume_files_resume_id_idx").on(table.resumeId),
    index("resume_files_user_id_idx").on(table.userId),
  ],
);

export const resumesRelations = relations(resumes, ({ one, many }) => ({
  user: one(user, {
    fields: [resumes.userId],
    references: [user.id],
  }),
  profile: one(careerProfiles, {
    fields: [resumes.profileId],
    references: [careerProfiles.profileId],
  }),
  files: many(resumeFiles),
}));

export const resumeFilesRelations = relations(resumeFiles, ({ one }) => ({
  resume: one(resumes, {
    fields: [resumeFiles.resumeId],
    references: [resumes.resumeId],
  }),
  user: one(user, {
    fields: [resumeFiles.userId],
    references: [user.id],
  }),
}));
