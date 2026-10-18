import "dotenv/config";

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;

  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function getPort(): number {
  const rawPort = getEnv("PORT", "8000");
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid port number");
  }

  return port;
}

export const env = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: getPort(),
  mongoUri: getEnv("MONGODB_URI"),
  logLevel: getEnv("LOG_LEVEL", "debug"),
} as const;