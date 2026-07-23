import { randomUUID } from "node:crypto";

import { auth } from "@/lib/auth";
import {
  createResumeStorageKey,
  uploadResumeOriginal,
  validateResumeUploadFile,
} from "@/lib/resumes/resumeFileStorage";
import {
  createResumeFile,
  getResumeById,
} from "@/repositories/resumeRepository";

function jsonError(message, status) {
  return Response.json({ error: message }, { status });
}

export async function POST(request, context) {
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user;

  if (!user?.id) {
    return jsonError("Unauthorized", 401);
  }

  const { resumeId } = await context.params;
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
      textExtractionStatus: "pending",
    });

    const updatedResume = await getResumeById(user.id, resumeId);

    return Response.json({ resume: updatedResume }, { status: 201 });
  } catch (error) {
    return jsonError(error.message || "Resume file upload failed.", 400);
  }
}
