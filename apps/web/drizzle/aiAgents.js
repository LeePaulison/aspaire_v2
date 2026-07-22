import {
  pgTable,
  integer,
  boolean,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const aiAgents = pgTable("ai_agents", {
  agentId: text("id").primaryKey(),

  category: text("category").notNull(),
  domain: text("domain").notNull().default("general"),
  workflowType: text("workflow_type").notNull().default("chat"),
  name: text("name").notNull(),
  description: text("description").notNull(),

  defaultModelId: text("default_model_id"),
  contextPolicy: text("context_policy").notNull().default("none"),
  toolPolicy: text("tool_policy").notNull().default("none"),
  systemPrompt: text("system_prompt").notNull(),
  promptVersion: integer("prompt_version").notNull().default(1),

  enabled: boolean("enabled").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),

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
});
