import { asc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db/neon.js";
import { aiAgents } from "@/drizzle/aiAgents.js";

export const defaultAgents = [
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

export async function getAiAgents() {
  return db
    .select()
    .from(aiAgents)
    .where(eq(aiAgents.enabled, true))
    .orderBy(asc(aiAgents.sortOrder), asc(aiAgents.category), asc(aiAgents.name));
}

export async function getAiAgentById(agentId) {
  const [agent] = await db
    .select()
    .from(aiAgents)
    .where(eq(aiAgents.agentId, agentId))
    .limit(1);

  return agent;
}

export async function upsertAiAgent({
  agentId,
  category,
  domain = "general",
  workflowType = "chat",
  name,
  description,
  defaultModelId,
  contextPolicy = "none",
  toolPolicy = "none",
  systemPrompt,
  promptVersion = 1,
  enabled = true,
  sortOrder = 0,
}) {
  const [agent] = await db
    .insert(aiAgents)
    .values({
      agentId,
      category,
      domain,
      workflowType,
      name,
      description,
      defaultModelId,
      contextPolicy,
      toolPolicy,
      systemPrompt,
      promptVersion,
      enabled,
      sortOrder,
    })
    .onConflictDoUpdate({
      target: aiAgents.agentId,
      set: {
        category,
        domain,
        workflowType,
        name,
        description,
        defaultModelId,
        contextPolicy,
        toolPolicy,
        systemPrompt,
        promptVersion,
        enabled,
        sortOrder,
        updatedAt: new Date(),
      },
    })
    .returning();

  return agent;
}

export async function createDefaultAiAgents() {
  await db
    .insert(aiAgents)
    .values(defaultAgents)
    .onConflictDoUpdate({
      target: aiAgents.agentId,
      set: {
        category: sql.raw(`excluded.category`),
        domain: sql.raw(`excluded.domain`),
        workflowType: sql.raw(`excluded.workflow_type`),
        name: sql.raw(`excluded.name`),
        description: sql.raw(`excluded.description`),
        defaultModelId: sql.raw(`excluded.default_model_id`),
        contextPolicy: sql.raw(`excluded.context_policy`),
        toolPolicy: sql.raw(`excluded.tool_policy`),
        systemPrompt: sql.raw(`excluded.system_prompt`),
        promptVersion: sql.raw(`excluded.prompt_version`),
        enabled: sql.raw(`excluded.enabled`),
        sortOrder: sql.raw(`excluded.sort_order`),
        updatedAt: new Date(),
      },
    });
}
