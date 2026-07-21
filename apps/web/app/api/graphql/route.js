import { createHash, randomUUID } from "node:crypto";
import { createYoga, createSchema } from "graphql-yoga";

import { createContext } from "@/graphql/context";
import { typeDefs } from "@/graphql/schemas";
import { resolvers } from "@/graphql/resolvers";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/security/rateLimiter";
import { validateGraphqlRequest } from "@/lib/security/graphqlRequest";

const DEFAULT_MAX_BODY_BYTES = 1024 * 1024;
const DEFAULT_REQUESTS_PER_MINUTE = 120;

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  context: createContext,
  graphqlEndpoint: "/api/graphql",
  graphiql: process.env.NODE_ENV !== "production",
  maskedErrors: process.env.NODE_ENV === "production",
  fetchAPI: { Response },
});

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function clientAddress(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
}

function rateLimitKey(request) {
  const credential = request.headers.get("authorization") || request.headers.get("cookie");
  if (credential) {
    const digest = createHash("sha256").update(credential).digest("hex");
    return `credential:${digest}`;
  }
  return `ip:${clientAddress(request)}`;
}

async function handle(request) {
  const requestId = request.headers.get("x-request-id") || randomUUID();
  const startedAt = Date.now();
  const maxBodyBytes = positiveInteger(process.env.GRAPHQL_MAX_BODY_BYTES, DEFAULT_MAX_BODY_BYTES);
  const requestsPerMinute = positiveInteger(
    process.env.GRAPHQL_REQUESTS_PER_MINUTE,
    DEFAULT_REQUESTS_PER_MINUTE,
  );
  const rate = checkRateLimit({ key: rateLimitKey(request), limit: requestsPerMinute });

  if (!rate.allowed) {
    logger.warn("GraphQL rate limit exceeded", { requestId, clientAddress: clientAddress(request) });
    return Response.json(
      { errors: [{ message: "Too many requests" }] },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)), "X-Request-ID": requestId } },
    );
  }

  const validationError = await validateGraphqlRequest({
    request,
    maxBodyBytes,
    production: process.env.NODE_ENV === "production",
  });
  if (validationError) {
    logger.warn("GraphQL request rejected", {
      requestId,
      statusCode: validationError.status,
      bodyBytes: validationError.bodyBytes,
    });
    return Response.json(
      { errors: [{ message: validationError.message }] },
      {
        status: validationError.status,
        headers: { ...validationError.headers, "X-Request-ID": requestId },
      },
    );
  }

  const response = await yoga.handle(request, { requestId });
  response.headers.set("X-Request-ID", requestId);
  response.headers.set("Cache-Control", "no-store");
  logger.info("GraphQL request completed", {
    requestId,
    method: request.method,
    statusCode: response.status,
    durationMs: Date.now() - startedAt,
  });
  return response;
}

export const GET = handle;
export const POST = handle;
