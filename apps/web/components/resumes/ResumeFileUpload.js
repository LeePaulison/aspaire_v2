"use client";

import { UploadIcon } from "@radix-ui/react-icons";

export function ResumeFileUpload({ resume, busy, onUpload }) {
  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return;
    }

    if (!resume?.resumeId) {
      return;
    }

    const uploaded = await onUpload(resume.resumeId, file);

    if (uploaded) {
      form.reset();
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-medium">
        <span>Original resume file</span>
        <input
          name="file"
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          disabled={busy || !resume?.resumeId}
          className="ResumeFileInput min-w-0 flex-1"
        />
      </label>
      <p className="text-xs leading-5 text-foreground-muted">
        Accepted formats: PDF, DOCX, or TXT. Extracted text fills empty upload-based
        resumes without overwriting manually entered text.
      </p>
      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={busy || !resume?.resumeId}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UploadIcon />
          Upload
        </button>
      </div>
    </form>
  );
}
