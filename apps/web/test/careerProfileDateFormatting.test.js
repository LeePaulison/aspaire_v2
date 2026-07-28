import assert from "node:assert/strict";
import test from "node:test";

import {
  formatCertificationDateRange,
  formatDateRange,
  formatDisplayDate,
} from "../components/career-profile/careerProfileUtils.js";

test("career profile date formatting renders ISO dates without timezone drift", () => {
  assert.equal(formatDisplayDate("2026-07-28"), "Jul 28, 2026");
});

test("career profile date range formatting includes present for current roles", () => {
  assert.equal(
    formatDateRange("2024-01-01", null, { isCurrent: true }),
    "Jan 1, 2024 - Present",
  );
});

test("career profile certification dates describe partial ranges", () => {
  assert.equal(
    formatCertificationDateRange("2025-02-03", null),
    "Issued Feb 3, 2025",
  );
});
