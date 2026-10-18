import mongoose from "mongoose";

import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import logger from "./config/logger";

async function startServer(): Promise<void> {
  await connectDB();

  const server = app.listen(env.port, "0.0.0.0", () => {
    logger.info(`Server running on http://localhost:${env.port}`);
  });

  const shutdown = (signal: string): void => {
    logger.info({ signal }, "Shutdown signal received");

    server.close(() => {
      void mongoose.disconnect().finally(() => process.exit(0));
    });

    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((error: unknown) => {
  logger.fatal({ err: error }, "Server startup failed");
  process.exitCode = 1;
});