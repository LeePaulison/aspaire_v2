import { randomUUID } from "node:crypto";

import { and, desc, eq, inArray, ne } from "drizzle-orm";

import { resumeFiles, resumes } from "../drizzle/resumes.js";
import { db } from "../lib/db/neon.js";
import { deleteResumeOriginal } from "../lib/resumes/resumeFileStorage.js";

const RESUME_STATUSES = new Set(["draft", "active", "archived"]);
const SOURCE_TYPES = new Set(["manual", "upload"]);
const MAX_RESUME_TEXT_LENGTH = 120000;

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStatus(value, fallback = "draft") {
  const normalized = normalizeText(value).toLowerCase();
  return RESUME_STATUSES.has(normalized) ? normalized : fallback;
}

function normalizeSourceType(value) {
  const normalized = normalizeText(value).toLowerCase();
  return SOURCE_TYPES.has(normalized) ? normalized : "manual";
}

function validateTitle(title) {
  if (!title) {
    throw new Error("Resume title is required");
  }
}

function validateResumeText(resumeText) {
  if (resumeText.length > MAX_RESUME_TEXT_LENGTH) {
    throw new Error("Resume text is too long");
  }
}

function shapeResume(row) {
  if (!row) {
    return null;
  }

  const files = Array.isArray(row.files) ? row.files : [];

  return {
    ...row,
    files: files.map(shapeResumeFile),
    hasUploadedOriginal: files.length > 0,
  };
}

