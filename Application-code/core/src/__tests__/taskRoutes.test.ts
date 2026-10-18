import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";


vi.mock("pino-http", () => ({
  default: () => (_req: unknown, _res: unknown, next: () => void) =>
    next(),
}));

vi.mock("../models/Task", () => ({
  default: {
    find: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

import app from "../app";
import Task from "../models/Task";

const validId = "507f1f77bcf86cd799439011";

const sampleTask = {
  _id: validId,
  title: "Write tests",
  completed: false,
  createdAt: "2026-10-18T10:00:00.000Z",
  updatedAt: "2026-10-18T10:00:00.000Z",
};

describe("Task API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns tasks", async () => {
    vi.mocked(Task.find).mockReturnValue({
      sort: vi.fn().mockResolvedValue([sampleTask]),
    } as never);

    const response = await request(app).get("/api/tasks");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([sampleTask]);
    expect(Task.find).toHaveBeenCalledOnce();
  });

  it("creates a task with a trimmed title", async () => {
    vi.mocked(Task.create).mockResolvedValue(sampleTask as never);

    const response = await request(app)
      .post("/api/tasks")
      .send({ title: "  Write tests  " });

    expect(response.status).toBe(201);
    expect(Task.create).toHaveBeenCalledWith({ title: "Write tests" });
    expect(response.body.title).toBe("Write tests");
  });

  it("rejects an empty title", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({ title: "   " });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Title must contain 1–200 characters",
    );
    expect(Task.create).not.toHaveBeenCalled();
  });

  it("rejects a title longer than 200 characters", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({ title: "a".repeat(201) });

    expect(response.status).toBe(400);
    expect(Task.create).not.toHaveBeenCalled();
  });

  it("updates a task", async () => {
    vi.mocked(Task.findByIdAndUpdate).mockResolvedValue({
      ...sampleTask,
      completed: true,
    } as never);

    const response = await request(app)
      .patch(`/api/tasks/${validId}`)
      .send({ completed: true });

    expect(response.status).toBe(200);
    expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(
      validId,
      { completed: true },
      { new: true, runValidators: true },
    );
    expect(response.body.completed).toBe(true);
  });

  it("rejects an invalid task ID for updates", async () => {
    const response = await request(app)
      .patch("/api/tasks/not-an-id")
      .send({ completed: true });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid task ID");
    expect(Task.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("returns 404 when the task to update does not exist", async () => {
    vi.mocked(Task.findByIdAndUpdate).mockResolvedValue(null);

    const response = await request(app)
      .patch(`/api/tasks/${validId}`)
      .send({ completed: true });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Task not found");
  });

  it("deletes a task", async () => {
    vi.mocked(Task.findByIdAndDelete).mockResolvedValue(sampleTask as never);

    const response = await request(app).delete(`/api/tasks/${validId}`);

    expect(response.status).toBe(204);
    expect(Task.findByIdAndDelete).toHaveBeenCalledWith(validId);
  });

  it("rejects an invalid task ID for deletion", async () => {
    const response = await request(app).delete("/api/tasks/not-an-id");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid task ID");
    expect(Task.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("returns 404 for unknown routes", async () => {
    const response = await request(app).get("/api/unknown");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Route not found");
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .set("Content-Type", "application/json")
      .send('{"title":');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid JSON body");
  });
});