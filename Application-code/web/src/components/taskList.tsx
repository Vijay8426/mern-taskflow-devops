import type { Task } from "../types/task";

interface TaskListProps {
  tasks: Task[];
  onToggle: (task: Task) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TaskList({
  tasks,
  onToggle,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="empty-state">
        No tasks yet. Add your first task.
      </p>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li className="task-item" key={task._id}>
          <label className="task-label">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => void onToggle(task)}
              aria-label={`Mark ${task.title} as ${
                task.completed ? "incomplete" : "complete"
              }`}
            />

            <span className={task.completed ? "completed" : ""}>
              {task.title}
            </span>
          </label>

          <button
            type="button"
            className="delete-button"
            aria-label={`Delete ${task.title}`}
            onClick={() => void onDelete(task._id)}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}