import assert from "node:assert/strict";
import test from "node:test";

import { createConversationResolvers } from "../graphql/resolvers/conversations.js";

function createRepository(overrides = {}) {
  return {
    appendMessages: async () => assert.fail("unexpected appendMessages call"),
    createConversation: async () => assert.fail("unexpected createConversation call"),
    getConversationById: async () => assert.fail("unexpected getConversationById call"),
    getUserConversations: async () => assert.fail("unexpected getUserConversations call"),
    deleteConversation: async () => assert.fail("unexpected deleteConversation call"),
    ...overrides,
  };
}

test("unauthenticated users cannot read or save conversations", async () => {
  const resolvers = createConversationResolvers(createRepository());
  const context = { authenticated: false, user: null };

  assert.deepEqual(await resolvers.Query.conversations(null, null, context), []);
  assert.equal(await resolvers.Query.conversation(null, { id: "id" }, context), null);
  await assert.rejects(
    resolvers.Mutation.saveConversationTurn(null, { input: {} }, context),
    /Unauthorized/,
  );
  await assert.rejects(
    resolvers.Mutation.deleteConversation(null, { id: "id" }, context),
    /Unauthorized/,
  );
});

test("conversation deletion is scoped to the authenticated user", async () => {
  let received;
  const repository = createRepository({
    deleteConversation: async (input) => {
      received = input;
      return true;
    },
  });
  const resolvers = createConversationResolvers(repository);

  const result = await resolvers.Mutation.deleteConversation(
    null,
    { id: "conversation-id" },
    { authenticated: true, user: { id: "user-1" } },
  );

  assert.equal(result, true);
  assert.deepEqual(received, {
    conversationId: "conversation-id",
    userId: "user-1",
  });
});

test("conversation reads do not expose another user's data", async () => {
  const repository = createRepository({
    getConversationById: async () => ({ userId: "another-user" }),
  });
  const resolvers = createConversationResolvers(repository);

  const result = await resolvers.Query.conversation(
    null,
    { id: "conversation-id" },
    { authenticated: true, user: { id: "current-user" } },
  );

  assert.equal(result, null);
});

test("new turns are created for the authenticated user", async () => {
  let received;
  const repository = createRepository({
    createConversation: async (input) => {
      received = input;
      return { conversationId: "new-id" };
    },
  });
  const resolvers = createConversationResolvers(repository);

  const result = await resolvers.Mutation.saveConversationTurn(
    null,
    { input: { conversationId: null, userMessage: "hello", assistantMessage: "hi" } },
    { authenticated: true, user: { id: "user-1" } },
  );

  assert.equal(result.conversationId, "new-id");
  assert.equal(received.userId, "user-1");
  assert.deepEqual(received.messages.map(({ role, content }) => ({ role, content })), [
    { role: "user", content: "hello" },
    { role: "assistant", content: "hi" },
  ]);
  assert.ok(received.messages.every((message) => message.createdAt instanceof Date));
});

test("existing turns require ownership before append", async () => {
  let appended = false;
  const repository = createRepository({
    getConversationById: async () => ({ userId: "another-user" }),
    appendMessages: async () => {
      appended = true;
    },
  });
  const resolvers = createConversationResolvers(repository);

  await assert.rejects(
    resolvers.Mutation.saveConversationTurn(
      null,
      { input: { conversationId: "existing-id", userMessage: "hello", assistantMessage: "hi" } },
      { authenticated: true, user: { id: "user-1" } },
    ),
    /Conversation not found/,
  );
  assert.equal(appended, false);
});
