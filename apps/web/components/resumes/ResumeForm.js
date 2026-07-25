"use client";

import { CheckIcon, Cross2Icon, UploadIcon } from "@radix-ui/react-icons";

import { IconButton } from "@/components/ui/IconButton";

function Field({ action, label, children }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      <span className="flex items-center justify-between gap-2">
        <span>{label}</span>
        {action}
      </span>
      {children}
    </label>
  );
}

function Input(props) {
  return (
    <input
      className="rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm outline-none focus:border-ring"
      {...props}
    />
  );
}

function Select(props) {
  return (
    <select
      className="rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm outline-none focus:border-ring"
      {...props}
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      className="min-h-28 rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm leading-6 outline-none focus:border-ring"
      {...props}
    />
  );
}

export function ResumeForm({ resume, busy, onSubmit, onCancel, onUpload }) {
  const isArchived = resume.status === "archived";
  const canUpload = Boolean(resume.resumeId) && !isArchived && onUpload;

  return (
    <form
      className="grid gap-4 rounded-md border border-border bg-surface p-4"
      onSubmit={onSubmit}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title">
          <Input
            name="title"
            defaultValue={resume.title}
            placeholder="Product manager resume"
            required
          />
        </Field>
        <Field label="Target role">
          <Input
            name="targetRole"
            defaultValue={resume.targetRole}
            placeholder="Senior Product Manager"
          />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={resume.status}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            {isArchived ? <option value="archived">Archived</option> : null}
          </Select>
        </Field>
        <label className="flex items-center gap-2 self-end text-sm">
          <input
            name="isPrimary"
            type="checkbox"
            defaultChecked={resume.isPrimary}
          />
          Primary resume
        </label>
      </div>
      <Field label="Notes">
        <Textarea
          name="notes"
          defaultValue={resume.notes}
          placeholder="Positioning notes, audience, or when to use this version."
        />
      </Field>
      <Field
        label="Resume text"
        action={
          canUpload ? (
            <IconButton label="Upload original" onClick={onUpload} disabled={busy}>
              <UploadIcon />
            </IconButton>
          ) : null
        }
      >
        <Textarea
          name="resumeText"
          defaultValue={resume.resumeText}
          className="min-h-80 rounded-md border border-border bg-surface-secondary px-3 py-2 font-mono text-sm leading-6 outline-none focus:border-ring"
          placeholder="Paste the full resume text here."
        />
      </Field>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckIcon />
          Save resume
        </button>
        {onCancel ? (
          <IconButton label="Cancel" onClick={onCancel} disabled={busy}>
            <Cross2Icon />
          </IconButton>
        ) : null}
      </div>
    </form>
  );
}
