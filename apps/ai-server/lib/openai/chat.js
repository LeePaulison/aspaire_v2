import { openai } from "./client.js";
import { buildSystemPrompt } from "../buildSystemPrompt.js";

export async function createChatStream({
  message,
  model,
  temperature = 0.7,
  reasoningLevel = null,
  verbosityLevel = null,
  agentSystemPrompt = "You are a helpful assistant.",
  responseFormat = "text",
  responseSchema = null,
}) {
  if (!message) throw new Error("message is required");
  if (!model) throw new Error("model is required");
  if (!model.modelId) throw new Error("modelId is required");

  const systemPrompt = buildSystemPrompt(agentSystemPrompt);
  const request = buildResponseRequest({
    message,
    model,
    temperature,
    reasoningLevel,
    verbosityLevel,
    systemPrompt,
    responseFormat,
    responseSchema,
  });

  return openai.responses.create(request);
}

export function buildResponseRequest({
  message,
  model,
  temperature = 0.7,
  reasoningLevel = null,
  verbosityLevel = null,
  systemPrompt,
  responseFormat = "text",
  responseSchema = null,
}) {
  const request = {
    model: model.modelId,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: systemPrompt,
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    ],
    stream: true,
  };

  if (model.supportsTemperature && Number.isFinite(temperature)) {
    request.temperature = temperature;
  }

  if (model.supportsReasoning && reasoningLevel?.levelId) {
    request.reasoning = {
      effort: reasoningLevel.levelId,
    };
  }

  if (model.supportsVerbosity && verbosityLevel?.levelId) {
    request.text = {
      ...request.text,
      verbosity: verbosityLevel.levelId,
    };
  }

  const textFormat = buildTextFormat(responseFormat, responseSchema);
  if (textFormat) {
    request.text = {
      ...request.text,
      format: textFormat,
    };
  }

  return request;
}

function buildTextFormat(responseFormat, responseSchema) {
  if (responseFormat === "json_object") {
    return { type: "json_object" };
  }

  if (responseFormat !== "json_schema" || !responseSchema) {
    return null;
  }

  const schema = typeof responseSchema === "string"
    ? JSON.parse(responseSchema)
    : responseSchema;

  if (
    schema === null ||
    typeof schema !== "object" ||
    Array.isArray(schema) ||
    Object.hasOwn(schema, "type") ||
    typeof schema.name !== "string" ||
    schema.name.trim().length === 0 ||
    schema.schema === null ||
    typeof schema.schema !== "object" ||
    Array.isArray(schema.schema)
  ) {
    throw new Error(
      "JSON schema response format must include name and schema, without type.",
    );
  }

  return {
    type: "json_schema",
    ...schema,
  };
}
