"use client";

import { useMemo, useRef, useState } from "react";
import {
  FileTextIcon,
  PlusIcon,
  StarFilledIcon,
} from "@radix-ui/react-icons";
import { ScrollArea } from "radix-ui";

import { AppDialog } from "@/components/ui/AppDialog";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { IconButton } from "@/components/ui/IconButton";
import {
  createCareerProfileFromDraft,
} from "@/graphql/careerProfile/careerProfile";
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
import { useChatSocket } from "@/hooks/useChatSocket";
import { parseResumeToCareerProfileDraft } from "@/lib/resumes/resumeCareerProfileParser";
import {
  createReviewableCareerProfileDraft,
  parseCareerProfileDraftResponse,
} from "@/lib/resumes/careerProfileDraftReview";

import { CareerProfileDraftDialog } from "./CareerProfileDraftDialog";
import { MarkdownPreview } from "./MarkdownPreview";
import { ResumeFileUpload } from "./ResumeFileUpload";
import { ResumeFilesList } from "./ResumeFilesList";
import { ResumeForm } from "./ResumeForm";
import {
  FileDeletionReceipt,
  ResumeDeletionReceipt,
  ResumeParsingReceipt,
} from "./ResumeReceipts";
import { ResumeToolbar } from "./ResumeToolbar";
import { emptyResume, formatDate, getFormValue } from "./resumeUtils";

function StatusLine({ status, error }) {
  if (error) {
    return <p className="text-sm text-red-300">{error}</p>;
  }

  if (status) {
    return <p className="text-sm text-foreground-muted">{status}</p>;
  }

  return null;
}

