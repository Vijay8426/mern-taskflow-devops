import { useState, type FormEvent } from "react";

interface TaskFormProps {
  onAdd: (title: string) => Promise<void>;
}

export default function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = title.trim();

    if (!value || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      await onAdd(value);
      setTitle("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create task",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <form className="task-form" onSubmit={handleSubmit}>
        <input
          type="text"
          aria-label="Task title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add task"}
        </button>
      </form>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}