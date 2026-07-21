"use client";

import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { PaperPlaneIcon, FilePlusIcon } from "@radix-ui/react-icons";

import { useChatPreferencesSelection } from "@/hooks/useChatPreferencesSelection";
import { serializeTextAttachments } from "@/lib/chat/textAttachments";

const MAX_ATTACHMENTS = 3;
const MAX_FILE_SIZE = 256 * 1024;
const MAX_TOTAL_SIZE = 512 * 1024;
const TEXT_FILE_EXTENSIONS = new Set([
  "bash", "c", "cpp", "cs", "css", "csv", "dart", "env", "go", "gql",
  "graphql", "h", "hpp", "html", "ini", "java", "js", "json", "jsonc",
  "jsx", "kt", "kts", "less", "log", "md", "mjs", "php", "properties",
  "ps1", "py", "rb", "rs", "sass", "scss", "sh", "sql", "svelte",
  "swift", "toml", "ts", "tsx", "tsv", "txt", "vue", "xml", "yaml",
  "yml", "zsh",
]);

const STATUS_DISPLAY = {
  connecting: {
    label: "Connecting…",
    light: "bg-amber-400 animate-pulse",
  },
  ready: { label: "Ready", light: "bg-emerald-600" },
  generating: {
    label: "Generating…",
    light: "bg-emerald-500 animate-pulse",
  },
  responding: {
    label: "Responding…",
    light: "bg-emerald-500 animate-pulse",
  },
  saved: { label: "Saved", light: "bg-emerald-600" },
  error: { label: "Connection error", light: "bg-red-500" },
  request_error: { label: "Request failed — ready to retry", light: "bg-red-500" },
};

