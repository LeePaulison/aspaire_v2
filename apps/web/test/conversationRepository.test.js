import assert from "node:assert/strict";
import test from "node:test";

import { ObjectId } from "mongodb";
import { createConversationRepository } from "../repositories/conversationRepository.js";

function databaseWithCollection(collection) {
  return { collection: (name) => {
    assert.equal(name, "conversations");
    return collection;
  } };
}

test("malformed conversation IDs are rejected without querying MongoDB", async () => {
  let databaseRequested = false;
  const repository = createConversationRepository({
    getDatabase: async () => {
      databaseRequested = true;
      return databaseWithCollection({});
    },
  });

  assert.equal(await repository.getConversationById("not-an-object-id"), null);
  await assert.rejects(
    repository.appendMessages({ conversationId: "bad", messages: [] }),
    /Invalid conversation ID/,
  );
  assert.equal(databaseRequested, false);
});

test("conversation lookup uses a validated ObjectId", async () => {
  const id = new ObjectId();
  let filter;
  const repository = createConversationRepository({
    getDatabase: async () => databaseWithCollection({
      findOne: async (value) => {
        filter = value;
        return { _id: id };
      },
    }),
  });

  const result = await repository.getConversationById(id.toString());

  assert.equal(result._id, id);
  assert.equal(filter._id.toString(), id.toString());
});

test("conversation summaries project the first message as their preview", async () => {
  let findOptions;
  const cursor = {
    sort() { return this; },
    async toArray() { return []; },
  };
  const repository = createConversationRepository({
    getDatabase: async () => databaseWithCollection({
      find: (_filter, options) => {
        findOptions = options;
        return cursor;
      },
    }),
  });

  await repository.getUserConversations("user-1");

  assert.equal(findOptions.projection.messages.$slice, 1);
});

test("new conversations store domain metadata", async () => {
  let inserted;
  const id = new ObjectId();
  const repository = createConversationRepository({
    getDatabase: async () => databaseWithCollection({
      insertOne: async (document) => {
        inserted = document;
        return { insertedId: id };
      },
    }),
  });

  await repository.createConversation({
    userId: "user-1",
    domain: "resume_analysis",
    domainId: "job-1",
    messages: [{ role: "user", content: "hello", createdAt: new Date() }],
  });

  assert.equal(inserted.userId, "user-1");
  assert.equal(inserted.domain, "resume_analysis");
  assert.equal(inserted.domainId, "job-1");
});

test("conversation list can be scoped by user and domain metadata", async () => {
  let filter;
  const cursor = {
    sort() { return this; },
    async toArray() { return []; },
  };
  const repository = createConversationRepository({
    getDatabase: async () => databaseWithCollection({
      find: (value) => {
        filter = value;
        return cursor;
      },
    }),
  });

  await repository.getUserConversations("user-1", {
    domain: "resume_analysis",
    domainId: "job-1",
  });

  assert.deepEqual(filter, {
    userId: "user-1",
    domain: "resume_analysis",
    domainId: "job-1",
  });
});

test("conversation deletion validates the ID before querying MongoDB", async () => {
  let databaseRequested = false;
  const repository = createConversationRepository({
    getDatabase: async () => {
      databaseRequested = true;
      return databaseWithCollection({});
    },
  });

  assert.equal(
    await repository.deleteConversation({
      conversationId: "invalid",
      userId: "user-1",
    }),
    false,
  );
  assert.equal(databaseRequested, false);
});

test("conversation deletion includes ownership in the atomic filter", async () => {
  const id = new ObjectId();
  let filter;
  const repository = createConversationRepository({
    getDatabase: async () =>
      databaseWithCollection({
        deleteOne: async (value) => {
          filter = value;
          return { deletedCount: 1 };
        },
      }),
  });

  const deleted = await repository.deleteConversation({
    conversationId: id.toString(),
    userId: "user-1",
  });

  assert.equal(deleted, true);
  assert.equal(filter._id.toString(), id.toString());
  assert.equal(filter.userId, "user-1");
});
