import { Collection, Db, MongoClient } from "mongodb";
import { PasswordResetOtpDocument, UserDocument } from "@/types/auth";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "sawera";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getMongoDb() {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  const client = new MongoClient(uri);
  await client.connect();

  cachedClient = client;
  cachedDb = client.db(dbName);

  await ensureIndexes(cachedDb);

  return cachedDb;
}

export async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const db = await getMongoDb();
  return db.collection<UserDocument>("users");
}

export async function getPasswordResetOtpsCollection(): Promise<Collection<PasswordResetOtpDocument>> {
  const db = await getMongoDb();
  return db.collection<PasswordResetOtpDocument>("passwordResetOtps");
}

async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection<UserDocument>("users").createIndex({ email: 1 }, { unique: true }),
    db.collection<PasswordResetOtpDocument>("passwordResetOtps").createIndex({ email: 1, createdAt: -1 }),
    db.collection<PasswordResetOtpDocument>("passwordResetOtps").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  ]);
}
