const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api";

export const env = {
  appName: import.meta.env.VITE_APP_NAME || "TaskFlow",
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
  apiBaseUrl: apiBaseUrl.replace(/\/+$/, ""),
} as const;