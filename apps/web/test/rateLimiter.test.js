import assert from "node:assert/strict";
import test from "node:test";

import { checkRateLimit } from "../lib/security/rateLimiter.js";

test("rate limiter blocks excess requests and resets after its window", () => {
  const store = new Map();

  assert.equal(checkRateLimit({ key: "ip", limit: 2, now: 0, store }).allowed, true);
  assert.equal(checkRateLimit({ key: "ip", limit: 2, now: 1, store }).allowed, true);
  const blocked = checkRateLimit({ key: "ip", limit: 2, now: 2, store });
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterMs > 0);
  assert.equal(checkRateLimit({ key: "ip", limit: 2, now: 60_000, store }).allowed, true);
});
