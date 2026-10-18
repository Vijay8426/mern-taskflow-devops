import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../App";
import { taskService } from "../services/taskService";
import type { Task } from "../types/task";

vi.mock("../services/taskService", () => ({
  taskService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const task: Task = {
  _id: "507f1f77bcf86cd799439011",
  title: "Write tests",
  completed: false,
  createdAt: "2026-10-18T10:00:00.000Z",
  updatedAt: "2026-10-18T10:00:00.000Z",
};

describe("TaskFlow application", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the heading and loads tasks", async () => {
    vi.mocked(taskService.getAll).mockResolvedValue([task]);

    render(<App />);

    expect(
      screen.getByRole("heading", { name: "TaskFlow" }),
    ).toBeInTheDocument();

    expect(await screen.findByText("Write tests")).toBeInTheDocument();
    expect(screen.getByText("1 remaining")).toBeInTheDocument();
  });

  it("shows an empty state when there are no tasks", async () => {
    vi.mocked(taskService.getAll).mockResolvedValue([]);

    render(<App />);

    expect(
      await screen.findByText("No tasks yet. Add your first task."),
    ).toBeInTheDocument();
  });

  it("creates a task and reloads the list", async () => {
    const user = userEvent.setup();
    const createdTask: Task = {
      ...task,
      _id: "507f1f77bcf86cd799439012",
      title: "Test GitHub Actions",
    };

    vi.mocked(taskService.getAll)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([createdTask]);

    vi.mocked(taskService.create).mockResolvedValue(createdTask);

    render(<App />);

    const input = screen.getByRole("textbox", { name: "Task title" });

    await user.type(input, "Test GitHub Actions");
    await user.click(screen.getByRole("button", { name: "Add task" }));

    expect(taskService.create).toHaveBeenCalledWith({
      title: "Test GitHub Actions",
    });

    expect(
      await screen.findByText("Test GitHub Actions"),
    ).toBeInTheDocument();
  });

  it("shows an error when task creation fails", async () => {
    const user = userEvent.setup();

    vi.mocked(taskService.getAll).mockResolvedValue([]);
    vi.mocked(taskService.create).mockRejectedValue(
      new Error("Unable to create task"),
    );

    render(<App />);

    const input = screen.getByRole("textbox", { name: "Task title" });

    await user.type(input, "Broken task");
    await user.click(screen.getByRole("button", { name: "Add task" }));

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Unable to create task");
  });

  it("shows a retryable error when initial task loading fails", async () => {
    vi.mocked(taskService.getAll).mockRejectedValue(
      new Error("API unavailable"),
    );

    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "API unavailable",
    );

    expect(
      screen.getByRole("button", { name: "Retry" }),
    ).toBeInTheDocument();
  });

  it("marks a task complete through the API", async () => {
    const user = userEvent.setup();

    vi.mocked(taskService.getAll)
      .mockResolvedValueOnce([task])
      .mockResolvedValueOnce([{ ...task, completed: true }]);

    vi.mocked(taskService.update).mockResolvedValue({
      ...task,
      completed: true,
    });

    render(<App />);

    const checkbox = await screen.findByRole("checkbox", {
      name: "Mark Write tests as complete",
    });

    await user.click(checkbox);

    expect(taskService.update).toHaveBeenCalledWith(task._id, {
      completed: true,
    });
  });

  it("deletes a task through the API", async () => {
    const user = userEvent.setup();

    vi.mocked(taskService.getAll)
      .mockResolvedValueOnce([task])
      .mockResolvedValueOnce([]);

    vi.mocked(taskService.delete).mockResolvedValue(undefined);

    render(<App />);

    await user.click(
      await screen.findByRole("button", { name: "Delete Write tests" }),
    );

    expect(taskService.delete).toHaveBeenCalledWith(task._id);

    expect(
      await screen.findByText("No tasks yet. Add your first task."),
    ).toBeInTheDocument();
  });
});