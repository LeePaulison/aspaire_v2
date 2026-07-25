import { formatDate, formatFileCount } from "./resumeUtils";

function resumeOriginalStatus(receipt) {
  if (!receipt.hadUploadedOriginal) {
    return "None stored";
  }

  if (!receipt.uploadedOriginalDeleted) {
    return "Storage cleanup incomplete";
  }

  return `${formatFileCount(receipt.uploadedOriginalCount)} deleted`;
}

export function ResumeDeletionReceipt({ receipt }) {
  if (!receipt) {
    return null;
  }

  return (
    <div className="mt-4 rounded-md border border-border bg-surface p-4 text-sm">
      <h2 className="font-semibold">Deletion receipt</h2>
      <p className="mt-2 text-foreground-muted">
        {receipt.title} was removed from the library.
      </p>
      <dl className="mt-3 grid gap-2 sm:grid-cols-3">
        <div>
          <dt className="text-foreground-muted">Record</dt>
          <dd>{receipt.recordDeleted ? "Deleted" : "Pending"}</dd>
        </div>
        <div>
          <dt className="text-foreground-muted">Stored text</dt>
          <dd>{receipt.contentDeleted ? "Deleted" : "Pending"}</dd>
        </div>
        <div>
          <dt className="text-foreground-muted">Uploaded original</dt>
          <dd>{resumeOriginalStatus(receipt)}</dd>
        </div>
        <div>
          <dt className="text-foreground-muted">File metadata</dt>
          <dd>{receipt.fileMetadataDeleted ? "Deleted" : "Pending"}</dd>
        </div>
      </dl>
    </div>
  );
}

export function FileDeletionReceipt({ receipt }) {
  if (!receipt) {
    return null;
  }

  return (
    <div className="mt-4 rounded-md border border-border bg-surface p-4 text-sm">
      <h2 className="font-semibold">File deletion receipt</h2>
      <p className="mt-2 text-foreground-muted">
        {receipt.filename} was removed from this resume.
      </p>
      <dl className="mt-3 grid gap-2 sm:grid-cols-3">
        <div>
          <dt className="text-foreground-muted">Uploaded original</dt>
          <dd>{receipt.uploadedOriginalDeleted ? "Deleted" : "Pending"}</dd>
        </div>
        <div>
          <dt className="text-foreground-muted">File metadata</dt>
          <dd>{receipt.fileMetadataDeleted ? "Deleted" : "Pending"}</dd>
        </div>
        <div>
          <dt className="text-foreground-muted">Deleted</dt>
          <dd>{formatDate(receipt.deletedAt)}</dd>
        </div>
      </dl>
    </div>
  );
}

export function ResumeParsingReceipt({ receipt }) {
  if (!receipt) {
    return null;
  }

  return (
    <div className="mb-5 rounded-md border border-border bg-surface p-4 text-sm">
      <h2 className="font-semibold">Upload parsing receipt</h2>
      <p className="mt-2 text-foreground-muted">{receipt.message}</p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-foreground-muted">Uploaded original</dt>
          <dd className="font-medium">{receipt.filename}</dd>
        </div>
        <div>
          <dt className="text-foreground-muted">Text parsing</dt>
          <dd className="font-medium">{receipt.parsingStatus}</dd>
        </div>
        <div>
          <dt className="text-foreground-muted">Stored resume text</dt>
          <dd className="font-medium">{receipt.textStatus}</dd>
        </div>
      </dl>
      {receipt.error ? (
        <p className="mt-3 rounded-md border border-border bg-surface-secondary p-3 text-xs text-foreground-muted">
          {receipt.error}
        </p>
      ) : null}
    </div>
  );
}
