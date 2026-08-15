import {
  boolean,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { aiAgents } from "./aiAgents.js";
import { aiModels } from "./aiModels.js";
import { reasoningLevels } from "./reasoningLevels.js";
import { verbosityLevels } from "./verbosityLevels.js";

export const domainPreferences = pgTable(
  "domain_preferences",
  {
    domainPreferenceId: text("id").primaryKey(),

    domain: text("domain").notNull(),
    workflowType: text("workflow_type").notNull(),
    agentId: text("agent_id").references(() => aiAgents.agentId, {
      onDelete: "set null",
    }),
    defaultModelId: text("default_model_id").references(() => aiModels.modelId, {
      onDelete: "set null",
    }),
    temperature: real("temperature"),
    defaultReasoningId: text("default_reasoning_id").references(
      () => reasoningLevels.levelId,
      { onDelete: "set null" },
    ),
    defaultVerbosityId: text("default_verbosity_id").references(
      () => verbosityLevels.levelId,
      { onDelete: "set null" },
    ),
    responseFormat: text("response_format").notNull().default("text"),
    responseSchema: jsonb("response_schema"),
    enabled: boolean("enabled").notNull().default(true),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("domain_preferences_domain_workflow_unique").on(
      table.domain,
      table.workflowType,
    ),
  ],
);
