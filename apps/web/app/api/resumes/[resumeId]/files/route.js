import { randomUUID } from "node:crypto";

import { auth } from "@/lib/auth";
import {
  createResumeStorageKey,
  uploadResumeOriginal,
  validateResumeUploadFile,
} from "@/lib/resumes/resumeFileStorage";
import { extractResumeText } from "@/lib/resumes/resumeTextExtraction";
import {
  createResumeFile,
  getResumeById,
} from "@/repositories/resumeRepository";

export const runtime = "nodejs";

function jsonError(message, status) {
  return Response.json({ error: message }, { status });
}

function extractionErrorMessage(error) {
  const message = String(error?.message || "").trim();

  if (!message) {
    return "Text parsing failed.";
  }

  if (/password/i.test(message)) {
    return "The file appears to be password protected.";
  }

  if (/invalid pdf|bad end offset|xref|trailer|format/i.test(message)) {
    return "The PDF could not be read as a valid text PDF.";
  }

  return message;
}

export async function POST(request, context) {
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user;

  if (!user?.id) {
    return jsonError("Unauthorized", 401);
  }

  const { resumeId } = await context.params;

  if (!resumeId || resumeId === "undefined" || resumeId === "null") {
    return jsonError("Resume upload target is missing.", 400);
  }

  const resume = await getResumeById(user.id, resumeId);

  if (!resume) {
    return jsonError("Resume not found", 404);
  }

  if (resume.status === "archived") {
    return jsonError("Restore the resume before uploading a file.", 409);
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const validatedFile = validateResumeUploadFile(file);
    const fileId = randomUUID();
    const storageKey = createResumeStorageKey({
      userId: user.id,
      resumeId,
      fileId,
      filename: validatedFile.filename,
    });
    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";
    let textExtractionStatus = "pending";
    let textExtractionError = "";

    try {
      extractedText = await extractResumeText({
        buffer,
        contentType: validatedFile.contentType,
      });
      textExtractionStatus = extractedText ? "completed" : "failed";
      textExtractionError = extractedText
        ? ""
        : "No extractable text was found in this file.";
    } catch (extractionError) {
      textExtractionStatus = "failed";
      textExtractionError = extractionErrorMessage(extractionError);
    }

    await uploadResumeOriginal({
      storageKey,
      contentType: validatedFile.contentType,
      buffer,
    });

    await createResumeFile(user.id, resumeId, {
      fileId,
      originalFilename: validatedFile.filename,
      contentType: validatedFile.contentType,
      fileSize: validatedFile.fileSize,
      storageKey,
      textExtractionStatus,
      extractedText,
    });

    const updatedResume = await getResumeById(user.id, resumeId);
    const textApplied =
      Boolean(extractedText) && resume.resumeText !== updatedResume?.resumeText;

    return Response.json(
      {
        resume: updatedResume,
        parsing: {
          fileId,
          filename: validatedFile.filename,
          status: textExtractionStatus,
          textApplied,
          error: textExtractionError,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return jsonError(error.message || "Resume file upload failed.", 400);
  }
}
