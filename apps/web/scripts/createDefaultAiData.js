import nextEnv from "@next/env";
import { neon } from "@neondatabase/serverless";
import { sql as drizzleSql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import { aiAgents } from "../drizzle/aiAgents.js";
import { aiModels } from "../drizzle/aiModels.js";
import { domainPreferences } from "../drizzle/domainPreferences.js";
import { reasoningLevels } from "../drizzle/reasoningLevels.js";
import { verbosityLevels } from "../drizzle/verbosityLevels.js";
import { careerProfileDraftResponseSchema } from "../lib/ai/careerProfileDraftResponseSchema.js";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined.");
}

const db = drizzle({ client: neon(process.env.DATABASE_URL) });

const defaultAiModels = [
  {
    modelId: "gpt-5.6-sol",
    name: "GPT-5.6 Sol",
    provider: "OpenAI",
    description:
      "Highest capability GPT-5.6 model for reasoning, writing, analysis, and complex problem solving at the highest cost.",
    supportsTemperature: false,
    supportsReasoning: true,
    supportsVerbosity: true,
    supportsStreaming: true,
  },
  {
    modelId: "gpt-5.6-terra",
    name: "GPT-5.6 Terra",
    provider: "OpenAI",
    description:
      "Balanced GPT-5.6 model optimized for strong reasoning, writing, analysis, speed, and lower cost than Sol.",
    supportsTemperature: false,
    supportsReasoning: true,
    supportsVerbosity: true,
    supportsStreaming: true,
  },
  {
    modelId: "gpt-5.6-luna",
    name: "GPT-5.6 Luna",
    provider: "OpenAI",
    description:
      "Fast, cost-effective GPT-5.6 model for everyday career work and chat.",
    supportsTemperature: false,
    supportsReasoning: true,
    supportsVerbosity: true,
    supportsStreaming: true,
  },
  {
    modelId: "gpt-5.5",
    name: "GPT-5.5",
    provider: "OpenAI",
    description:
      "Strong prior-frontier model for reasoning, coding, writing, and complex problem solving.",
    supportsTemperature: false,
    supportsReasoning: true,
    supportsVerbosity: true,
    supportsStreaming: true,
  },
  {
    modelId: "gpt-5.1",
    name: "GPT-5.1",
    provider: "OpenAI",
    description:
      "Stable GPT-5 model for reasoning, writing, analysis, and general chat.",
    supportsTemperature: false,
    supportsReasoning: true,
    supportsVerbosity: true,
    supportsStreaming: true,
  },
  {
    modelId: "gpt-5-mini",
    name: "GPT-5 Mini",
    provider: "OpenAI",
    description:
      "Fast, cost-effective model for everyday career work and chat.",
    supportsTemperature: false,
    supportsReasoning: true,
    supportsVerbosity: true,
    supportsStreaming: true,
  },
  {
    modelId: "gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
    description:
      "Advanced coding and reasoning model with excellent instruction following.",
    supportsTemperature: true,
    supportsReasoning: false,
    supportsVerbosity: false,
    supportsStreaming: true,
  },
  {
    modelId: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "OpenAI",
    description: "Balanced model optimized for speed, quality, and lower cost.",
    supportsTemperature: true,
    supportsReasoning: false,
    supportsVerbosity: false,
    supportsStreaming: true,
  },
];

