"use client";

import { CheckIcon } from "@radix-ui/react-icons";

import { AppDialog } from "@/components/ui/AppDialog";

import { Field, Input, Textarea } from "./CareerProfileFields";
import { getFormValue } from "./careerProfileUtils";

export function ResumeMarkdownDraftDialog({
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
      profileId: draft.profileId,
      title: getFormValue(formData, "title"),
      targetRole: getFormValue(formData, "targetRole"),
      notes: getFormValue(formData, "notes"),
      resumeText: getFormValue(formData, "resumeText"),
      status: getFormValue(formData, "status"),
      isPrimary: formData.get("isPrimary") === "on",
    });
  }

  if (!draft) {
    return null;
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Review resume Markdown draft"
      description="Accepting this draft will create a new Resume Library record."
      size="large"
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {status ? <p className="text-sm text-foreground-muted">{status}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Resume title">
            <Input name="title" defaultValue={draft.title} required />
          </Field>
          <Field label="Target role">
            <Input name="targetRole" defaultValue={draft.targetRole} />
          </Field>
          <Field label="Status">
            <select
              name="status"
              defaultValue={draft.status}
              className="rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm outline-none focus:border-ring"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 self-end text-sm">
            <input
              name="isPrimary"
              type="checkbox"
              defaultChecked={draft.isPrimary}
            />
            Primary resume
          </label>
        </div>
        <Field label="Notes">
          <Textarea name="notes" defaultValue={draft.notes} />
        </Field>
        <Field label="Resume Markdown">
          <textarea
            name="resumeText"
            defaultValue={draft.resumeText}
            className="min-h-[30rem] rounded-md border border-border bg-surface-secondary px-3 py-2 font-mono text-sm leading-6 outline-none focus:border-ring"
            required
          />
        </Field>
        <div className="flex justify-end border-t border-border pt-4">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckIcon />
            Accept and create resume
          </button>
        </div>
      </form>
    </AppDialog>
  );
}
