// repositories/preferencesRepository.js

import { eq } from "drizzle-orm";

import { db } from "@/lib/db/neon";
import { preferences } from "@/drizzle/preferences";

export async function getPreferencesByUserId(userId) {
  const [preference] = await db
    .select()
    .from(preferences)
    .where(eq(preferences.userId, userId));

  if (preference) {
    return preference;
  }

  return upsertPreferences({
    userId,
    theme: "dark",
    defaultModelId: "gpt-4.1-mini",
    temperature: 0.7,
    defaultReasoningId: "medium",
    defaultVerbosityId: "medium",
    defaultAgentId: "assistant",
  });
}

export async function upsertPreferences({
  userId,
  theme,
  defaultModelId,
  temperature,
  defaultReasoningId,
  defaultVerbosityId,
  defaultAgentId,
}) {
  const [preference] = await db
    .insert(preferences)
    .values({
      userId,
      theme,
      defaultModelId,
      temperature,
      defaultReasoningId,
      defaultVerbosityId,
      defaultAgentId,
    })
    .onConflictDoUpdate({
      target: preferences.userId,
      set: {
        theme,
        defaultModelId,
        temperature,
        defaultReasoningId,
        defaultVerbosityId,
        defaultAgentId,
        updatedAt: new Date(),
      },
    })
    .returning();

  return preference;
}