const defaultAgents = [
  {
    agentId: "assistant",
    category: "General",
    domain: "general",
    workflowType: "chat",
    name: "Career Workspace Assistant",
    description:
      "General-purpose career assistant for planning, drafting, and job-search questions.",
    contextPolicy: "user-selected",
    toolPolicy: "none",
    systemPrompt:
      "You are AspAIre's career workspace assistant. Help the user make practical career decisions, organize job-search work, draft materials, and reason clearly from the career, resume, and job context they provide. Keep advice specific, honest, and user-controlled.",
    sortOrder: 10,
  },
  {
    agentId: "career-profile",
    category: "Career Profile",
    domain: "career_profile",
    workflowType: "profile_guidance",
    name: "Career Profile Coach",
    description:
      "Helps structure professional summaries, skills, experience, goals, and preferences.",
    contextPolicy: "career-profile",
    toolPolicy: "none",
    systemPrompt:
      "You are AspAIre's career profile coach. Help the user clarify their professional story, skills, experience, goals, and role preferences. Suggest improvements without overwriting user-owned career data unless the user explicitly asks for draft text.",
    sortOrder: 20,
  },
  {
    agentId: "resume-reviewer",
    category: "Resume",
    domain: "resume_library",
    workflowType: "resume_review",
    name: "Resume Reviewer",
    description:
      "Reviews resume text for clarity, relevance, evidence, and role alignment.",
    contextPolicy: "selected-resume",
    toolPolicy: "none",
    systemPrompt:
      "You are AspAIre's resume reviewer. Give practical, specific feedback on resume content, structure, relevance, evidence, and impact. Preserve the user's voice and distinguish strong recommendations from optional polish.",
    sortOrder: 30,
  },
  {
    agentId: "resume-parser",
    category: "Resume",
    domain: "career_evidence",
    workflowType: "resume_to_career_profile_draft",
    name: "Resume Parser",
    description:
      "Extracts imported resume content into a structured Career Profile draft for user review.",
    defaultModelId: "gpt-5.5",
    contextPolicy: "selected-resume",
    toolPolicy: "none",
    systemPrompt:
      "You are AspAIre's resume parser. Extract the provided resume text into a structured Career Profile draft JSON object. Preserve user-owned facts, do not invent details, and place email, phone, location, websites, portfolios, and social/profile URLs into contactInfo. Place only ambiguous or unplaced content into additionalNotes. Parsed content is only a draft for review and must not be treated as durable profile truth until accepted by the user.",
    sortOrder: 35,
  },
  {
    agentId: "job-fit-analyst",
    category: "Analysis",
    domain: "resume_analysis",
    workflowType: "resume_to_job_analysis",
    name: "Job Fit Analyst",
    description:
      "Compares career profile and resume context against a saved job opportunity.",
    contextPolicy: "profile-resume-job",
    toolPolicy: "analysis-only",
    systemPrompt:
      "You are AspAIre's job fit analyst. Compare the selected career profile, resume, and job posting. Return an explainable fit summary, strengths, gaps, missing keywords, resume suggestions, and positioning guidance. Avoid unsupported claims and keep recommendations actionable.",
    sortOrder: 40,
  },
  {
    agentId: "application-coach",
    category: "Application Tracking",
    domain: "application_tracking",
    workflowType: "next_action",
    name: "Application Coach",
    description:
      "Helps decide application status, next action, follow-up timing, and notes.",
    contextPolicy: "saved-job-application",
    toolPolicy: "none",
    systemPrompt:
      "You are AspAIre's application coach. Help the user keep saved opportunities actionable by clarifying status, next actions, follow-up timing, notes, and preparation steps. Do not imply that AspAIre submitted applications or contacted employers.",
    sortOrder: 50,
  },
  {
    agentId: "interview-prep",
    category: "Interview Prep",
    domain: "interview_preparation",
    workflowType: "interview_prep",
    name: "Interview Prep Coach",
    description:
      "Prepares likely questions, talking points, and study areas for saved jobs.",
    contextPolicy: "profile-resume-job",
    toolPolicy: "none",
    systemPrompt:
      "You are AspAIre's interview prep coach. Help the user prepare for interviews using selected career, resume, and job context. Generate likely questions, talking points, gaps to study, and concise practice guidance.",
    sortOrder: 60,
  },
];

const defaultDomainPreferences = [
  {
    domainPreferenceId: "career_evidence.resume_to_career_profile_draft",
    domain: "career_evidence",
    workflowType: "resume_to_career_profile_draft",
    agentId: "resume-parser",
    defaultModelId: "gpt-5.5",
    temperature: null,
    defaultReasoningId: "medium",
    defaultVerbosityId: "low",
    responseFormat: "json_schema",
    responseSchema: careerProfileDraftResponseSchema,
    enabled: true,
  },
];

const defaultReasoningLevels = [
  {
    levelId: "minimal",
    name: "Minimal",
    description: "Fastest responses with minimal internal reasoning.",
  },
  {
    levelId: "low",
    name: "Low",
    description: "Light reasoning for everyday questions.",
  },
  {
    levelId: "medium",
    name: "Medium",
    description: "Balanced reasoning for coding and technical work.",
  },
  {
    levelId: "high",
    name: "High",
    description: "Deep reasoning for complex analysis and problem solving.",
  },
];

