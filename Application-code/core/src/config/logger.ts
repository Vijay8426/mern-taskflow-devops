import pino from "pino";
import { env } from "./env";

const logger = pino({
  level: env.logLevel,
  redact: {
    paths: [
      "password",
      "token",
      "authorization",
      "*.password",
      "*.token",
    ],
    censor: "[REDACTED]",
  },
  ...(env.nodeEnv === "development" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  }),
});

export default logger;