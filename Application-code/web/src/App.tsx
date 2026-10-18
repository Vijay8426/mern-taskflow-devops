import { useCallback, useEffect, useState } from "react";
import TaskForm from "./components/taskForm";
import TaskList from "./components/taskList";
import { env } from "./config/env";
import { taskService } from "./services/taskService";
import type { Task } from "./types/task";
import "./App.css";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = useCallback(async () => {
    try {
      const result = await taskService.getAll();
      setTasks(result);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load tasks",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  async function addTask(title: string): Promise<void> {
    await taskService.create({ title });
    await loadTasks();
  }

  async function toggleTask(task: Task): Promise<void> {
    try {
      setError("");
      await taskService.update(task._id, {
        completed: !task.completed,
      });
      await loadTasks();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update task",
      );
    }
  }

  async function deleteTask(id: string): Promise<void> {
    try {
      setError("");
      await taskService.delete(id);
      await loadTasks();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete task",
      );
    }
  }

  const remaining = tasks.filter((task) => !task.completed).length;

  return (
    <main className="container">
      <header className="page-header">
        <p className="eyebrow">MERN · DEVOPS</p>
        <h1>{env.appName}</h1>
        <p>Simple tasks, reliable infrastructure.</p>
      </header>

      <section className="task-card">
        <div className="section-heading">
          <h2>Your tasks</h2>
          <span className="task-badge">{tasks.length}</span>
        </div>

        <TaskForm onAdd={addTask} />

        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => void loadTasks()}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <p className="empty-state">Loading tasks...</p>
        ) : (
          <TaskList
            tasks={tasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
          />
        )}

        <footer className="task-footer">
          <span>{remaining} remaining</span>
          <span>v{env.appVersion}</span>
        </footer>
      </section>
    </main>
  );
}