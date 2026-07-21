import { MarkdownRenderer } from "../markdown/MarkdownRenderer";

export default function MessageBubble({
  role,
  content,
  attachments = [],
  status,
  isActive = false,
}) {
  const isUser = role === "user";
  const hasContent = typeof content === "string" && content.length > 0;
  const isThinking =
    !isUser && isActive && status === "generating" && !hasContent;
  const isResponding = !isUser && isActive && status === "responding";

  return (
    <div
      aria-live={!isUser && isActive ? "polite" : undefined}
      className={`message-bubble max-w-[90%] text-foreground rounded-lg px-4 py-3 ${
        isUser ? "ml-auto bg-message-user" : "mr-auto bg-message"
      }`}
    >
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <span
              key={`${attachment.name}-${attachment.size}-${index}`}
              className="max-w-64 truncate rounded-md bg-black/15 px-2 py-1 text-xs text-foreground-muted"
              title={attachment.name}
            >
              {attachment.name}
            </span>
          ))}
        </div>
      )}

      {hasContent && <MarkdownRenderer content={content} />}

      {isThinking && (
        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <span>Thinking…</span>
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
        </div>
      )}

      {isResponding && (
        <span
          className="mt-1 block size-1.5 animate-pulse rounded-full bg-emerald-500"
          aria-label="Response is streaming"
        />
      )}
    </div>
  );
}
