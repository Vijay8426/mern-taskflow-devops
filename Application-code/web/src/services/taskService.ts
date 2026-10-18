import { env } from "../config/env";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
} from "../types/task";

const API_URL = `${env.apiBaseUrl}/tasks`;

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body && typeof body.message === "string"
        ? body.message
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const taskService = {
  getAll(): Promise<Task[]> {
    return request<Task[]>(API_URL);
  },

  create(input: CreateTaskInput): Promise<Task> {
    return request<Task>(API_URL, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(id: string, input: UpdateTaskInput): Promise<Task> {
    return request<Task>(`${API_URL}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  delete(id: string): Promise<void> {
    return request<void>(`${API_URL}/${id}`, {
      method: "DELETE",
    });
  },
};