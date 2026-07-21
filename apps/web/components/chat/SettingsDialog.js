"use client";

import { usePreferencesSelection } from "@/hooks/usePreferencesSelection";
import { useHeaderPreferences } from "@/hooks/useHeaderPreferences";

import { Dialog } from "radix-ui";
import { ScrollArea } from "radix-ui";
import { useTheme } from "next-themes";

export const SettingsDialog = (props) => {
  const preferenceData = useHeaderPreferences();
  const { preferences, aiAgents, aiModels } = preferenceData;

  if (!preferences || !aiAgents.length || !aiModels.length) {
    return null;
  }

  const draftKey = JSON.stringify(preferences);

  return (
    <SettingsDialogForm
      key={draftKey}
      {...props}
      preferenceData={preferenceData}
    />
  );
};

const SettingsDialogForm = ({ open, onOpenChange, preferenceData }) => {
  const { theme, setTheme } = useTheme();

  const {
    models,
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

    selectedAgent,
    selectedModel,
    selectedReasoning,
    selectedVerbosity,

    setCategory,
    setModel,
    setTemperature,
    setReasoning,
    setVerbosity,
    setAgent,
  } = usePreferencesSelection(preferenceData);

  const handleSave = async () => {
    await save({
      theme,
      defaultModelId: model,
      temperature,
      defaultReasoningId: reasoning,
      defaultVerbosityId: verbosity,
      defaultAgentId: agent,
    });
  };

  const supportsTemperature = !!selectedModel?.supportsTemperature;
  const supportsReasoning = !!selectedModel?.supportsReasoning;
  const supportsVerbosity = !!selectedModel?.supportsVerbosity;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />

        <Dialog.Content className="DialogContent">
          <Dialog.Title className="DialogTitle">Settings</Dialog.Title>

          <Dialog.Description className="DialogDescription">
            Customize your Saigely experience.
          </Dialog.Description>

          <ScrollArea.Root className="DialogScrollArea">
            <ScrollArea.Viewport className="DialogViewport">
              <div className="DialogCard">
                <div className="DialogCardTitle">Appearance</div>

                <div className="DialogSection">
                  <div className="DialogField">
                    <label className="DialogLabel" htmlFor="theme">
                      Theme
                    </label>

                    <select
                      id="theme"
                      className="DialogSelect"
                      value={theme}
                      onChange={(event) => setTheme(event.target.value)}
                    >
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* AI Model */}
              <div className="DialogCard">
                <div className="DialogCardTitle">Model</div>

                <div className="DialogField">
                  <label className="DialogLabel" htmlFor="model">
                    AI Model
                  </label>

                  <select
                    id="model"
                    className="DialogSelect"
                    value={model}
                    onChange={(event) => setModel(event.target.value)}
                  >
                    {models.map((model) => (
                      <option key={model.modelId} value={model.modelId}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                  <p className="FieldDescription">
                    {selectedModel?.description}
                  </p>
                </div>

                {/* Temperature */}

                {supportsTemperature && (
                  <div className="DialogField">
                    <label className="DialogLabel" htmlFor="temperature">
                      Temperature
                    </label>

                    <input
                      id="temperature"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      className="DialogSlider"
                      value={temperature}
                      onChange={(event) =>
                        setTemperature(Number(event.target.value))
                      }
                    />
                  </div>
                )}

                {supportsReasoning && (
                  <div className="DialogField">
                    <label className="DialogLabel" htmlFor="reasoning">
                      AI Model Reasoning
                    </label>

                    <select
                      id="reasoning"
                      className="DialogSelect"
                      value={reasoning}
                      onChange={(event) => setReasoning(event.target.value)}
                    >
                      {reasoningLevels.map((level) => (
                        <option key={level.levelId} value={level.levelId}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                    <p className="FieldDescription">
                      {selectedReasoning?.description}
                    </p>
                  </div>
                )}

                {supportsVerbosity && (
                  <div className="DialogField">
                    <label className="DialogLabel" htmlFor="verbosity">
                      AI Model Verbosity
                    </label>

                    <select
                      id="verbosity"
                      className="DialogSelect"
                      value={verbosity}
                      onChange={(event) => setVerbosity(event.target.value)}
                    >
                      {verbosityLevels.map((level) => (
                        <option key={level.levelId} value={level.levelId}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                    <p className="FieldDescription">
                      {selectedVerbosity?.description}
                    </p>
                  </div>
                )}
              </div>

              {/* AI Agents */}
              <div className="DialogCard">
                <div className="DialogCardTitle">Agent</div>

                <div className="DialogField">
                  <label className="DialogLabel" htmlFor="agent-category">
                    Agent Category
                  </label>

                  <select
                    id="agent-category"
                    className="DialogSelect"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="DialogField">
                  <label className="DialogLabel" htmlFor="agent">
                    Agent
                  </label>

                  <select
                    id="agent"
                    className="DialogSelect"
                    value={agent}
                    onChange={(event) => setAgent(event.target.value)}
                  >
                    {agents.map((agent) => (
                      <option key={agent.agentId} value={agent.agentId}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                  <p className="FieldDescription mb-0">
                    {selectedAgent?.description}
                  </p>
                </div>
              </div>
            </ScrollArea.Viewport>

            <ScrollArea.Scrollbar
              className="DialogScrollbar"
              orientation="vertical"
            >
              <ScrollArea.Thumb className="DialogScrollThumb" />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner className="DialogScrollCorner" />
          </ScrollArea.Root>

          <div className="DialogFooter">
            <Dialog.Close asChild>
              <button className="border border-primary rounded-md py-2 px-3 hover:border-primary-hover cursor-pointer">
                Close
              </button>
            </Dialog.Close>

            <button
              className="bg-primary text-white rounded-md py-2 px-3 hover:bg-primary-hover cursor-pointer"
              onClick={() => handleSave()}
            >
              Save
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
