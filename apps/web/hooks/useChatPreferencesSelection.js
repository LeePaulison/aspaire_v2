import { useMemo, useState } from "react";

import { useHeaderPreferences } from "./useHeaderPreferences";
import { useHydrated } from "./useHydrated";

export function useChatPreferencesSelection() {
  const hydrated = useHydrated();
  const {
    aiAgents,
    aiModels,
    preferences,
    savePreferences,
  } = useHeaderPreferences();
  const [savingSelection, setSavingSelection] = useState(false);

  const categories = useMemo(
    () => [...new Set(aiAgents.map((agent) => agent.category).filter(Boolean))],
    [aiAgents],
  );
  const hydratedPreferences = hydrated ? preferences : null;

  const saveSelection = async (updates) => {
    if (!preferences) return;

    const { userId, ...input } = { ...preferences, ...updates };
    setSavingSelection(true);

    try {
      await savePreferences(input);
    } finally {
      setSavingSelection(false);
    }
  };

  return {
    models: aiModels,
    allAgents: aiAgents,
    categories,
    model: hydratedPreferences?.defaultModelId ?? "",
    agent: hydratedPreferences?.defaultAgentId ?? "",
    preferences: hydratedPreferences,
    savingSelection,
    saveModelSelection: (defaultModelId) => saveSelection({ defaultModelId }),
    saveAgentSelection: (defaultAgentId) => saveSelection({ defaultAgentId }),
  };
}
