import mongoose from "mongoose";
import { env } from "../config/env.js";

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDB() {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is not defined in environment variables.");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(env.mongodbUri).then((m) => {
      console.log("Connected to MongoDB");
      return m;
    });
    connectionPromise.catch((error) => {
      console.error("Error connecting to MongoDB:", error);
      connectionPromise = null;
    });
  }

  await connectionPromise;
}

type DBHealth =
  | { status: "not_configured" }
  | { status: "disconnected"; readyState: number }
  | { status: "ok"; readyState: number }
  | { status: "error"; readyState: number };

export async function getDBHealth(): Promise<DBHealth> {
  if (!env.mongodbUri) {
    return { status: "not_configured" };
  }

  const readyState = mongoose.connection.readyState;
  if (readyState !== 1) {
    return { status: "disconnected", readyState };
  }

  try {
    await mongoose.connection.db?.admin().ping();
    return { status: "ok", readyState };
  } catch {
    return { status: "error", readyState };
  }
}