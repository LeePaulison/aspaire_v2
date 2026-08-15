import { and, eq, sql } from "drizzle-orm";

import { domainPreferences } from "@/drizzle/domainPreferences";
import { careerProfileDraftResponseSchema } from "@/lib/ai/careerProfileDraftResponseSchema";
import { db } from "@/lib/db/neon";

export const defaultDomainPreferences = [
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

export async function getDomainPreference(domain, workflowType) {
  const [preference] = await db
    .select()
    .from(domainPreferences)
    .where(
      and(
        eq(domainPreferences.domain, domain),
        eq(domainPreferences.workflowType, workflowType),
        eq(domainPreferences.enabled, true),
      ),
    )
    .limit(1);

  return preference ?? null;
}

export async function createDefaultDomainPreferences() {
  await db
    .insert(domainPreferences)
    .values(defaultDomainPreferences)
    .onConflictDoUpdate({
      target: [
        domainPreferences.domain,
        domainPreferences.workflowType,
      ],
      set: {
        agentId: sql.raw("excluded.agent_id"),
        defaultModelId: sql.raw("excluded.default_model_id"),
        temperature: sql.raw("excluded.temperature"),
        defaultReasoningId: sql.raw("excluded.default_reasoning_id"),
        defaultVerbosityId: sql.raw("excluded.default_verbosity_id"),
        responseFormat: sql.raw("excluded.response_format"),
        responseSchema: sql.raw("excluded.response_schema"),
        enabled: sql.raw("excluded.enabled"),
        updatedAt: new Date(),
      },
    });
}
