import assert from "node:assert/strict";
import test from "node:test";

import nextConfig, { contentSecurityPolicy } from "../next.config.mjs";

test("all application routes receive baseline browser security headers", async () => {
  const [{ headers }] = await nextConfig.headers();
  const values = Object.fromEntries(headers.map(({ key, value }) => [key, value]));

  assert.match(values["Content-Security-Policy"], /frame-ancestors 'none'/);
  assert.match(values["Content-Security-Policy"], /object-src 'none'/);
  assert.equal(values["X-Content-Type-Options"], "nosniff");
  assert.equal(values["X-Frame-Options"], "DENY");
  assert.match(values["Permissions-Policy"], /camera=\(\)/);
});

test("unsafe eval is allowed only for React development tooling", () => {
  assert.match(contentSecurityPolicy("development"), /'unsafe-eval'/);
  assert.doesNotMatch(contentSecurityPolicy("production"), /'unsafe-eval'/);
});

test("insecure WebSockets are allowed only for local development", () => {
  assert.match(contentSecurityPolicy("development"), /connect-src[^;]+ ws:/);
  assert.doesNotMatch(contentSecurityPolicy("production"), /connect-src[^;]+ ws:/);
});
