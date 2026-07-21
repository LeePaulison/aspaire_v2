import { MongoClient } from "mongodb";

const globalForMongo = global;
let mongoClient = globalForMongo.mongoClient;

function getMongoClient() {
  if (mongoClient) return mongoClient;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI");
  }

  mongoClient = new MongoClient(uri);

  if (process.env.NODE_ENV !== "production") {
    globalForMongo.mongoClient = mongoClient;
  }

  return mongoClient;
}

export async function getMongoDatabase() {
  const client = getMongoClient();
  await client.connect();

  return client.db("saigely");
}
