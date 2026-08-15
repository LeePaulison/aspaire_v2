import assert from "node:assert/strict";
import test from "node:test";

import { buildResponseRequest } from "../lib/openai/chat.js";

test("response requests merge verbosity and structured output format", () => {
  const request = buildResponseRequest({
    message: "Resume text",
    model: {
      modelId: "gpt-5.5",
      supportsReasoning: true,
      supportsVerbosity: true,
      supportsTemperature: false,
    },
    reasoningLevel: { levelId: "medium" },
    verbosityLevel: { levelId: "low" },
    systemPrompt: "Parse resumes",
    responseFormat: "json_schema",
    responseSchema: {
      name: "career_profile_draft",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: { type: "string" },
        },
        required: ["summary"],
      },
    },
  });

  assert.equal(request.model, "gpt-5.5");
  assert.equal(request.reasoning.effort, "medium");
  assert.equal(request.temperature, undefined);
  assert.deepEqual(request.text, {
    verbosity: "low",
    format: {
      type: "json_schema",
      name: "career_profile_draft",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: { type: "string" },
        },
        required: ["summary"],
      },
    },
  });
});

test("response requests reject invalid json_schema response formats", () => {
  assert.throws(
    () =>
      buildResponseRequest({
        message: "Resume text",
        model: {
          modelId: "gpt-5.5",
          supportsReasoning: false,
          supportsVerbosity: false,
          supportsTemperature: false,
        },
        systemPrompt: "Parse resumes",
        responseFormat: "json_schema",
        responseSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
          },
        },
      }),
    /must include name and schema, without type/,
  );

  assert.throws(
    () =>
      buildResponseRequest({
        message: "Resume text",
        model: {
          modelId: "gpt-5.5",
          supportsReasoning: false,
          supportsVerbosity: false,
          supportsTemperature: false,
        },
        systemPrompt: "Parse resumes",
        responseFormat: "json_schema",
        responseSchema: {
          type: "json_schema",
          name: "career_profile_draft",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
            },
          },
        },
      }),
    /must include name and schema, without type/,
  );
});
