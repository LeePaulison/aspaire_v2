export const emptyResume = {
  title: "",
  targetRole: "",
  notes: "",
  resumeText: "",
  status: "draft",
  isPrimary: false,
};

export function getFormValue(formData, key) {
  return String(formData.get(key) ?? "");
}

export function formatDate(value) {
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

export function formatFileSize(bytes) {
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

export function formatFileCount(count) {
  return `${count} ${count === 1 ? "file" : "files"}`;
}
