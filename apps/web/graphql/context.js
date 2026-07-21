// graphql/context.js

import { headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { auth } from "@/lib/auth";

let jwks;

async function getJwtUser(requestHeaders) {
  const authorization = requestHeaders.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const applicationUrl =
    process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_AUTH_URL;

  if (!applicationUrl) {
    throw new Error("Missing BETTER_AUTH_URL or NEXT_PUBLIC_AUTH_URL");
  }

  jwks ??= createRemoteJWKSet(
    new URL("/api/auth/jwks", applicationUrl),
  );

  const { payload } = await jwtVerify(authorization.slice(7), jwks, {
    issuer: process.env.JWT_ISSUER || "saigely-next",
    audience: process.env.JWT_AUDIENCE || "saigely-websocket",
    algorithms: ["RS256"],
  });

  if (typeof payload.sub !== "string" || payload.sub.length === 0) {
    throw new Error("JWT is missing its subject");
  }

  return { id: payload.sub };
}

export async function createContext(initialContext = {}) {
  const requestHeaders = initialContext.request?.headers ?? (await headers());
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  const user = session?.user ?? (await getJwtUser(requestHeaders));

  return {
    requestId:
      initialContext.requestId ||
      requestHeaders.get("x-request-id") ||
      randomUUID(),
    authenticated: !!user,
    session: session?.session ?? null,
    user,
  };
}
