import { randomUUID } from "node:crypto";
import { createFixedWindowRateLimiter } from "../rateLimiter.js";

const DEFAULT_AUTHENTICATION_TIMEOUT_MS = 10_000;

async function nextWithTimeout(iterator, timeoutMs) {
  let timeout;
  try {
    return await Promise.race([
      iterator.next(),
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error("OpenAI stream timed out")), timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}

async function cancelIterator(iterator) {
  if (typeof iterator?.return !== "function") return;

  try {
    await Promise.race([
      iterator.return(),
      new Promise((resolve) => setTimeout(resolve, 1_000)),
    ]);
  } catch {
    // The original stream failure remains the useful error for the caller.
  }
}

function optionalString(value) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function optionalNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

async function resolveAiRuntime({
  token,
  preferences,
  requestedAgentId,
  requestedDomain,
  requestedWorkflowType,
  requestedModelId,
  requestedReasoningId,
  requestedVerbosityId,
  requestedTemperature,
  getDomainPreference,
  getAiAgentById,
  getAiModelById,
}) {
  const explicitAgentId = optionalString(requestedAgentId);
  const explicitDomain = optionalString(requestedDomain);
  const explicitWorkflowType = optionalString(requestedWorkflowType);
  const explicitModelId = optionalString(requestedModelId);
  const explicitReasoningId = optionalString(requestedReasoningId);
  const explicitVerbosityId = optionalString(requestedVerbosityId);
  const explicitTemperature = optionalNumber(requestedTemperature);
  const hasDomainRequest =
    Boolean(explicitAgentId) ||
    Boolean(explicitDomain) ||
    Boolean(explicitWorkflowType);

  let agent = null;

  if (explicitAgentId) {
    agent = await getAiAgentById({ token, agentId: explicitAgentId });
  }

  const domain = explicitDomain ?? agent?.domain ?? null;
  const workflowType = explicitWorkflowType ?? agent?.workflowType ?? null;
  const domainPreference =
    hasDomainRequest && domain && workflowType
      ? await getDomainPreference({ token, domain, workflowType })
      : null;
  const effectiveAgentId =
    explicitAgentId ??
    domainPreference?.agentId ??
    preferences.defaultAgentId;

  if (!agent || agent.agentId !== effectiveAgentId) {
    agent = await getAiAgentById({ token, agentId: effectiveAgentId });
  }

  const modelId =
    explicitModelId ??
    domainPreference?.defaultModelId ??
    agent?.defaultModelId ??
    preferences.defaultModelId;
  const model = await getAiModelById({ token, modelId });
  const hasDomainTemperature = domainPreference
    ? Object.hasOwn(domainPreference, "temperature")
    : false;

  return {
    agent,
    model,
    reasoningId:
      explicitReasoningId ??
      domainPreference?.defaultReasoningId ??
      preferences.defaultReasoningId,
    verbosityId:
      explicitVerbosityId ??
      domainPreference?.defaultVerbosityId ??
      preferences.defaultVerbosityId,
    temperature:
      explicitTemperature ??
      (hasDomainTemperature
        ? optionalNumber(domainPreference.temperature)
        : preferences.temperature),
    responseFormat: domainPreference?.responseFormat ?? "text",
    responseSchema: domainPreference?.responseSchema ?? null,
    domainPreference,
  };
}

export function createWebSocketConnectionHandler({
  verifyAuthenticationToken,
  decodeToken = () => ({}),
  getPreferences,
  getDomainPreference = async () => null,
  getAiModelById,
  getAiAgentById,
  createChatStream,
  saveConversationTurn,
  logger,
  authenticationTimeoutMs = DEFAULT_AUTHENTICATION_TIMEOUT_MS,
  maxPayloadBytes = 640 * 1024,
  messagesPerMinute = 30,
  streamIdleTimeoutMs = 120_000,
  now = Date.now,
  createId = randomUUID,
}) {
  const rateLimiter = createFixedWindowRateLimiter({
    limit: messagesPerMinute,
    now,
  });

  return function handleConnection(socket, request) {
    const connectionId = createId();
    const connectedAt = now();
    let authenticationState = "unauthenticated";
    let authenticationToken;
    let userId;
    let processing = false;
    let activeIterator;

    logger.info("WebSocket connected", {
      connectionId,
      ip: request.socket.remoteAddress,
      origin: request.headers?.origin,
    });

    function sendJson(message) {
      if (socket.readyState !== socket.OPEN) return;
      socket.send(JSON.stringify(message));
    }

    function sendError(message) {
      sendJson({ type: "error", payload: { message } });
    }

    const authenticationTimeout = setTimeout(() => {
      if (authenticationState !== "authenticated") {
        logger.warn("WebSocket authentication timed out", {
          ip: request.socket.remoteAddress,
          connectionId,
        });
        sendJson({
          type: "authentication_error",
          payload: { message: "Authentication timed out" },
        });
        socket.close(1008, "Authentication required");
      }
    }, authenticationTimeoutMs);

    socket.on("message", async (rawMessage) => {
      let parsedMessage;
      const requestId = createId();
      const requestStartedAt = now();

      try {
        const payloadBytes = Buffer.byteLength(rawMessage);
        if (payloadBytes > maxPayloadBytes) {
          logger.warn("WebSocket message exceeded payload limit", {
            connectionId,
            requestId,
            payloadBytes,
            maxPayloadBytes,
          });
          socket.close(1009, "Message too large");
          return;
        }

        const rateKey = userId ? `user:${userId}` : `ip:${request.socket.remoteAddress || "unknown"}`;
        const rate = rateLimiter.check(rateKey);
        if (!rate.allowed) {
          logger.warn("WebSocket message rate exceeded", {
            connectionId,
            requestId,
            userId,
            messagesPerMinute,
            reason: rate.reason,
          });
          sendError("Message rate limit exceeded");
          socket.close(1008, "Rate limit exceeded");
          return;
        }

        parsedMessage = JSON.parse(rawMessage.toString());

        if (parsedMessage === null || typeof parsedMessage !== "object" || Array.isArray(parsedMessage)) {
          sendError("Invalid message format");
          return;
        }

        if (
          typeof parsedMessage.type !== "string" ||
          parsedMessage.payload === null ||
          typeof parsedMessage.payload !== "object" ||
          Array.isArray(parsedMessage.payload)
        ) {
          sendError("Invalid message payload format");
          return;
        }

        if (authenticationState !== "authenticated") {
          if (
            authenticationState !== "unauthenticated" ||
            parsedMessage.type !== "authenticate" ||
            typeof parsedMessage.payload.token !== "string" ||
            parsedMessage.payload.token.length === 0
          ) {
            authenticationState = "rejected";
            clearTimeout(authenticationTimeout);
            sendJson({ type: "authentication_error", payload: { message: "Authentication is required" } });
            socket.close(1008, "Authentication required");
            return;
          }

          authenticationState = "authenticating";

          try {
            const claims = await verifyAuthenticationToken(parsedMessage.payload.token);
            userId = claims.sub;
            authenticationToken = parsedMessage.payload.token;
            authenticationState = "authenticated";
            clearTimeout(authenticationTimeout);
            logger.info("WebSocket authenticated", { connectionId });
            sendJson({ type: "authenticated" });
          } catch (error) {
            authenticationState = "rejected";
            clearTimeout(authenticationTimeout);
            let receivedClaims = {};
            try {
              const { iss, aud } = decodeToken(parsedMessage.payload.token);
              receivedClaims = { issuer: iss, audience: aud };
            } catch {}
            logger.warn("WebSocket authentication failed", {
              ip: request.socket.remoteAddress,
              connectionId,
              error: error.message,
              ...receivedClaims,
            });
            sendJson({ type: "authentication_error", payload: { message: "Authentication failed" } });
            socket.close(1008, "Authentication failed");
          }
          return;
        }

        if (parsedMessage.type !== "chat_message") {
          sendError("Unsupported message type");
          return;
        }

        if (processing) {
          sendError("A chat request is already in progress");
          return;
        }

        const {
          content,
          conversationId,
          agentId: requestedAgentId,
          domain: requestedDomain,
          workflowType: requestedWorkflowType,
          modelId: requestedModelId,
          reasoningId: requestedReasoningId,
          verbosityId: requestedVerbosityId,
          temperature: requestedTemperature,
        } = parsedMessage.payload;

        if (typeof content !== "string" || content.trim().length === 0) {
          sendError("Invalid message content");
          return;
        }

        const hasValidConversationId =
          conversationId === null ||
          (typeof conversationId === "string" && conversationId.trim().length > 0);

        if (!hasValidConversationId) {
          sendError("Invalid conversation ID");
          return;
        }

        processing = true;

        try {
          const conversationPreferences = await getPreferences({ token: authenticationToken });
          if (!conversationPreferences) {
            sendError("Missing conversation preferences");
            return;
          }

          const runtime = await resolveAiRuntime({
            token: authenticationToken,
            preferences: conversationPreferences,
            requestedAgentId,
            requestedDomain,
            requestedWorkflowType,
            requestedModelId,
            requestedReasoningId,
            requestedVerbosityId,
            requestedTemperature,
            getDomainPreference,
            getAiAgentById,
            getAiModelById,
          });

          if (!runtime.model) {
            sendError("Selected AI model was not found");
            return;
          }

          if (!runtime.agent) {
            sendError("Selected AI agent was not found");
            return;
          }

          let fullAssistantResponse = "";
          const stream = await createChatStream({
            message: content.trim(),
            model: runtime.model,
            reasoningLevel: runtime.reasoningId
              ? { levelId: runtime.reasoningId }
              : null,
            verbosityLevel: runtime.verbosityId
              ? { levelId: runtime.verbosityId }
              : null,
            temperature: runtime.temperature,
            agentSystemPrompt: runtime.agent.systemPrompt,
            responseFormat: runtime.responseFormat,
            responseSchema: runtime.responseSchema,
          });

          const iterator = stream[Symbol.asyncIterator]();
          activeIterator = iterator;
          let streamCompleted = false;
          try {
            while (true) {
              const { value: event, done } = await nextWithTimeout(iterator, streamIdleTimeoutMs);
              if (done) {
                streamCompleted = true;
                break;
              }

              if (event.type === "response.output_text.delta") {
                if (!event.delta) continue;
                fullAssistantResponse += event.delta;
                sendJson({ type: "chat_chunk", payload: { content: event.delta } });
              } else if (event.type === "response.failed") {
                throw new Error(event.response?.error?.message || "OpenAI response failed");
              } else if (event.type === "error") {
                throw new Error(event.message || "OpenAI stream failed");
              }
            }
          } finally {
            if (!streamCompleted) await cancelIterator(iterator);
            if (activeIterator === iterator) activeIterator = undefined;
          }

          const savedConversation = await saveConversationTurn({
            token: authenticationToken,
            conversationId,
            userMessage: content.trim(),
            assistantMessage: fullAssistantResponse,
          });
          sendJson({ type: "chat_complete", payload: savedConversation });
          logger.info("WebSocket chat request completed", {
            connectionId,
            requestId,
            userId,
            conversationId: savedConversation?.conversationId,
            durationMs: now() - requestStartedAt,
          });
        } finally {
          processing = false;
        }
      } catch (error) {
        logger.error("WebSocket request failed", error, {
          userId,
          connectionId,
          requestId,
          messageType: parsedMessage?.type,
        });
        sendError("Failed to process websocket request.");
      }
    });

    socket.on("close", (code, reason) => {
      clearTimeout(authenticationTimeout);
      authenticationToken = undefined;
      void cancelIterator(activeIterator);
      logger.info("WebSocket disconnected", {
        connectionId,
        userId,
        code,
        reason: reason?.toString(),
        durationMs: now() - connectedAt,
      });
    });
  };
}
