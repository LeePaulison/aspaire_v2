import assert from "node:assert/strict";
import test from "node:test";

import {
  getReconnectDelay,
  RECONNECT_DELAYS_MS,
  shouldReconnect,
} from "../lib/chat/reconnect.js";

test("reconnection uses the bounded MVP retry schedule", () => {
  assert.deepEqual(RECONNECT_DELAYS_MS, [1_000, 2_000, 4_000, 8_000, 15_000]);
  assert.equal(getReconnectDelay(0), 1_000);
  assert.equal(getReconnectDelay(4), 15_000);
  assert.equal(getReconnectDelay(5), null);
});

test("only transient and abnormal closures reconnect", () => {
  assert.equal(shouldReconnect(1000), false);
  assert.equal(shouldReconnect(1008), false);
  assert.equal(shouldReconnect(1009), false);
  assert.equal(shouldReconnect(1001), true);
  assert.equal(shouldReconnect(1006), true);
  assert.equal(shouldReconnect(1011), true);
});
