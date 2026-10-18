import pino from "pino";

import { env } from "./env";

const isDevelopment = process.env.NODE_ENV !== "production";

const logger = pino({
  level: env.logLevel || (isDevelopment ? "debug" : "info"),
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "token",
      "accessToken",
      "refreshToken",
    ],
    censor: "[REDACTED]",
  },
  ...(isDevelopment
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: false,
            translateTime: "SYS:standard",
            singleLine: true,
          },
        },
      }
    : {}),
});

export default logger;