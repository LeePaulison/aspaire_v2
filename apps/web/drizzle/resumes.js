import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { careerProfiles } from "./careerProfiles";

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
  ],
);

export const resumesRelations = relations(resumes, ({ one }) => ({
  user: one(user, {
    fields: [resumes.userId],
    references: [user.id],
  }),
  profile: one(careerProfiles, {
    fields: [resumes.profileId],
    references: [careerProfiles.profileId],
  }),
}));
