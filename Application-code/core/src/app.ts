import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import mongoose from "mongoose";
import pinoHttp from "pino-http";

import taskRoutes from "./routes/taskRoutes";
import logger from "./config/logger";

const app = express();

app.disable("x-powered-by");

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
        };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
    customSuccessMessage(req, _res) {
      return `${req.method} ${req.url} completed`;
    },
    customErrorMessage(req, _res, error) {
      return `${req.method} ${req.url} failed: ${error.message}`;
    },
    customLogLevel(_req, res, error) {
      if (error || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  }),
);

app.use(cors());
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (_req: Request, res: Response) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "unavailable",
    database: connected ? "connected" : "disconnected",
  });
});

app.use("/api/tasks", taskRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next,
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error.type === "entity.parse.failed") {
    logger.warn(
      { err: error, method: req.method, url: req.url },
      "Invalid JSON request body",
    );
    res.status(400).json({ message: "Invalid JSON body" });
    return;
  }

  logger.error(
    { err: error, method: req.method, url: req.url },
    "Unhandled request error",
  );
  res.status(500).json({ message: "Internal server error" });
};

app.use(errorHandler);

export default app;