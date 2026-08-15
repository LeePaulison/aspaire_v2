"use client";

import { StarFilledIcon, StarIcon, TrashIcon } from "@radix-ui/react-icons";

import { IconButton } from "@/components/ui/IconButton";
import { formatDate, formatFileSize } from "./resumeUtils";

const EXTRACTION_LABELS = {
  completed: "Text parsed",
  failed: "Text parsing failed",
  pending: "Text parsing pending",
};

const PARSED_TEXT_LABELS = {
  accepted: "Parsed text accepted",
  dismissed: "Parsed text dismissed",
  failed: "Parsed text failed",
  none: "No parsed text",
  ready: "Parsed text ready",
};

export function ResumeFilesList({
  busy,
  files,
  onDelete,
  onSetPrimarySource,
  readOnly = false,
}) {
  if (!files?.length) {
    return (
      <p className="rounded-md border border-border bg-surface p-4 text-sm text-foreground-muted">
        No uploaded original stored yet.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {files.map((file) => {
        const deleteLabel = readOnly
          ? "Restore resume to delete file"
          : "Delete uploaded original";

        return (
          <div
            key={file.fileId}
            className="flex flex-col justify-between gap-2 rounded-md border border-border bg-surface p-3 text-sm sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate font-medium">{file.originalFilename}</p>
                {file.isPrimarySource ? (
                  <span className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-foreground-muted">
                    Default source
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-foreground-muted">
                {formatFileSize(file.fileSize)} / Uploaded {formatDate(file.uploadedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-fit rounded-md border border-border px-2 py-1 text-xs capitalize text-foreground-muted">
                {EXTRACTION_LABELS[file.textExtractionStatus] ??
                  `Text parsing ${file.textExtractionStatus}`}
              </span>
              <span className="w-fit rounded-md border border-border px-2 py-1 text-xs text-foreground-muted">
                {PARSED_TEXT_LABELS[file.parsedTextStatus] ??
                  `Parsed text ${file.parsedTextStatus}`}
              </span>
              <IconButton
                label={
                  file.isPrimarySource
                    ? "Default uploaded source"
                    : "Set as default uploaded source"
                }
                onClick={() => onSetPrimarySource(file)}
                disabled={busy || readOnly || file.isPrimarySource}
              >
                {file.isPrimarySource ? <StarFilledIcon /> : <StarIcon />}
              </IconButton>
              <IconButton
                label={deleteLabel}
                onClick={() => onDelete(file)}
                disabled={busy || readOnly}
              >
                <TrashIcon />
              </IconButton>
            </div>
          </div>
        );
      })}
    </div>
  );
}