export default function ChatComposer({ onSendMessage, status = "connecting" }) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [attachmentError, setAttachmentError] = useState("");
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const {
    models,
    categories,
    allAgents,
    model,
    agent,
    preferences,
    savingSelection,
    saveModelSelection,
    saveAgentSelection,
  } = useChatPreferencesSelection();

  const selectionDisabled = !preferences || savingSelection;
  const statusDisplay = STATUS_DISPLAY[status] ?? STATUS_DISPLAY.connecting;
  const sendDisabled =
    (!message.trim() && !attachments.length) ||
    status === "connecting" ||
    status === "error";

  const saveSelection = (saveSelectionValue) => (event) => {
    saveSelectionValue(event.target.value).catch((error) => {
      console.error("Failed to save chat preference", error);
    });
  };

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [message]);

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage && !attachments.length) {
      return;
    }

    const outgoingMessage =
      trimmedMessage || "Please review the attached file content.";

    const serializedMessage = serializeTextAttachments(outgoingMessage, attachments);

    const result = onSendMessage(serializedMessage);

    if (result?.error) {
      setAttachmentError(result.error);
      return;
    }

    setMessage("");
    setAttachments([]);
    setAttachmentError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const handleFilesSelected = async (event) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!selectedFiles.length) {
      return;
    }

    const availableSlots = MAX_ATTACHMENTS - attachments.length;

    if (availableSlots <= 0) {
      setAttachmentError(`You can attach up to ${MAX_ATTACHMENTS} files.`);
      return;
    }

    const currentSize = attachments.reduce(
      (total, attachment) => total + attachment.size,
      0,
    );
    let acceptedSize = currentSize;
    const acceptedFiles = [];
    let nextError =
      selectedFiles.length > availableSlots
        ? `Only the first ${availableSlots} selected file(s) were considered.`
        : "";

    for (const file of selectedFiles.slice(0, availableSlots)) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      const isTextFile =
        file.type.startsWith("text/") || TEXT_FILE_EXTENSIONS.has(extension);

      if (!isTextFile) {
        nextError = `${file.name} is not a supported text file.`;
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        nextError = `${file.name} exceeds the 256 KB file limit.`;
        continue;
      }

      if (acceptedSize + file.size > MAX_TOTAL_SIZE) {
        nextError = "Attachments exceed the 512 KB combined limit.";
        continue;
      }

      acceptedSize += file.size;
      acceptedFiles.push(file);
    }

    const nextAttachments = await Promise.all(
      acceptedFiles.map(async (file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type || "text/plain",
        size: file.size,
        content: await file.text(),
      })),
    );

    setAttachments((current) => [...current, ...nextAttachments]);
    setAttachmentError(nextError);
  };

  const removeAttachment = (attachmentId) => {
    setAttachments((current) =>
      current.filter((attachment) => attachment.id !== attachmentId),
    );
    setAttachmentError("");
  };

  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col w-full border-t border-border p-4 pt-2"
    >
      <div className="flex flex-wrap items-center gap-2 pb-2 mb-2 border-b border-border">
        <button
          type="button"
          className="flex items-center rounded-md p-2 text-foreground-muted hover:text-foreground"
          aria-label="Attach a file"
          onClick={() => fileInputRef.current?.click()}
          disabled={attachments.length >= MAX_ATTACHMENTS}
        >
          <FilePlusIcon />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="text/*,.json,.jsonc,.yaml,.yml,.xml,.js,.jsx,.ts,.tsx,.mjs,.css,.scss,.html,.md,.sql,.graphql,.gql,.csv,.tsv,.py,.rb,.php,.java,.kt,.go,.rs,.cs,.cpp,.c,.h,.sh,.bash,.zsh,.ps1,.toml,.ini,.env,.log"
          onChange={handleFilesSelected}
        />

        <select
          aria-label="Model"
          title="Model"
          value={model ?? ""}
          disabled={selectionDisabled}
          onChange={saveSelection(saveModelSelection)}
          className="ChatComposerSelect min-w-32"
        >
          {models.map((modelOption) => (
            <option key={modelOption.modelId} value={modelOption.modelId}>
              {modelOption.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Agent"
          title="Agent"
          value={agent ?? ""}
          disabled={selectionDisabled}
          onChange={saveSelection(saveAgentSelection)}
          className="ChatComposerSelect min-w-40"
        >
          {categories.map((categoryOption, index) => (
            <Fragment key={categoryOption}>
              <optgroup label={categoryOption}>
                {allAgents
                  .filter(
                    (agentOption) => agentOption.category === categoryOption,
                  )
                  .map((agentOption) => (
                    <option
                      key={agentOption.agentId}
                      value={agentOption.agentId}
                    >
                      {agentOption.name}
                    </option>
                  ))}
              </optgroup>
              {index < categories.length - 1 && (
                <option disabled>────────────</option>
              )}
            </Fragment>
          ))}
        </select>

        <button
          type="submit"
          disabled={sendDisabled}
          className="ml-auto flex items-center gap-3 rounded-md bg-send px-4 py-2 text-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
          <PaperPlaneIcon />
        </button>
      </div>
      {(attachments.length > 0 || attachmentError) && (
        <div className="flex flex-wrap items-center gap-2 pb-2">
          {attachments.map((attachment) => (
            <span
              key={attachment.id}
              className="flex max-w-56 items-center gap-2 rounded-md bg-mist-900 px-2 py-1 text-xs text-foreground"
            >
              <span className="truncate">{attachment.name}</span>
              <button
                type="button"
                className="text-foreground-muted hover:text-foreground"
                aria-label={`Remove ${attachment.name}`}
                onClick={() => removeAttachment(attachment.id)}
              >
                ×
              </button>
            </span>
          ))}
          {attachmentError && (
            <span className="text-xs text-red-400">{attachmentError}</span>
          )}
        </div>
      )}
      <div className="flex w-full gap-2 pt-2">
        <textarea
          ref={textareaRef}
          rows={3}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          className="min-h-22 max-h-72 flex-1 resize-none overflow-y-auto rounded-md border border-mist-700 bg-input px-4 py-2 text-slate-50 outline-none placeholder:text-input-placeholder"
        />
      </div>
      <div className="flex items-center justify-between pt-2 text-xs text-foreground-muted">
        <div
          className="flex items-center gap-2"
          role="status"
          aria-live="polite"
        >
          <span
            className={`size-2 rounded-full ${statusDisplay.light}`}
            aria-hidden="true"
          />
          <span>{statusDisplay.label}</span>
        </div>
        <span>Ctrl (CMD) + Enter to Send</span>
      </div>
    </form>
  );
}