const defaultVerbosityLevels = [
  {
    levelId: "low",
    name: "Low",
    description: "Concise, direct responses with minimal detail.",
  },
  {
    levelId: "medium",
    name: "Medium",
    description: "Balanced responses with a moderate level of detail.",
  },
  {
    levelId: "high",
    name: "High",
    description:
      "Detailed responses with explanations and examples where appropriate.",
  },
];

async function createDefaultAiModels() {
  await db
    .insert(aiModels)
    .values(defaultAiModels)
    .onConflictDoUpdate({
      target: aiModels.modelId,
      set: {
        name: drizzleSql.raw("excluded.name"),
        provider: drizzleSql.raw("excluded.provider"),
        description: drizzleSql.raw("excluded.description"),
        supportsTemperature: drizzleSql.raw("excluded.supports_temperature"),
        supportsReasoning: drizzleSql.raw("excluded.supports_reasoning"),
        supportsVerbosity: drizzleSql.raw("excluded.supports_verbosity"),
        supportsStreaming: drizzleSql.raw("excluded.supports_streaming"),
        updatedAt: new Date(),
      },
    });
}

async function createDefaultAiAgents() {
  await db
    .insert(aiAgents)
    .values(defaultAgents)
    .onConflictDoUpdate({
      target: aiAgents.agentId,
      set: {
        category: drizzleSql.raw("excluded.category"),
        domain: drizzleSql.raw("excluded.domain"),
        workflowType: drizzleSql.raw("excluded.workflow_type"),
        name: drizzleSql.raw("excluded.name"),
        description: drizzleSql.raw("excluded.description"),
        defaultModelId: drizzleSql.raw("excluded.default_model_id"),
        contextPolicy: drizzleSql.raw("excluded.context_policy"),
        toolPolicy: drizzleSql.raw("excluded.tool_policy"),
        systemPrompt: drizzleSql.raw("excluded.system_prompt"),
        promptVersion: drizzleSql.raw("excluded.prompt_version"),
        enabled: drizzleSql.raw("excluded.enabled"),
        sortOrder: drizzleSql.raw("excluded.sort_order"),
        updatedAt: new Date(),
      },
    });
}

async function createDefaultDomainPreferences() {
  await db
    .insert(domainPreferences)
    .values(defaultDomainPreferences)
    .onConflictDoUpdate({
      target: [
        domainPreferences.domain,
        domainPreferences.workflowType,
      ],
      set: {
        agentId: drizzleSql.raw("excluded.agent_id"),
        defaultModelId: drizzleSql.raw("excluded.default_model_id"),
        temperature: drizzleSql.raw("excluded.temperature"),
        defaultReasoningId: drizzleSql.raw("excluded.default_reasoning_id"),
        defaultVerbosityId: drizzleSql.raw("excluded.default_verbosity_id"),
        responseFormat: drizzleSql.raw("excluded.response_format"),
        responseSchema: drizzleSql.raw("excluded.response_schema"),
        enabled: drizzleSql.raw("excluded.enabled"),
        updatedAt: new Date(),
      },
    });
}

async function createDefaultReasoningLevels() {
  await db
    .insert(reasoningLevels)
    .values(defaultReasoningLevels)
    .onConflictDoUpdate({
      target: reasoningLevels.levelId,
      set: {
        name: drizzleSql.raw("excluded.name"),
        description: drizzleSql.raw("excluded.description"),
        updatedAt: new Date(),
      },
    });
}

async function createDefaultVerbosityLevels() {
  await db
    .insert(verbosityLevels)
    .values(defaultVerbosityLevels)
    .onConflictDoUpdate({
      target: verbosityLevels.levelId,
      set: {
        name: drizzleSql.raw("excluded.name"),
        description: drizzleSql.raw("excluded.description"),
        updatedAt: new Date(),
      },
    });
}

async function main() {
  await createDefaultAiModels();
  await createDefaultReasoningLevels();
  await createDefaultVerbosityLevels();
  await createDefaultAiAgents();
  await createDefaultDomainPreferences();

  console.log("Default AI data created or updated.");
}

main().catch((error) => {
  console.error("Failed to create default AI data.");
  console.error(error);
  process.exitCode = 1;
});
