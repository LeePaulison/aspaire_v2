"use client";

import {
  ArchiveIcon,
  Pencil1Icon,
  RotateCounterClockwiseIcon,
  StarIcon,
  TrashIcon,
  UploadIcon,
} from "@radix-ui/react-icons";

import { IconButton } from "@/components/ui/IconButton";

export function ResumeToolbar({
  resume,
  busy,
  onArchive,
  onDelete,
  onEdit,
  onRestore,
  onSetPrimary,
  onUpload,
}) {
  const isArchived = resume.status === "archived";

  return (
    <div
      role="toolbar"
      aria-label="Resume actions"
      className="flex w-fit flex-wrap gap-1 rounded-md border border-border bg-surface p-1"
    >
      <IconButton
        label={isArchived ? "Restore resume to edit" : "Edit resume"}
        onClick={onEdit}
        disabled={busy || isArchived}
      >
        <Pencil1Icon />
      </IconButton>
      {!resume.isPrimary && !isArchived ? (
        <IconButton label="Set primary" onClick={onSetPrimary} disabled={busy}>
          <StarIcon />
        </IconButton>
      ) : null}
      <IconButton
        label={isArchived ? "Restore resume to upload" : "Upload original"}
        onClick={onUpload}
        disabled={busy || isArchived}
      >
        <UploadIcon />
      </IconButton>
      {isArchived ? (
        <IconButton label="Restore resume" onClick={onRestore} disabled={busy}>
          <RotateCounterClockwiseIcon />
        </IconButton>
      ) : (
        <IconButton label="Archive resume" onClick={onArchive} disabled={busy}>
          <ArchiveIcon />
        </IconButton>
      )}
      <IconButton label="Delete resume" onClick={onDelete} disabled={busy}>
        <TrashIcon />
      </IconButton>
    </div>
  );
}
