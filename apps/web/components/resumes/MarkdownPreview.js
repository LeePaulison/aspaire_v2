import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";

export function MarkdownPreview({ content, emptyText }) {
  if (!content?.trim()) {
    return (
      <p className="rounded-md border border-border bg-surface p-4 text-sm text-foreground-muted">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="message-bubble rounded-md border border-border bg-surface p-4 text-sm">
      <MarkdownRenderer content={content} />
    </div>
  );
}
