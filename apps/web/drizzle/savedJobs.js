import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema.ts";

export const savedJobs = pgTable(
  "saved_jobs",
  {
    savedJobId: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    company: text("company").notNull().default(""),
    location: text("location").notNull().default(""),
    workMode: text("work_mode").notNull().default("unspecified"),
    sourceUrl: text("source_url").notNull().default(""),
    description: text("description").notNull().default(""),
    notes: text("notes").notNull().default(""),
    interestLevel: text("interest_level").notNull().default("medium"),
    status: text("status").notNull().default("saved"),
    applicationDate: timestamp("application_date", { withTimezone: true }),
    nextAction: text("next_action").notNull().default(""),
    followUpDate: timestamp("follow_up_date", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("saved_jobs_user_id_idx").on(table.userId),
    index("saved_jobs_status_idx").on(table.status),
    index("saved_jobs_company_idx").on(table.company),
  ],
);

export const savedJobsRelations = relations(savedJobs, ({ one }) => ({
  user: one(user, {
    fields: [savedJobs.userId],
    references: [user.id],
  }),
}));
