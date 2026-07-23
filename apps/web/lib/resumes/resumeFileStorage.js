import { createHash, createHmac } from "node:crypto";

const DEFAULT_MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const CONTENT_TYPE_EXTENSIONS = new Map([
  ["application/pdf", ".pdf"],
  [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".docx",
  ],
  ["text/plain", ".txt"],
]);

function hashHex(value) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key, value, encoding) {
  return createHmac("sha256", key).update(value).digest(encoding);
}

function requireEnvironmentValue(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not defined.`);
  }

  return value;
}

function maxUploadBytes() {
  const parsed = Number(process.env.RESUME_UPLOAD_MAX_BYTES);
  return Number.isSafeInteger(parsed) && parsed > 0
    ? parsed
    : DEFAULT_MAX_FILE_BYTES;
}

function normalizeContentType(value) {
  return String(value || "").split(";")[0].trim().toLowerCase();
}

export function sanitizeFilename(filename, contentType) {
  const fallbackExtension = CONTENT_TYPE_EXTENSIONS.get(contentType) ?? "";
  const fallbackName = `resume${fallbackExtension}`;
  const normalized = String(filename || fallbackName)
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 120);

  return normalized || fallbackName;
}

export function validateResumeUploadFile(file) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("Resume file is required.");
  }

  const contentType = normalizeContentType(file.type);

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    throw new Error("Upload a PDF, DOCX, or plain text resume.");
  }

  if (!Number.isSafeInteger(file.size) || file.size <= 0) {
    throw new Error("Resume file is empty.");
  }

  if (file.size > maxUploadBytes()) {
    throw new Error(
      `Resume file must be ${Math.floor(maxUploadBytes() / 1024 / 1024)} MB or less.`,
    );
  }

  return {
    contentType,
    filename: sanitizeFilename(file.name, contentType),
    fileSize: file.size,
  };
}

export function createResumeStorageKey({ userId, resumeId, fileId, filename }) {
  return `users/${encodeURIComponent(userId)}/resumes/${encodeURIComponent(
    resumeId,
  )}/${encodeURIComponent(fileId)}-${encodeURIComponent(filename)}`;
}

function s3Config() {
  const region = requireEnvironmentValue("AWS_REGION");
  const bucket = requireEnvironmentValue("S3_RESUME_BUCKET");

  return {
    accessKeyId: requireEnvironmentValue("AWS_ACCESS_KEY_ID"),
    bucket,
    region,
    secretAccessKey: requireEnvironmentValue("AWS_SECRET_ACCESS_KEY"),
    sessionToken: process.env.AWS_SESSION_TOKEN || "",
    host: `${bucket}.s3.${region}.amazonaws.com`,
  };
}

function signingKey(secretAccessKey, dateStamp, region) {
  const dateKey = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, region);
  const serviceKey = hmac(regionKey, "s3");
  return hmac(serviceKey, "aws4_request");
}

function encodeS3Key(key) {
  return `/${key
    .split("/")
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join("/")}`;
}

function amzDates(now = new Date()) {
  const iso = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return {
    amzDate: iso,
    dateStamp: iso.slice(0, 8),
  };
}

async function signedS3Request({ method, key, body, contentType }) {
  const config = s3Config();
  const { amzDate, dateStamp } = amzDates();
  const payloadHash = hashHex(body ?? "");
  const canonicalUri = encodeS3Key(key);
  const headers = {
    host: config.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  if (contentType) {
    headers["content-type"] = contentType;
  }

  if (config.sessionToken) {
    headers["x-amz-security-token"] = config.sessionToken;
  }

  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((header) => `${header}:${headers[header]}\n`)
    .join("");
  const canonicalRequest = [
    method,
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hashHex(canonicalRequest),
  ].join("\n");
  const signature = hmac(
    signingKey(config.secretAccessKey, dateStamp, config.region),
    stringToSign,
    "hex",
  );
  const response = await fetch(`https://${config.host}${canonicalUri}`, {
    method,
    headers: {
      ...headers,
      authorization: `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Resume file storage failed with status ${response.status}.`);
  }
}

export async function uploadResumeOriginal({ storageKey, contentType, buffer }) {
  await signedS3Request({
    method: "PUT",
    key: storageKey,
    body: buffer,
    contentType,
  });
}

export async function deleteResumeOriginal(storageKey) {
  await signedS3Request({
    method: "DELETE",
    key: storageKey,
    body: "",
  });
}
