"use client";

import { CheckIcon } from "@radix-ui/react-icons";

import { AppDialog } from "@/components/ui/AppDialog";

export function ParsedResumeTextDraftDialog({
  draft,
  open,
  busy,
  error,
  status,
  onAccept,
  onOpenChange,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    onAccept({
      resumeId: draft.resume.resumeId,
      resumeText: String(formData.get("resumeText") ?? ""),
    });
  }

  if (!draft) {
    return null;
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Review parsed resume draft"
      description={`Accepting this draft will replace the stored resume text for "${draft.resume.title}".`}
      size="large"
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {status ? <p className="text-sm text-foreground-muted">{status}</p> : null}
        <label className="grid gap-2 text-sm font-medium">
          <span>Parsed resume Markdown</span>
          <textarea
            name="resumeText"
            defaultValue={draft.resumeText}
            className="min-h-[32rem] rounded-md border border-border bg-surface-secondary px-3 py-2 font-mono text-sm leading-6 outline-none focus:border-ring"
            required
          />
        </label>
        <div className="flex justify-end border-t border-border pt-4">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckIcon />
            Accept and update resume text
          </button>
        </div>
      </form>
    </AppDialog>
  );
}
