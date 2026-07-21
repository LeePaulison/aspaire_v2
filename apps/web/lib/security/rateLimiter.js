const windows = new Map();

export function checkRateLimit({
  key,
  limit = 120,
  windowMs = 60_000,
  now = Date.now(),
  store = windows,
}) {
  const current = store.get(key);
  if (!current || now - current.startedAt >= windowMs) {
    store.set(key, { startedAt: now, count: 1 });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  current.count += 1;
  if (current.count <= limit) {
    return { allowed: true, remaining: limit - current.count, retryAfterMs: 0 };
  }

  return {
    allowed: false,
    remaining: 0,
    retryAfterMs: Math.max(1, windowMs - (now - current.startedAt)),
  };
}
