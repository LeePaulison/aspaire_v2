import { ObjectId } from "mongodb";

import { getMongoDatabase } from "../lib/db/mongo.js";

export function createConversationRepository({ getDatabase = getMongoDatabase } = {}) {
  async function createConversation({
    userId,
    domain = "general",
    domainId = null,
    messages,
  }) {
    const database = await getDatabase();

    const conversationsCollection = database.collection("conversations");

    const now = new Date();

    const result = await conversationsCollection.insertOne({
      userId,
      domain,
      domainId,

      createdAt: now,
      updatedAt: now,

      messages,
    });

    return {
      conversationId: result.insertedId.toString(),
      preview: messages[0].content,
      updatedAt: now.toISOString(),
    };
  }

  async function appendMessages({ conversationId, messages }) {
    if (!ObjectId.isValid(conversationId)) {
      throw new Error("Invalid conversation ID");
    }

    const database = await getDatabase();

    const conversationsCollection = database.collection("conversations");

    const now = new Date();

    await conversationsCollection.updateOne(
      {
        _id: new ObjectId(conversationId),
      },
      {
        $push: {
          messages: {
            $each: messages,
          },
        },

        $set: {
          updatedAt: now,
        },
      },
    );

    return {
      conversationId,
      preview: messages[0].content,
      updatedAt: now.toISOString(),
    };
  }

  async function getConversationById(conversationId) {
    if (!ObjectId.isValid(conversationId)) {
      return null;
    }

    const database = await getDatabase();

    const conversationsCollection = database.collection("conversations");

    return conversationsCollection.findOne({
      _id: new ObjectId(conversationId),
    });
  }

  async function getUserConversations(userId, { domain, domainId } = {}) {
    const database = await getDatabase();

    const conversationsCollection = database.collection("conversations");

    const filter = { userId };

    if (domain) {
      filter.domain = domain;
    }

    if (domainId) {
      filter.domainId = domainId;
    }

    return conversationsCollection
      .find(
        filter,
        {
          projection: {
            domain: 1,
            domainId: 1,
            updatedAt: 1,
            messages: {
              $slice: 1,
            },
          },
        },
      )
      .sort({
        updatedAt: -1,
      })
      .toArray();
  }

  async function deleteConversation({ conversationId, userId }) {
    if (!ObjectId.isValid(conversationId)) {
      return false;
    }

    const database = await getDatabase();
    const conversationsCollection = database.collection("conversations");
    const result = await conversationsCollection.deleteOne({
      _id: new ObjectId(conversationId),
      userId,
    });

    return result.deletedCount === 1;
  }

  return {
    createConversation,
    appendMessages,
    getConversationById,
    getUserConversations,
    deleteConversation,
  };
}

export const {
  createConversation,
  appendMessages,
  getConversationById,
  getUserConversations,
  deleteConversation,
} = createConversationRepository();
