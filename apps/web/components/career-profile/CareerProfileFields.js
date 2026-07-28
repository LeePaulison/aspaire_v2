"use client";

import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";

import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { IconButton } from "@/components/ui/IconButton";

export function StatusLine({ status, error }) {
  if (error) {
    return <p className="text-sm text-red-300">{error}</p>;
  }

  if (status) {
    return <p className="text-sm text-foreground-muted">{status}</p>;
  }

  return null;
}

export function Field({ label, children, error }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs text-red-300">{error}</span> : null}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      className="rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm outline-none focus:border-ring"
      {...props}
    />
  );
}

export function DateInput({ name, defaultValue, ...props }) {
  const inputProps = {
    name,
    type: "date",
    className:
      "rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm outline-none focus:border-ring",
    ...props,
  };

  if (defaultValue !== undefined) {
    inputProps.defaultValue = normalizeDateValue(defaultValue ?? "");
  }

  return <input {...inputProps} />;
}

export function Textarea(props) {
  return (
    <textarea
      rows={4}
      className="max-h-60 min-h-24 resize-none overflow-auto rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm leading-6 outline-none focus:border-ring"
      {...props}
    />
  );
}

function normalizeDateValue(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmedValue = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  if (/^\d{4}-\d{2}$/.test(trimmedValue)) {
    return `${trimmedValue}-01`;
  }

  return "";
}

export function MarkdownPreview({ content, emptyText }) {
  if (!content?.trim()) {
    if (!emptyText) {
      return null;
    }

    return (
      <p className="rounded-md border border-border bg-surface p-4 text-sm text-foreground-muted">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="message-bubble rounded-lg border border-border bg-surface p-4 text-sm">
      <MarkdownRenderer content={content} />
    </div>
  );
}

export function Section({ title, action, children }) {
  return (
    <section className="border-t border-border py-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ListItem({ title, subtitle, detail, onEdit, onDelete, disabled }) {
  const hasActions = onEdit || onDelete;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold">{title || "Untitled"}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm text-foreground-muted">{subtitle}</p>
          ) : null}
        </div>
        {hasActions ? (
          <div className="flex shrink-0 gap-2">
            {onEdit ? (
              <IconButton label="Edit" onClick={onEdit} disabled={disabled}>
                <Pencil1Icon />
              </IconButton>
            ) : null}
            {onDelete ? (
              <IconButton label="Delete" onClick={onDelete} disabled={disabled}>
                <TrashIcon />
              </IconButton>
            ) : null}
          </div>
        ) : null}
      </div>
      {detail ? (
        <div className="mt-3">
          <MarkdownPreview content={detail} />
        </div>
      ) : null}
    </div>
  );
}
