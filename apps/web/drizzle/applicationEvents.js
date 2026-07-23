import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema.ts";
import { savedJobs } from "./savedJobs.js";

export const applicationEvents = pgTable(
  "application_events",
  {
    eventId: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    savedJobId: text("saved_job_id")
      .notNull()
      .references(() => savedJobs.savedJobId, { onDelete: "cascade" }),

    eventType: text("event_type").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    notes: text("notes").notNull().default(""),
    nextAction: text("next_action").notNull().default(""),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("application_events_user_id_idx").on(table.userId),
    index("application_events_saved_job_id_idx").on(table.savedJobId),
    index("application_events_occurred_at_idx").on(table.occurredAt),
  ],
);

export const applicationEventsRelations = relations(
  applicationEvents,
  ({ one }) => ({
    user: one(user, {
      fields: [applicationEvents.userId],
      references: [user.id],
    }),
    savedJob: one(savedJobs, {
      fields: [applicationEvents.savedJobId],
      references: [savedJobs.savedJobId],
    }),
  }),
);
