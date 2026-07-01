import { MongoClient, Db, MongoClientOptions } from "mongodb";
import { validateEnv, validateChatEnv } from "./validateEnv";

validateEnv();
validateChatEnv();

const uri: string = process.env.MONGODB_URI!;

const options: MongoClientOptions = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
};

function getDatabaseName(): string {
  if (process.env.MONGODB_DB_NAME) {
    return process.env.MONGODB_DB_NAME;
  }

  const withoutQuery = uri.split("?")[0];
  const pathSegment = withoutQuery.split("/").pop();
  if (pathSegment && pathSegment.length > 0) {
    return pathSegment;
  }

  return "learning-platform";
}

type GlobalWithMongo = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

function createClientPromise(): Promise<MongoClient> {
  const client = new MongoClient(uri, options);
  return client.connect().catch((error) => {
    const globalWithMongo = global as GlobalWithMongo;
    globalWithMongo._mongoClientPromise = undefined;
    throw error;
  });
}

let productionClientPromise: Promise<MongoClient> | undefined;
let indexesEnsured = false;

async function ensureIndexes(db: Db): Promise<void> {
  if (indexesEnsured) return;
  indexesEnsured = true;

  const bg = { background: true };

  try {
    // users
    await db.collection("users").createIndex({ email: 1 }, { unique: true, ...bg });
    await db.collection("users").createIndex({ role: 1 }, bg);
    await db.collection("users").createIndex({ createdAt: -1 }, bg);

    // courses
    await db.collection("courses").createIndex({ slug: 1 }, { unique: true, ...bg });
    await db.collection("courses").createIndex({ createdAt: -1 }, bg);
    await db.collection("courses").createIndex({ "$**": "text" }, bg);

    // enrollments
    await db
      .collection("enrollments")
      .createIndex({ userId: 1, courseSlug: 1 }, { unique: true, ...bg });
    await db.collection("enrollments").createIndex({ status: 1 }, bg);
    await db.collection("enrollments").createIndex({ courseSlug: 1 }, bg);
    await db.collection("enrollments").createIndex({ createdAt: -1 }, bg);

    // lessonComments
    await db
      .collection("lessonComments")
      .createIndex({ courseSlug: 1, moduleIndex: 1, lessonIndex: 1 }, bg);
    await db.collection("lessonComments").createIndex({ userId: 1 }, bg);

    // discussions
    await db
      .collection("discussions")
      .createIndex({ courseSlug: 1, createdAt: -1 }, bg);

    // certificates
    await db
      .collection("certificates")
      .createIndex({ userId: 1, courseSlug: 1 }, { unique: true, ...bg });

    // chatConversations
    await db
      .collection("chatConversations")
      .createIndex({ participantsKey: 1 }, { unique: true, ...bg });

    // chatMessages
    await db
      .collection("chatMessages")
      .createIndex({ conversationId: 1, timestamp: -1 }, bg);

    // notifications
    await db
      .collection("notifications")
      .createIndex({ userId: 1, createdAt: -1 }, bg);
    await db.collection("notifications").createIndex({ userId: 1, read: 1 }, bg);
  } catch (error) {
    console.error("Failed to ensure database indexes:", error);
  }
}

function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as GlobalWithMongo;

    if (!globalWithMongo._mongoClientPromise) {
      globalWithMongo._mongoClientPromise = createClientPromise();
    }

    return globalWithMongo._mongoClientPromise;
  }

  if (!productionClientPromise) {
    productionClientPromise = createClientPromise();
  }

  return productionClientPromise;
}

const clientPromise = getClientPromise();

export default clientPromise;

export async function getDatabase(): Promise<Db> {
  try {
    const client = await getClientPromise();
    const db = client.db(getDatabaseName());
    await ensureIndexes(db);
    return db;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      const globalWithMongo = global as GlobalWithMongo;
      globalWithMongo._mongoClientPromise = undefined;
      productionClientPromise = undefined;
      const client = await getClientPromise();
      const db = client.db(getDatabaseName());
      await ensureIndexes(db);
      return db;
    }
    throw error;
  }
}