function ResumeList({ resumes, selectedId, onSelect }) {
  return (
    <div className="grid gap-2">
      {resumes.map((resume) => (
        <button
          key={resume.resumeId}
          type="button"
          onClick={() => onSelect(resume.resumeId)}
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
                <h2 className="truncate text-sm font-semibold">{resume.title}</h2>
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
  );
}

function EmptyState({ busy, onCreate }) {
  return (
    <div className="mt-12 max-w-xl">
      <h2 className="text-2xl font-semibold">No resumes yet</h2>
      <p className="mt-3 text-sm leading-6 text-foreground-muted">
        Add a resume to start building the profile-resume-job loop for the MVP.
      </p>
      <button
        type="button"
        onClick={onCreate}
        disabled={busy}
        className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        <PlusIcon />
        Add resume
      </button>
    </div>
  );
}

function getResumeInputFromForm(formData) {
  return {
    title: getFormValue(formData, "title"),
    targetRole: getFormValue(formData, "targetRole"),
    notes: getFormValue(formData, "notes"),
    resumeText: getFormValue(formData, "resumeText"),
    status: getFormValue(formData, "status"),
    isPrimary: formData.get("isPrimary") === "on",
  };
}

function sortResumes(resumesToSort) {
  return [...resumesToSort].sort((left, right) => {
    if (left.isPrimary && !right.isPrimary) {
      return -1;
    }

    if (!left.isPrimary && right.isPrimary) {
      return 1;
    }

    return new Date(right.updatedAt) - new Date(left.updatedAt);
  });
}

function getLatestFile(resume) {
  return resume?.files?.[0] ?? null;
}

function buildParsingReceipt(previousResume, updatedResume, parsing) {
  const latestFile = getLatestFile(updatedResume);

  if (!latestFile) {
    return null;
  }

  const hadStoredText = Boolean(previousResume?.resumeText?.trim());
  const previousText = previousResume?.resumeText ?? "";
  const updatedText = updatedResume.resumeText ?? "";
  const textChanged = previousText !== updatedText;
  const parsingStatus = parsing?.status ?? latestFile.textExtractionStatus;
  const parsingCompleted = parsingStatus === "completed";
  const parsingFailed = parsingStatus === "failed";
  let message = "The original file was uploaded.";
  let textStatus = "Unchanged";

  if (parsingCompleted && (parsing?.textApplied || textChanged)) {
    message = "Text was parsed from the upload and added to this resume.";
    textStatus = "Updated from upload";
  } else if (parsingCompleted && hadStoredText) {
    message =
      "Text was parsed from the upload, but your existing manual resume text was preserved.";
    textStatus = "Manual text preserved";
  } else if (parsingCompleted) {
    message =
      "Text parsing completed, but no new stored resume text was needed.";
    textStatus = "Unchanged";
  } else if (parsingFailed) {
    message =
      "The original file was uploaded, but text parsing did not produce resume text.";
    textStatus = "Unchanged";
  }

  return {
    filename: parsing?.filename ?? latestFile.originalFilename,
    parsingStatus: parsingCompleted ? "Completed" : "Failed",
    textStatus,
    message,
    error: parsingFailed ? parsing?.error : "",
  };
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
  const [parsingReceipt, setParsingReceipt] = useState(null);
  const [uploadResumeId, setUploadResumeId] = useState(null);
  const [profileDraft, setProfileDraft] = useState(null);
  const [profileDraftOpen, setProfileDraftOpen] = useState(false);
  const parserResponseRef = useRef("");
  const parserResumeRef = useRef(null);
  const parserRequestInFlightRef = useRef(false);

  const selectedResume = useMemo(
    () => resumes.find((resume) => resume.resumeId === selectedId) ?? null,
    [resumes, selectedId],
  );
  const uploadResume = useMemo(
    () => resumes.find((resume) => resume.resumeId === uploadResumeId) ?? null,
    [resumes, uploadResumeId],
  );
  const { connected: parserConnected, send: sendParserMessage } = useChatSocket({
    onChatChunk: (payload) => {
      if (parserRequestInFlightRef.current) {
        parserResponseRef.current += payload?.content ?? "";
      }
    },
    onChatComplete: () => {
      if (!parserRequestInFlightRef.current) {
        return;
      }

      const resume = parserResumeRef.current;
      const responseText = parserResponseRef.current;

      try {
        const draft = parseCareerProfileDraftResponse(responseText, resume);
        setProfileDraft(draft);
        setProfileDraftOpen(true);
        setStatus("Career profile draft ready for review.");
      } catch {
        const fallbackDraft = createReviewableCareerProfileDraft(
          parseResumeToCareerProfileDraft(resume),
          resume,
        );
        setProfileDraft(fallbackDraft);
        setProfileDraftOpen(true);
        setStatus(
          "Career profile draft ready for review. Local parsing was used because the AI response could not be read.",
        );
      } finally {
        parserRequestInFlightRef.current = false;
        parserResponseRef.current = "";
        parserResumeRef.current = null;
        setBusy(false);
      }
    },
    onChatError: (chatError) => {
      if (!parserRequestInFlightRef.current) {
        return;
      }

      parserRequestInFlightRef.current = false;
      parserResponseRef.current = "";
      parserResumeRef.current = null;
      setBusy(false);
      setError(chatError.message || "Career profile draft generation failed.");
    },
    onError: (socketError) => {
      if (!parserRequestInFlightRef.current) {
        return;
      }

      parserRequestInFlightRef.current = false;
      parserResponseRef.current = "";
      parserResumeRef.current = null;
      setBusy(false);
      setError(socketError.message || "Career profile draft connection failed.");
    },
  });

  async function runAction(action, successMessage) {
    setBusy(true);
    setError("");
    setStatus("");
    setDeletionReceipt(null);
    setFileDeletionReceipt(null);
    setParsingReceipt(null);

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

  function selectResume(resumeId) {
    setSelectedId(resumeId);
    setCreating(false);
    setEditingResume(null);
  }

  function replaceResume(updatedResume) {
    if (!updatedResume) {
      return;
    }

    setResumes((current) => {
      let nextResumes = current.filter(
        (resume) => resume.resumeId !== updatedResume.resumeId,
      );

      if (updatedResume.isPrimary) {
        nextResumes = nextResumes.map((resume) => ({
          ...resume,
          isPrimary: false,
        }));
      }

      nextResumes.unshift(updatedResume);
      return sortResumes(nextResumes);
    });
    setSelectedId(updatedResume.resumeId);
  }

  function beginCreate() {
    setCreating(true);
    setEditingResume(null);
  }

  async function handleCreateSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const input = getResumeInputFromForm(formData);
    const createdResume = await runAction(
      () => createResume(input),
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
    const input = getResumeInputFromForm(formData);
    const updatedResume = await runAction(
      () => updateResume(editingResume.resumeId, input),
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

  function handleGenerateProfileDraft(resume) {
    if (busy || parserRequestInFlightRef.current) {
      return;
    }

    if (!resume.resumeText?.trim()) {
      setError("Add resume text before generating a Career Profile draft.");
      setStatus("");
      return;
    }

    setBusy(true);
    setError("");
    setStatus("Generating Career Profile draft...");
    setDeletionReceipt(null);
    setFileDeletionReceipt(null);
    setParsingReceipt(null);
    parserResponseRef.current = "";
    parserResumeRef.current = resume;
    parserRequestInFlightRef.current = true;

    const sent = sendParserMessage({
      type: "chat_message",
      payload: {
        content: [
          "Extract a reviewed Career Profile draft from this resume text.",
          `Resume title: ${resume.title}`,
          resume.targetRole ? `Target role: ${resume.targetRole}` : "",
          "Return only the structured JSON draft.",
          "",
          resume.resumeText,
        ]
          .filter(Boolean)
          .join("\n"),
        conversationId: null,
        agentId: "resume-parser",
        domain: "career_evidence",
        workflowType: "resume_to_career_profile_draft",
      },
    });

    if (!sent) {
      parserRequestInFlightRef.current = false;
      parserResumeRef.current = null;
      setBusy(false);
      setError(
        parserConnected
          ? "Career profile draft request could not be sent."
          : "Career profile draft service is not connected yet.",
      );
      setStatus("");
    }
  }

  async function handleAcceptProfileDraft(draft = profileDraft) {
    if (!draft || busy) {
      return;
    }

    setBusy(true);
    setError("");
    setStatus("");

    try {
      const preferences = {
        targetRoles: draft.preferences.targetRoles,
        targetIndustries: draft.preferences.targetIndustries,
        locations: draft.preferences.locations,
        workModes: draft.preferences.workModes,
        compensationGoals: draft.preferences.compensationGoals,
        constraints: draft.preferences.constraints,
      };
      const savedProfile = await createCareerProfileFromDraft({
        name: draft.name,
        focus: draft.focus,
        isDefault: draft.isDefault,
        headline: draft.headline,
        summary: draft.summary,
        careerGoals: draft.careerGoals,
        additionalNotes: draft.additionalNotes,
        experience: draft.experience.map(({ experienceId, ...item }) => item),
        education: draft.education.map(({ educationId, ...item }) => item),
        skills: draft.skills.map(({ skillId, ...item }) => item),
        projects: draft.projects.map(({ projectId, ...item }) => item),
        certifications: draft.certifications.map(
          ({ certificationId, ...item }) => item,
        ),
        preferences,
      });

      setProfileDraft(null);
      setProfileDraftOpen(false);
      setStatus(`Career Profile "${savedProfile.name}" created.`);
    } catch (acceptError) {
      setError(acceptError.message || "Career profile draft acceptance failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload(resumeId, file) {
    const previousResume =
      resumes.find((resume) => resume.resumeId === resumeId) ?? null;
    const uploadResult = await runAction(
      () => uploadResumeOriginal(resumeId, file),
      "Resume original uploaded.",
    );
    const updatedResume = uploadResult?.resume ?? null;
    replaceResume(updatedResume);
    if (updatedResume) {
      setEditingResume((current) =>
        current?.resumeId === updatedResume.resumeId ? updatedResume : current,
      );
      setParsingReceipt(
        buildParsingReceipt(previousResume, updatedResume, uploadResult?.parsing),
      );
      setUploadResumeId(null);
    }
    return updatedResume;
  }

  async function handleDelete(resumeId) {
    if (busy) {
      return false;
    }

    const receipt = await runAction(
      () => deleteResume(resumeId),
      "Resume deleted.",
    );

    if (!receipt) {
      return false;
    }

    const remainingResumes = resumes.filter(
      (resume) => resume.resumeId !== resumeId,
    );

    setResumes(remainingResumes);

    if (selectedId === resumeId) {
      setSelectedId(remainingResumes[0]?.resumeId ?? null);
    }

    setEditingResume(null);
    setPendingDeletion(null);
    setDeleteError("");
    setDeletionReceipt(receipt);
    return true;
  }

  async function handleDeleteFile(resumeId, fileId) {
    const file = pendingFileDeletion?.file;
    const updatedResume = await runAction(
      () => deleteResumeFile(resumeId, fileId),
      "Uploaded original deleted.",
    );

    if (!updatedResume) {
      return false;
    }

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
      setUploadResumeId(null);
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
              <IconButton label="Add resume" onClick={beginCreate} disabled={busy}>
                <PlusIcon />
              </IconButton>
            </div>

            <ResumeList
              resumes={resumes}
              selectedId={selectedId}
              onSelect={selectResume}
            />
          </aside>

          <section className="min-w-0">
            <StatusLine status={status} error={error} />
            <ResumeDeletionReceipt receipt={deletionReceipt} />
            <FileDeletionReceipt receipt={fileDeletionReceipt} />
            <ResumeParsingReceipt receipt={parsingReceipt} />

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
                    onUpload={() => setUploadResumeId(selectedResume.resumeId)}
                    onGenerateProfileDraft={() =>
                      handleGenerateProfileDraft(selectedResume)
                    }
                    onArchive={() => handleArchive(selectedResume.resumeId)}
                    onRestore={() => handleRestore(selectedResume.resumeId)}
                    onDelete={() => requestDeletion(selectedResume)}
                  />
                </div>

                {editingResume ? (
                  <ResumeForm
                    key={`${editingResume.resumeId}-${editingResume.updatedAt}`}
                    resume={editingResume}
                    busy={busy}
                    onSubmit={handleUpdateSubmit}
                    onCancel={() => setEditingResume(null)}
                    onUpload={() => setUploadResumeId(editingResume.resumeId)}
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
              <EmptyState busy={busy} onCreate={beginCreate} />
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
        <CareerProfileDraftDialog
          draft={profileDraft}
          open={profileDraftOpen}
          busy={busy}
          status={status}
          error={error}
          onChange={setProfileDraft}
          onAccept={handleAcceptProfileDraft}
          onOpenChange={(open) => {
            if (!open && !busy) {
              setProfileDraftOpen(false);
              setProfileDraft(null);
            }
          }}
        />
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
