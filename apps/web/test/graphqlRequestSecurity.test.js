import assert from "node:assert/strict";
import test from "node:test";

import { validateGraphqlRequest } from "../lib/security/graphqlRequest.js";

test("production GraphQL only accepts POST requests", async () => {
  const result = await validateGraphqlRequest({
    request: new Request("https://app.example.test/api/graphql"),
    maxBodyBytes: 1024,
    production: true,
  });
  assert.equal(result.status, 405);
  assert.equal(result.headers.Allow, "POST");
});

test("GraphQL rejects non-JSON and oversized request bodies", async () => {
  const nonJson = await validateGraphqlRequest({
    request: new Request("https://app.example.test/api/graphql", { method: "POST", body: "query" }),
    maxBodyBytes: 1024,
    production: true,
  });
  assert.equal(nonJson.status, 415);

  const oversized = await validateGraphqlRequest({
    request: new Request("https://app.example.test/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "x".repeat(100) }),
    }),
    maxBodyBytes: 32,
    production: true,
  });
  assert.equal(oversized.status, 413);
  assert.ok(oversized.bodyBytes > 32);
});
