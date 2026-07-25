"use client";

import { TrashIcon } from "@radix-ui/react-icons";

import { IconButton } from "@/components/ui/IconButton";
import { formatDate, formatFileSize } from "./resumeUtils";

const EXTRACTION_LABELS = {
  completed: "Text parsed",
  failed: "Text parsing failed",
  pending: "Text parsing pending",
};

export function ResumeFilesList({ busy, files, onDelete, readOnly = false }) {
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
              <p className="truncate font-medium">{file.originalFilename}</p>
              <p className="mt-1 text-xs text-foreground-muted">
                {formatFileSize(file.fileSize)} / Uploaded {formatDate(file.uploadedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-fit rounded-md border border-border px-2 py-1 text-xs capitalize text-foreground-muted">
                {EXTRACTION_LABELS[file.textExtractionStatus] ??
                  `Text parsing ${file.textExtractionStatus}`}
              </span>
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
