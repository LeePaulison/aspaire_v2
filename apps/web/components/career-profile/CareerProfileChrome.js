"use client";

import {
  CheckIcon,
  Cross2Icon,
  FileTextIcon,
  Pencil1Icon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { ScrollArea } from "radix-ui";

import { IconButton } from "@/components/ui/IconButton";

import { Field, Input, Textarea } from "./CareerProfileFields";
import { contactLinksToText, normalizeContactInfo } from "./careerProfileUtils";

export function ProfileList({
  profiles,
  selectedId,
  busy,
  onDelete,
  onEdit,
  onSelect,
  onCreate,
}) {
  return (
    <aside className="min-w-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Career Profiles</h1>
          <p className="mt-2 text-sm text-foreground-muted">
            Keep distinct professional positioning variants.
          </p>
        </div>
        <IconButton label="New profile" onClick={onCreate} disabled={busy}>
          <PlusIcon />
        </IconButton>
      </div>
      <ScrollArea.Root className="ScrollAreaRoot h-[calc(100svh-12rem)]">
        <ScrollArea.Viewport className="ScrollAreaViewport">
          <div className="grid gap-2 pr-3">
            {profiles.map((item) => (
              <div
                key={item.profileId}
                className={`rounded-md border transition-colors ${
                  selectedId === item.profileId
                    ? "border-primary bg-surface-secondary"
                    : "border-border bg-surface hover:bg-surface-secondary"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(item.profileId)}
                  disabled={busy}
                  className="w-full p-3 text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold">
                        {item.name || "Untitled profile"}
                      </h2>
                      {item.focus ? (
                        <p className="mt-1 truncate text-xs text-foreground-muted">
                          {item.focus}
                        </p>
                      ) : null}
                    </div>
                    {item.isDefault ? (
                      <span className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-foreground-muted">
                        Default
                      </span>
                    ) : null}
                  </div>
                </button>
                <div className="flex justify-end gap-1 border-t border-border px-2 py-2">
                  <IconButton
                    label={`Edit ${item.name || "profile"}`}
                    onClick={() => onEdit(item)}
                    disabled={busy}
                  >
                    <Pencil1Icon />
                  </IconButton>
                  <IconButton
                    label={`Delete ${item.name || "profile"}`}
                    onClick={() => onDelete(item)}
                    disabled={busy}
                  >
                    <TrashIcon />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="ScrollAreaScrollbar"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="ScrollAreaThumb" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner className="ScrollAreaCorner" />
      </ScrollArea.Root>
    </aside>
  );
}

export function ProfileCreateForm({ busy, onSubmit, onCancel }) {
  return (
    <form
      className="grid gap-4 rounded-md border border-border bg-surface p-4"
      onSubmit={onSubmit}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Profile name">
          <Input name="name" placeholder="Software Developer" required />
        </Field>
        <Field label="Focus">
          <Input
            name="focus"
            placeholder="Backend engineering, platform, developer tools"
          />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input name="isDefault" type="checkbox" />
        Make default profile
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckIcon />
          Create profile
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

export function ProfileToolbar({
  profile,
  busy,
  canDelete,
  onDelete,
  onEdit,
  onGenerateResumeDraft,
  onSetDefault,
}) {
  return (
    <div
      role="toolbar"
      aria-label="Career profile actions"
      className="flex w-fit flex-wrap gap-1 rounded-md border border-border bg-surface p-1"
    >
      <IconButton label="Edit profile" onClick={onEdit} disabled={busy}>
        <Pencil1Icon />
      </IconButton>
      <IconButton
        label="Create resume draft"
        onClick={onGenerateResumeDraft}
        disabled={busy}
      >
        <FileTextIcon />
      </IconButton>
      {!profile.isDefault ? (
        <IconButton label="Set default profile" onClick={onSetDefault} disabled={busy}>
          <StarIcon />
        </IconButton>
      ) : null}
      <IconButton
        label="Delete profile"
        onClick={onDelete}
        disabled={busy || !canDelete}
      >
        <TrashIcon />
      </IconButton>
    </div>
  );
}

export function ProfileEditForm({ profile, busy, children, formRef, onSubmit }) {
  const contactInfo = normalizeContactInfo(profile.contactInfo);

  return (
    <form
      key={`profile-edit-${profile.profileId}`}
      ref={formRef}
      className="grid gap-4"
      onSubmit={onSubmit}
    >
      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Profile name">
            <Input
              name="name"
              defaultValue={profile.name}
              placeholder="Software Developer"
              required
            />
          </Field>
          <Field label="Focus">
            <Input
              name="focus"
              defaultValue={profile.focus}
              placeholder="Backend engineering, platform, developer tools"
            />
          </Field>
        </div>
        {!profile.isDefault ? (
          <label className="flex items-center gap-2 text-sm">
            <input name="isDefault" type="checkbox" />
            Make default profile
          </label>
        ) : null}
        <Field label="Headline">
          <Input
            name="headline"
            defaultValue={profile.headline}
            placeholder="Senior operations analyst targeting product roles"
          />
        </Field>
        <Field label="Professional summary">
          <Textarea
            name="summary"
            defaultValue={profile.summary}
            placeholder="A concise overview of your background, strengths, and direction."
          />
        </Field>
        <Field label="Career goals">
          <Textarea
            name="careerGoals"
            defaultValue={profile.careerGoals}
            placeholder="Roles, responsibilities, growth goals, or direction you want next."
          />
        </Field>
        <div className="grid gap-4 rounded-md border border-border bg-surface-secondary p-3">
          <h3 className="text-sm font-semibold">Contact and social links</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Email">
              <Input
                name="contactEmail"
                defaultValue={contactInfo.email}
                placeholder="name@example.com"
              />
            </Field>
            <Field label="Phone">
              <Input
                name="contactPhone"
                defaultValue={contactInfo.phone}
                placeholder="(555) 123-4567"
              />
            </Field>
            <Field label="Location">
              <Input
                name="contactLocation"
                defaultValue={contactInfo.location}
                placeholder="City, State"
              />
            </Field>
          </div>
          <Field label="Links">
            <Textarea
              name="contactLinks"
              defaultValue={contactLinksToText(contactInfo.links)}
              placeholder={"LinkedIn: https://linkedin.com/in/name\nGitHub: https://github.com/name\nCompany: https://example.com"}
            />
          </Field>
        </div>
        <Field label="Additional notes">
          <Textarea
            name="additionalNotes"
            defaultValue={profile.additionalNotes}
            placeholder="Resume-derived details, ambiguous evidence, or context that needs review."
          />
        </Field>
        {children ? (
          <div className="border-t border-border pt-2">{children}</div>
        ) : null}
      </div>
      <div className="flex justify-start">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckIcon />
          Save profile
        </button>
      </div>
    </form>
  );
}
