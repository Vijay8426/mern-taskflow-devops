import mongoose from "mongoose";
import logger from "./logger";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  logger.info("MongoDB connected");
}