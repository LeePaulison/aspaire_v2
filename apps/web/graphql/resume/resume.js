import { authRequest } from "@/graphql/authRequest";

export const RESUME_FIELDS = `
  resumeId
  profileId
  title
  targetRole
  notes
  resumeText
  status
  sourceType
  isPrimary
  files {
    fileId
    resumeId
    originalFilename
    contentType
    fileSize
    textExtractionStatus
    uploadedAt
    createdAt
    updatedAt
  }
  hasUploadedOriginal
  createdAt
  updatedAt
`;

export async function createResume(input) {
  const result = await authRequest({
    query: `
      mutation CreateResume($input: CreateResumeInput!) {
        createResume(input: $input) {
          ${RESUME_FIELDS}
        }
      }
    `,
    variables: { input },
  });

  return result.createResume;
}

export async function updateResume(resumeId, input) {
  const result = await authRequest({
    query: `
      mutation UpdateResume($resumeId: String!, $input: UpdateResumeInput!) {
        updateResume(resumeId: $resumeId, input: $input) {
          ${RESUME_FIELDS}
        }
      }
    `,
    variables: { resumeId, input },
  });

  return result.updateResume;
}

export async function setPrimaryResume(resumeId) {
  const result = await authRequest({
    query: `
      mutation SetPrimaryResume($resumeId: String!) {
        setPrimaryResume(resumeId: $resumeId) {
          ${RESUME_FIELDS}
        }
      }
    `,
    variables: { resumeId },
  });

  return result.setPrimaryResume;
}

export async function archiveResume(resumeId) {
  const result = await authRequest({
    query: `
      mutation ArchiveResume($resumeId: String!) {
        archiveResume(resumeId: $resumeId) {
          ${RESUME_FIELDS}
        }
      }
    `,
    variables: { resumeId },
  });

  return result.archiveResume;
}

export async function restoreResume(resumeId) {
  const result = await authRequest({
    query: `
      mutation RestoreResume($resumeId: String!) {
        restoreResume(resumeId: $resumeId) {
          ${RESUME_FIELDS}
        }
      }
    `,
    variables: { resumeId },
  });

  return result.restoreResume;
}

export async function deleteResume(resumeId) {
  const result = await authRequest({
    query: `
      mutation DeleteResume($resumeId: String!) {
        deleteResume(resumeId: $resumeId) {
          resumeId
          title
          deletedAt
          recordDeleted
          contentDeleted
          fileMetadataDeleted
          uploadedOriginalDeleted
          hadUploadedOriginal
          uploadedOriginalCount
        }
      }
    `,
    variables: { resumeId },
  });

  return result.deleteResume;
}

export async function deleteResumeFile(resumeId, fileId) {
  const result = await authRequest({
    query: `
      mutation DeleteResumeFile($resumeId: String!, $fileId: String!) {
        deleteResumeFile(resumeId: $resumeId, fileId: $fileId) {
          ${RESUME_FIELDS}
        }
      }
    `,
    variables: { resumeId, fileId },
  });

  return result.deleteResumeFile;
}

export async function uploadResumeOriginal(resumeId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/resumes/${encodeURIComponent(resumeId)}/files`, {
    method: "POST",
    body: formData,
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "Resume file upload failed.");
  }

  return result;
}
