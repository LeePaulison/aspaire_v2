import { useMemo, useState } from "react";

export function usePreferencesSelection({
  aiAgents,
  aiModels,
  reasoningLevels,
  verbosityLevels,
  preferences,
  savePreferences,
}) {
  const defaultAgent = aiAgents.find(
    (item) => item.agentId === preferences.defaultAgentId,
  );
  const [model, setModel] = useState(preferences.defaultModelId);
  const [temperature, setTemperature] = useState(preferences.temperature);
  const [reasoning, setReasoning] = useState(preferences.defaultReasoningId);
  const [verbosity, setVerbosity] = useState(preferences.defaultVerbosityId);
  const [category, setCategory] = useState(defaultAgent?.category ?? "");
  const [agent, setAgent] = useState(preferences.defaultAgentId);

  const categories = useMemo(
    () => [...new Set(aiAgents.map((item) => item.category).filter(Boolean))],
    [aiAgents],
  );
  const agents = useMemo(
    () => aiAgents.filter((item) => item.category === category),
    [aiAgents, category],
  );

  const changeCategory = (nextCategory) => {
    setCategory(nextCategory);
    setAgent(
      aiAgents.find((item) => item.category === nextCategory)?.agentId ?? "",
    );
  };

  const save = (updates) => {
    const { userId, ...input } = { ...preferences, ...updates };
    return savePreferences(input);
  };

  return {
    models: aiModels,
    agents,
    categories,
    reasoningLevels,
    verbosityLevels,
    model,
    temperature,
    category,
    agent,
    reasoning,
    verbosity,
    save,
    selectedAgent: aiAgents.find((item) => item.agentId === agent),
    selectedModel: aiModels.find((item) => item.modelId === model),
    selectedReasoning: reasoningLevels.find((item) => item.levelId === reasoning),
    selectedVerbosity: verbosityLevels.find((item) => item.levelId === verbosity),
    setCategory: changeCategory,
    setModel,
    setTemperature,
    setReasoning,
    setVerbosity,
    setAgent,
  };
}
