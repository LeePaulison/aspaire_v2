"use client";

import { useMemo, useState } from "react";
import {
  ArchiveIcon,
  CheckIcon,
  Cross2Icon,
  FileTextIcon,
  Pencil1Icon,
  PlusIcon,
  RotateCounterClockwiseIcon,
  StarFilledIcon,
  StarIcon,
  TrashIcon,
  UploadIcon,
} from "@radix-ui/react-icons";
import { ScrollArea } from "radix-ui";

import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { AppDialog } from "@/components/ui/AppDialog";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { IconButton } from "@/components/ui/IconButton";
import {
  archiveResume,
  createResume,
  deleteResume,
  deleteResumeFile,
  restoreResume,
  setPrimaryResume,
  updateResume,
  uploadResumeOriginal,
} from "@/graphql/resume/resume";

const emptyResume = {
  title: "",
  targetRole: "",
  notes: "",
  resumeText: "",
  status: "draft",
  isPrimary: false,
};

function getFormValue(formData, key) {
  return String(formData.get(key) ?? "");
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatFileCount(count) {
  return `${count} ${count === 1 ? "file" : "files"}`;
}

function StatusLine({ status, error }) {
  if (error) {
    return <p className="text-sm text-red-300">{error}</p>;
  }

  if (status) {
    return <p className="text-sm text-foreground-muted">{status}</p>;
  }

  return null;
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      <span>{label}</span>
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

function MarkdownPreview({ content, emptyText }) {
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

function ResumeForm({ resume, busy, onSubmit, onCancel }) {
  const isArchived = resume.status === "archived";

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
      <Field label="Resume text">
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

function ResumeFileUpload({ resume, busy, onUpload }) {
  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return;
    }

    const uploaded = await onUpload(resume.resumeId, file);

    if (uploaded) {
      form.reset();
    }
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={handleSubmit}
    >
      <label className="grid gap-2 text-sm font-medium">
        <span>Original resume file</span>
        <input
          name="file"
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          disabled={busy}
          className="min-w-0 flex-1 rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-surface file:px-3 file:py-1 file:text-sm file:text-foreground hover:file:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>
      <p className="text-xs leading-5 text-foreground-muted">
        Accepted formats: PDF, DOCX, or TXT. Text extraction will follow in a later slice.
      </p>
      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UploadIcon />
          Upload
        </button>
      </div>
    </form>
  );
}

function ResumeFilesList({ busy, files, onDelete, readOnly = false }) {
  if (!files?.length) {
    return (
      <p className="rounded-md border border-border bg-surface p-4 text-sm text-foreground-muted">
        No uploaded original stored yet.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {files.map((file) => (
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
              Extraction {file.textExtractionStatus}
            </span>
            <IconButton
              label={
                readOnly
                  ? "Restore resume to delete file"
                  : "Delete uploaded original"
              }
              onClick={() => onDelete(file)}
              disabled={busy || readOnly}
            >
              <TrashIcon />
            </IconButton>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResumeToolbar({
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

export function ResumeLibraryClient({ initialResumes }) {
  const [resumes, setResumes] = useState(initialResumes);
  const [selectedId, setSelectedId] = useState(initialResumes[0]?.resumeId ?? null);
  const [editingResume, setEditingResume] = useState(null);
  const [creating, setCreating] = useState(initialResumes.length === 0);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [deletionReceipt, setDeletionReceipt] = useState(null);
  const [pendingDeletion, setPendingDeletion] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [pendingFileDeletion, setPendingFileDeletion] = useState(null);
  const [fileDeleteError, setFileDeleteError] = useState("");
  const [fileDeletionReceipt, setFileDeletionReceipt] = useState(null);
  const [uploadResume, setUploadResume] = useState(null);

  const selectedResume = useMemo(
    () => resumes.find((resume) => resume.resumeId === selectedId) ?? null,
    [resumes, selectedId],
  );

  async function runAction(action, successMessage) {
    setBusy(true);
    setError("");
    setStatus("");
    setDeletionReceipt(null);
    setFileDeletionReceipt(null);

    try {
      const result = await action();
      setStatus(successMessage);
      return result;
    } catch (actionError) {
      setError(actionError.message || "Resume update failed");
      return null;
    } finally {
      setBusy(false);
    }
  }

  function replaceResume(updatedResume) {
    if (!updatedResume) {
      return;
    }

    setResumes((current) => {
      const withoutUpdated = current.filter(
        (resume) => resume.resumeId !== updatedResume.resumeId,
      );
      const normalized = updatedResume.isPrimary
        ? withoutUpdated.map((resume) => ({ ...resume, isPrimary: false }))
        : withoutUpdated;

      return [updatedResume, ...normalized].sort((left, right) => {
        if (left.isPrimary !== right.isPrimary) {
          return left.isPrimary ? -1 : 1;
        }

        return new Date(right.updatedAt) - new Date(left.updatedAt);
      });
    });
    setSelectedId(updatedResume.resumeId);
  }

  async function handleCreateSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const createdResume = await runAction(
      () =>
        createResume({
          title: getFormValue(formData, "title"),
          targetRole: getFormValue(formData, "targetRole"),
          notes: getFormValue(formData, "notes"),
          resumeText: getFormValue(formData, "resumeText"),
          status: getFormValue(formData, "status"),
          isPrimary: formData.get("isPrimary") === "on",
        }),
      "Resume created.",
    );

    if (createdResume) {
      replaceResume(createdResume);
      setCreating(false);
    }
  }

  async function handleUpdateSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updatedResume = await runAction(
      () =>
        updateResume(editingResume.resumeId, {
          title: getFormValue(formData, "title"),
          targetRole: getFormValue(formData, "targetRole"),
          notes: getFormValue(formData, "notes"),
          resumeText: getFormValue(formData, "resumeText"),
          status: getFormValue(formData, "status"),
          isPrimary: formData.get("isPrimary") === "on",
        }),
      "Resume saved.",
    );

    if (updatedResume) {
      replaceResume(updatedResume);
      setEditingResume(null);
    }
  }

  async function handleSetPrimary(resumeId) {
    const updatedResume = await runAction(
      () => setPrimaryResume(resumeId),
      "Primary resume updated.",
    );
    replaceResume(updatedResume);
  }

  async function handleArchive(resumeId) {
    const updatedResume = await runAction(
      () => archiveResume(resumeId),
      "Resume archived.",
    );
    replaceResume(updatedResume);
    setEditingResume(null);
  }

  async function handleRestore(resumeId) {
    const updatedResume = await runAction(
      () => restoreResume(resumeId),
      "Resume restored.",
    );
    replaceResume(updatedResume);
  }

  async function handleUpload(resumeId, file) {
    const updatedResume = await runAction(
      () => uploadResumeOriginal(resumeId, file),
      "Resume original uploaded.",
    );
    replaceResume(updatedResume);
    if (updatedResume) {
      setUploadResume(null);
    }
    return updatedResume;
  }

  async function handleDelete(resumeId) {
    if (busy) {
      return;
    }

    const receipt = await runAction(
      () => deleteResume(resumeId),
      "Resume deleted.",
    );

    if (receipt) {
      setResumes((current) =>
        current.filter((resume) => resume.resumeId !== resumeId),
      );
      setSelectedId((currentId) => {
        if (currentId !== resumeId) {
          return currentId;
        }

        return resumes.find((resume) => resume.resumeId !== resumeId)?.resumeId ?? null;
      });
      setEditingResume(null);
      setPendingDeletion(null);
      setDeleteError("");
      setDeletionReceipt(receipt);
      return true;
    }

    return false;
  }

  async function handleDeleteFile(resumeId, fileId) {
    const file = pendingFileDeletion?.file;
    const updatedResume = await runAction(
      () => deleteResumeFile(resumeId, fileId),
      "Uploaded original deleted.",
    );

    if (updatedResume) {
      replaceResume(updatedResume);
      setPendingFileDeletion(null);
      setFileDeleteError("");
      setFileDeletionReceipt({
        filename: file?.originalFilename || "Uploaded original",
        deletedAt: new Date().toISOString(),
        uploadedOriginalDeleted: true,
        fileMetadataDeleted: true,
      });
      return true;
    }

    return false;
  }

  function requestDeletion(resume) {
    setPendingDeletion(resume);
    setDeleteError("");
  }

  function requestFileDeletion(resume, file) {
    setPendingFileDeletion({ resume, file });
    setFileDeleteError("");
  }

  function handleDeleteDialogChange(open) {
    if (!open && !busy) {
      setPendingDeletion(null);
      setDeleteError("");
    }
  }

  function handleUploadDialogChange(open) {
    if (!open && !busy) {
      setUploadResume(null);
    }
  }

  function handleFileDeleteDialogChange(open) {
    if (!open && !busy) {
      setPendingFileDeletion(null);
      setFileDeleteError("");
    }
  }

  async function confirmDeletion() {
    if (!pendingDeletion || busy) {
      return;
    }

    setDeleteError("");

    const deleted = await handleDelete(pendingDeletion.resumeId);

    if (!deleted) {
      setDeleteError("The resume could not be deleted. Please try again.");
    }
  }

  async function confirmFileDeletion() {
    if (!pendingFileDeletion || busy) {
      return;
    }

    setFileDeleteError("");

    const deleted = await handleDeleteFile(
      pendingFileDeletion.resume.resumeId,
      pendingFileDeletion.file.fileId,
    );

    if (!deleted) {
      setFileDeleteError("The uploaded original could not be deleted. Please try again.");
    }
  }

  return (
    <ScrollArea.Root className="ScrollAreaRoot">
      <ScrollArea.Viewport className="ScrollAreaViewport">
        <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[22rem_1fr]">
          <aside className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold">Resume Library</h1>
                <p className="mt-2 text-sm text-foreground-muted">
                  Store text-first resume versions for future analysis.
                </p>
              </div>
              <IconButton
                label="Add resume"
                onClick={() => {
                  setCreating(true);
                  setEditingResume(null);
                }}
                disabled={busy}
              >
                <PlusIcon />
              </IconButton>
            </div>

            <div className="grid gap-2">
              {resumes.map((resume) => (
                <button
                  key={resume.resumeId}
                  type="button"
                  onClick={() => {
                    setSelectedId(resume.resumeId);
                    setCreating(false);
                    setEditingResume(null);
                  }}
                  className={`w-full rounded-md border p-3 text-left transition-colors ${
                    selectedId === resume.resumeId
                      ? "border-primary bg-surface-secondary"
                      : "border-border bg-surface hover:bg-surface-secondary"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileTextIcon className="shrink-0" />
                        <h2 className="truncate text-sm font-semibold">
                          {resume.title}
                        </h2>
                      </div>
                      {resume.targetRole ? (
                        <p className="mt-1 truncate text-xs text-foreground-muted">
                          {resume.targetRole}
                        </p>
                      ) : null}
                    </div>
                    {resume.isPrimary ? (
                      <StarFilledIcon className="shrink-0 text-primary" />
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-foreground-muted">
                    <span className="capitalize">{resume.status}</span>
                    <span aria-hidden="true">/</span>
                    <span>{formatDate(resume.updatedAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="min-w-0">
            <StatusLine status={status} error={error} />

            {deletionReceipt ? (
              <div className="mt-4 rounded-md border border-border bg-surface p-4 text-sm">
                <h2 className="font-semibold">Deletion receipt</h2>
                <p className="mt-2 text-foreground-muted">
                  {deletionReceipt.title} was removed from the library.
                </p>
                <dl className="mt-3 grid gap-2 sm:grid-cols-3">
                  <div>
                    <dt className="text-foreground-muted">Record</dt>
                    <dd>{deletionReceipt.recordDeleted ? "Deleted" : "Pending"}</dd>
                  </div>
                  <div>
                    <dt className="text-foreground-muted">Stored text</dt>
                    <dd>{deletionReceipt.contentDeleted ? "Deleted" : "Pending"}</dd>
                  </div>
                  <div>
                    <dt className="text-foreground-muted">Uploaded original</dt>
                    <dd>
                      {!deletionReceipt.hadUploadedOriginal
                        ? "None stored"
                        : deletionReceipt.uploadedOriginalDeleted
                          ? `${formatFileCount(
                              deletionReceipt.uploadedOriginalCount,
                            )} deleted`
                          : "Storage cleanup incomplete"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-foreground-muted">File metadata</dt>
                    <dd>
                      {deletionReceipt.fileMetadataDeleted ? "Deleted" : "Pending"}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : null}

            {fileDeletionReceipt ? (
              <div className="mt-4 rounded-md border border-border bg-surface p-4 text-sm">
                <h2 className="font-semibold">File deletion receipt</h2>
                <p className="mt-2 text-foreground-muted">
                  {fileDeletionReceipt.filename} was removed from this resume.
                </p>
                <dl className="mt-3 grid gap-2 sm:grid-cols-3">
                  <div>
                    <dt className="text-foreground-muted">Uploaded original</dt>
                    <dd>
                      {fileDeletionReceipt.uploadedOriginalDeleted
                        ? "Deleted"
                        : "Pending"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-foreground-muted">File metadata</dt>
                    <dd>
                      {fileDeletionReceipt.fileMetadataDeleted
                        ? "Deleted"
                        : "Pending"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-foreground-muted">Deleted</dt>
                    <dd>{formatDate(fileDeletionReceipt.deletedAt)}</dd>
                  </div>
                </dl>
              </div>
            ) : null}

            {creating ? (
              <div className="mt-4">
                <h2 className="mb-4 text-xl font-semibold">Add Resume</h2>
                <ResumeForm
                  resume={emptyResume}
                  busy={busy}
                  onSubmit={handleCreateSubmit}
                  onCancel={() => setCreating(false)}
                />
              </div>
            ) : null}

            {!creating && selectedResume ? (
              <div className="mt-4 grid gap-5">
                <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-semibold">
                        {selectedResume.title}
                      </h2>
                      {selectedResume.isPrimary ? (
                        <span className="rounded-md border border-border px-2 py-1 text-xs text-foreground-muted">
                          Primary
                        </span>
                      ) : null}
                      <span className="rounded-md border border-border px-2 py-1 text-xs capitalize text-foreground-muted">
                        {selectedResume.status}
                      </span>
                    </div>
                    {selectedResume.targetRole ? (
                      <p className="mt-2 text-sm text-foreground-muted">
                        {selectedResume.targetRole}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-foreground-muted">
                      Updated {formatDate(selectedResume.updatedAt)}
                    </p>
                  </div>
                  <ResumeToolbar
                    resume={selectedResume}
                    busy={busy}
                    onEdit={() => setEditingResume(selectedResume)}
                    onSetPrimary={() => handleSetPrimary(selectedResume.resumeId)}
                    onUpload={() => setUploadResume(selectedResume)}
                    onArchive={() => handleArchive(selectedResume.resumeId)}
                    onRestore={() => handleRestore(selectedResume.resumeId)}
                    onDelete={() => requestDeletion(selectedResume)}
                  />
                </div>

                {editingResume ? (
                  <ResumeForm
                    resume={editingResume}
                    busy={busy}
                    onSubmit={handleUpdateSubmit}
                    onCancel={() => setEditingResume(null)}
                  />
                ) : (
                  <>
                    <div>
                      <h3 className="mb-2 text-sm font-semibold">
                        Uploaded Originals
                      </h3>
                      <ResumeFilesList
                        busy={busy}
                        files={selectedResume.files}
                        readOnly={selectedResume.status === "archived"}
                        onDelete={(file) => requestFileDeletion(selectedResume, file)}
                      />
                    </div>
                    {selectedResume.notes ? (
                      <div>
                        <h3 className="mb-2 text-sm font-semibold">Notes</h3>
                        <MarkdownPreview
                          content={selectedResume.notes}
                          emptyText="No notes yet."
                        />
                      </div>
                    ) : null}
                    <div>
                      <h3 className="mb-2 text-sm font-semibold">Resume Text</h3>
                      <MarkdownPreview
                        content={selectedResume.resumeText}
                        emptyText="No resume text yet."
                      />
                    </div>
                  </>
                )}
              </div>
            ) : null}

            {!creating && !selectedResume ? (
              <div className="mt-12 max-w-xl">
                <h2 className="text-2xl font-semibold">No resumes yet</h2>
                <p className="mt-3 text-sm leading-6 text-foreground-muted">
                  Add a resume to start building the profile-resume-job loop for
                  the MVP.
                </p>
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  disabled={busy}
                  className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <PlusIcon />
                  Add resume
                </button>
              </div>
            ) : null}
          </section>
        </main>
        <ConfirmationDialog
          open={Boolean(pendingDeletion)}
          onOpenChange={handleDeleteDialogChange}
          title="Delete resume?"
          description={`“${pendingDeletion?.title || "Untitled resume"}” will be removed from your Resume Library. Stored text, file metadata, and uploaded originals will be deleted where available.`}
          error={deleteError}
          loading={busy}
          confirmLabel="Delete"
          loadingLabel="Deleting..."
          variant="destructive"
          onConfirm={confirmDeletion}
        />
        <ConfirmationDialog
          open={Boolean(pendingFileDeletion)}
          onOpenChange={handleFileDeleteDialogChange}
          title="Delete uploaded original?"
          description={`“${pendingFileDeletion?.file.originalFilename || "This file"}” will be removed from private resume storage and detached from this resume.`}
          error={fileDeleteError}
          loading={busy}
          confirmLabel="Delete"
          loadingLabel="Deleting..."
          variant="destructive"
          onConfirm={confirmFileDeletion}
        />
        <AppDialog
          open={Boolean(uploadResume)}
          onOpenChange={handleUploadDialogChange}
          title="Upload resume original"
          description={`Attach a source file to “${uploadResume?.title || "this resume"}”.`}
        >
          {uploadResume ? (
            <ResumeFileUpload
              resume={uploadResume}
              busy={busy}
              onUpload={handleUpload}
            />
          ) : null}
        </AppDialog>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        className="ScrollAreaScrollbar"
        orientation="vertical"
      >
        <ScrollArea.Thumb className="ScrollAreaThumb" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner className="ScrollAreaCorner" />
    </ScrollArea.Root>
  );
}