function shapeResumeFile(row) {
  if (!row) {
    return null;
  }

  return {
    fileId: row.fileId,
    resumeId: row.resumeId,
    originalFilename: row.originalFilename,
    contentType: row.contentType,
    fileSize: row.fileSize,
    textExtractionStatus: row.textExtractionStatus,
    uploadedAt: row.uploadedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function shapeResumeFileWithStorage(row) {
  if (!row) {
    return null;
  }

  return {
    ...shapeResumeFile(row),
    storageKey: row.storageKey,
  };
}

export function createResumeRepository({
  database = db,
  createId = randomUUID,
  deleteStoredOriginal = deleteResumeOriginal,
} = {}) {
  async function clearPrimary(userId, exceptResumeId) {
    let whereClause = and(eq(resumes.userId, userId), eq(resumes.isPrimary, true));

    if (exceptResumeId) {
      whereClause = and(
        eq(resumes.userId, userId),
        eq(resumes.isPrimary, true),
        ne(resumes.resumeId, exceptResumeId),
      );
    }

    await database
      .update(resumes)
      .set({ isPrimary: false, updatedAt: new Date() })
      .where(whereClause);
  }

  async function getResumeById(userId, resumeId) {
    const [resume] = await database
      .select()
      .from(resumes)
      .where(and(eq(resumes.userId, userId), eq(resumes.resumeId, resumeId)))
      .limit(1);

    if (!resume) {
      return null;
    }

    const files = await database
      .select()
      .from(resumeFiles)
      .where(and(eq(resumeFiles.userId, userId), eq(resumeFiles.resumeId, resumeId)))
      .orderBy(desc(resumeFiles.uploadedAt));

    return shapeResume({ ...resume, files });
  }

  async function attachFilesToResumes(userId, rows) {
    if (rows.length === 0) {
      return [];
    }

    const resumeIds = rows.map((resume) => resume.resumeId);
    const files = await database
      .select()
      .from(resumeFiles)
      .where(
        and(eq(resumeFiles.userId, userId), inArray(resumeFiles.resumeId, resumeIds)),
      )
      .orderBy(desc(resumeFiles.uploadedAt));
    const filesByResumeId = new Map();

    for (const file of files) {
      const existingFiles = filesByResumeId.get(file.resumeId) ?? [];
      existingFiles.push(file);
      filesByResumeId.set(file.resumeId, existingFiles);
    }

    return rows.map((resume) =>
      shapeResume({
        ...resume,
        files: filesByResumeId.get(resume.resumeId) ?? [],
      }),
    );
  }

  return {
    async listResumes(userId, { includeArchived = true } = {}) {
      let whereClause = eq(resumes.userId, userId);

      if (!includeArchived) {
        whereClause = and(eq(resumes.userId, userId), ne(resumes.status, "archived"));
      }

      const rows = await database
        .select()
        .from(resumes)
        .where(whereClause)
        .orderBy(desc(resumes.isPrimary), desc(resumes.updatedAt));

      return attachFilesToResumes(userId, rows);
    },

    getResumeById,

    async getPrimaryResume(userId) {
      const [resume] = await database
        .select()
        .from(resumes)
        .where(
          and(
            eq(resumes.userId, userId),
            eq(resumes.isPrimary, true),
            ne(resumes.status, "archived"),
          ),
        )
        .limit(1);

      if (!resume) {
        return null;
      }

      const files = await database
        .select()
        .from(resumeFiles)
        .where(
          and(
            eq(resumeFiles.userId, userId),
            eq(resumeFiles.resumeId, resume.resumeId),
          ),
        )
        .orderBy(desc(resumeFiles.uploadedAt));

      return shapeResume({ ...resume, files });
    },

    async createResume(userId, input = {}) {
      const title = normalizeText(input.title);
      const resumeText = normalizeText(input.resumeText);
      validateTitle(title);
      validateResumeText(resumeText);

      const resumeId = createId();
      const isPrimary = Boolean(input.isPrimary);

      if (isPrimary) {
        await clearPrimary(userId);
      }

      const [resume] = await database
        .insert(resumes)
        .values({
          resumeId,
          userId,
          profileId: normalizeText(input.profileId) || null,
          title,
          targetRole: normalizeText(input.targetRole),
          notes: normalizeText(input.notes),
          resumeText,
          status: normalizeStatus(input.status, resumeText ? "active" : "draft"),
          sourceType: normalizeSourceType(input.sourceType),
          isPrimary,
        })
        .returning();

      return shapeResume({ ...resume, files: [] });
    },

    async updateResume(userId, resumeId, input = {}) {
      const existing = await getResumeById(userId, resumeId);

      if (!existing) {
        return null;
      }

      const title =
        input.title === undefined ? existing.title : normalizeText(input.title);
      const resumeText =
        input.resumeText === undefined
          ? existing.resumeText
          : normalizeText(input.resumeText);

      validateTitle(title);
      validateResumeText(resumeText);

      const shouldBePrimary =
        input.isPrimary === undefined ? existing.isPrimary : Boolean(input.isPrimary);

      if (shouldBePrimary) {
        await clearPrimary(userId, resumeId);
      }

      const [updatedResume] = await database
        .update(resumes)
        .set({
          profileId:
            input.profileId === undefined
              ? existing.profileId
              : normalizeText(input.profileId) || null,
          title,
          targetRole:
            input.targetRole === undefined
              ? existing.targetRole
              : normalizeText(input.targetRole),
          notes:
            input.notes === undefined ? existing.notes : normalizeText(input.notes),
          resumeText,
          status:
            input.status === undefined
              ? existing.status
              : normalizeStatus(input.status, existing.status),
          sourceType:
            input.sourceType === undefined
              ? existing.sourceType
              : normalizeSourceType(input.sourceType),
          isPrimary: shouldBePrimary,
          updatedAt: new Date(),
        })
        .where(and(eq(resumes.userId, userId), eq(resumes.resumeId, resumeId)))
        .returning();

      return shapeResume({ ...updatedResume, files: existing.files });
    },

    async createResumeFile(userId, resumeId, input = {}) {
      const existing = await getResumeById(userId, resumeId);

      if (!existing || existing.status === "archived") {
        return null;
      }

      const fileId = normalizeText(input.fileId) || createId();
      const extractedText = normalizeText(input.extractedText);
      validateResumeText(extractedText);

      const [file] = await database
        .insert(resumeFiles)
        .values({
          fileId,
          resumeId,
          userId,
          originalFilename: normalizeText(input.originalFilename),
          contentType: normalizeText(input.contentType),
          fileSize: input.fileSize,
          storageKey: normalizeText(input.storageKey),
          textExtractionStatus: normalizeText(input.textExtractionStatus) || "pending",
        })
        .returning();

      const shouldApplyExtractedText =
        extractedText && (!existing.resumeText || existing.sourceType === "upload");
      const resumeUpdate = shouldApplyExtractedText
        ? {
            resumeText: extractedText,
            sourceType: "upload",
            status: existing.status === "draft" ? "active" : existing.status,
            updatedAt: new Date(),
          }
        : { updatedAt: new Date() };

      await database
        .update(resumes)
        .set(resumeUpdate)
        .where(and(eq(resumes.userId, userId), eq(resumes.resumeId, resumeId)));

      return shapeResumeFile(file);
    },

    async getResumeFileStorage(userId, resumeId, fileId) {
      const [file] = await database
        .select()
        .from(resumeFiles)
        .where(
          and(
            eq(resumeFiles.userId, userId),
            eq(resumeFiles.resumeId, resumeId),
            eq(resumeFiles.fileId, fileId),
          ),
        )
        .limit(1);

      return shapeResumeFileWithStorage(file);
    },

    async deleteResumeFile(userId, resumeId, fileId) {
      const existing = await getResumeById(userId, resumeId);

      if (!existing) {
        return null;
      }

      const [file] = await database
        .select()
        .from(resumeFiles)
        .where(
          and(
            eq(resumeFiles.userId, userId),
            eq(resumeFiles.resumeId, resumeId),
            eq(resumeFiles.fileId, fileId),
          ),
        )
        .limit(1);

      if (!file) {
        return existing;
      }

      await deleteStoredOriginal(file.storageKey);

      await database
        .delete(resumeFiles)
        .where(
          and(
            eq(resumeFiles.userId, userId),
            eq(resumeFiles.resumeId, resumeId),
            eq(resumeFiles.fileId, fileId),
          ),
        );

      return getResumeById(userId, resumeId);
    },

    async setPrimaryResume(userId, resumeId) {
      const existing = await getResumeById(userId, resumeId);

      if (!existing || existing.status === "archived") {
        return null;
      }

      await clearPrimary(userId, resumeId);

      const [updatedResume] = await database
        .update(resumes)
        .set({ isPrimary: true, updatedAt: new Date() })
        .where(and(eq(resumes.userId, userId), eq(resumes.resumeId, resumeId)))
        .returning();

      return shapeResume({ ...updatedResume, files: existing.files });
    },

    async archiveResume(userId, resumeId) {
      const [updatedResume] = await database
        .update(resumes)
        .set({ status: "archived", isPrimary: false, updatedAt: new Date() })
        .where(and(eq(resumes.userId, userId), eq(resumes.resumeId, resumeId)))
        .returning();

      return updatedResume ? getResumeById(userId, resumeId) : null;
    },

    async restoreResume(userId, resumeId) {
      const [updatedResume] = await database
        .update(resumes)
        .set({ status: "active", updatedAt: new Date() })
        .where(and(eq(resumes.userId, userId), eq(resumes.resumeId, resumeId)))
        .returning();

      return updatedResume ? getResumeById(userId, resumeId) : null;
    },

    async deleteResume(userId, resumeId) {
      const existing = await getResumeById(userId, resumeId);

      if (!existing) {
        return null;
      }

      const files = await database
        .select()
        .from(resumeFiles)
        .where(and(eq(resumeFiles.userId, userId), eq(resumeFiles.resumeId, resumeId)));
      const uploadedOriginalCount = files.length;
      let uploadedOriginalDeleted = true;

      for (const file of files) {
        try {
          await deleteStoredOriginal(file.storageKey);
        } catch {
          uploadedOriginalDeleted = false;
        }
      }

      await database
        .delete(resumes)
        .where(and(eq(resumes.userId, userId), eq(resumes.resumeId, resumeId)));

      return {
        resumeId,
        title: existing.title,
        deletedAt: new Date(),
        recordDeleted: true,
        contentDeleted: true,
        fileMetadataDeleted: true,
        uploadedOriginalDeleted,
        hadUploadedOriginal: uploadedOriginalCount > 0,
        uploadedOriginalCount,
      };
    },
  };
}

export const resumeRepository = createResumeRepository();

export const listResumes = (...args) => resumeRepository.listResumes(...args);
export const getResumeById = (...args) => resumeRepository.getResumeById(...args);
export const getPrimaryResume = (...args) => resumeRepository.getPrimaryResume(...args);
export const createResume = (...args) => resumeRepository.createResume(...args);
export const updateResume = (...args) => resumeRepository.updateResume(...args);
export const createResumeFile = (...args) => resumeRepository.createResumeFile(...args);
export const getResumeFileStorage = (...args) =>
  resumeRepository.getResumeFileStorage(...args);
export const deleteResumeFile = (...args) => resumeRepository.deleteResumeFile(...args);
export const setPrimaryResume = (...args) => resumeRepository.setPrimaryResume(...args);
export const archiveResume = (...args) => resumeRepository.archiveResume(...args);
export const restoreResume = (...args) => resumeRepository.restoreResume(...args);
export const deleteResume = (...args) => resumeRepository.deleteResume(...args);
