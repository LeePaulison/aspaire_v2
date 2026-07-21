export const RECONNECT_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 15_000];

const NON_RETRYABLE_CLOSE_CODES = new Set([
  1000, // Normal closure
  1008, // Authentication, authorization, or rate-limit policy violation
  1009, // Payload too large
]);

export function shouldReconnect(closeCode) {
  return !NON_RETRYABLE_CLOSE_CODES.has(closeCode);
}

export function getReconnectDelay(attempt) {
  return RECONNECT_DELAYS_MS[attempt] ?? null;
}
