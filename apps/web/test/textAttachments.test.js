import assert from "node:assert/strict";
import test from "node:test";

import {
  createChatSocketMessage,
  getChatPayloadByteLength,
  MAX_CHAT_PAYLOAD_BYTES,
  serializeTextAttachments,
} from "../lib/chat/textAttachments.js";

test("payload measurement uses the complete serialized WebSocket frame", () => {
  const ascii = createChatSocketMessage({ content: "hello", conversationId: null });
  const unicode = createChatSocketMessage({ content: "🙂", conversationId: null });

  assert.equal(
    getChatPayloadByteLength(ascii),
    new TextEncoder().encode(JSON.stringify(ascii)).byteLength,
  );
  assert.equal(
    getChatPayloadByteLength(unicode),
    new TextEncoder().encode(JSON.stringify(unicode)).byteLength,
  );
});

test("JSON escaping is included in attachment payload measurement", () => {
  const content = "\\\"".repeat(200_000);
  const serialized = serializeTextAttachments("review", [{
    name: "escaped.txt",
    type: "text/plain",
    size: content.length,
    content,
  }]);

  const socketMessage = createChatSocketMessage({
    content: serialized,
    conversationId: "conversation-id",
  });

  assert.ok(getChatPayloadByteLength(socketMessage) > MAX_CHAT_PAYLOAD_BYTES);
});
