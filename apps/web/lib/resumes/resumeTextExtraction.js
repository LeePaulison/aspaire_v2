import path from "node:path";
import { pathToFileURL } from "node:url";

import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export const RESUME_TEXT_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

function normalizeExtractedText(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractPdfText(buffer) {
  const workerPath = path.resolve(
    process.cwd(),
    "../../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
  );
  PDFParse.setWorker(pathToFileURL(workerPath).href);

  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function extractResumeText({ buffer, contentType }) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("Resume file buffer is required.");
  }

  if (!RESUME_TEXT_CONTENT_TYPES.has(contentType)) {
    throw new Error("Unsupported resume file type.");
  }

  if (contentType === "text/plain") {
    return normalizeExtractedText(buffer.toString("utf8"));
  }

  if (contentType === "application/pdf") {
    return normalizeExtractedText(await extractPdfText(buffer));
  }

  return normalizeExtractedText(await extractDocxText(buffer));
}
