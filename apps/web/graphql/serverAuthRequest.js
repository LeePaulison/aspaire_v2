import { headers } from "next/headers";

export async function serverAuthRequest({ query, variables = {} }) {
  const requestHeaders = await headers();
  const applicationUrl =
    process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_AUTH_URL;

  if (!applicationUrl) {
    throw new Error("Missing BETTER_AUTH_URL or NEXT_PUBLIC_AUTH_URL");
  }

  const response = await fetch(new URL("/api/graphql", applicationUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: requestHeaders.get("cookie") ?? "",
      "X-Request-ID": requestHeaders.get("x-request-id") ?? crypto.randomUUID(),
    },
    cache: "no-store",
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed with status ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0]?.message || "GraphQL request failed");
  }

  return result.data;
}
