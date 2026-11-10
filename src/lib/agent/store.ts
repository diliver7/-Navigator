import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export interface TodoItem {
  id: string;
  title: string;
  due?: string;
  priority: "high" | "medium" | "low";
  status: "open" | "done";
  createdAt: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

interface LocalData {
  todos: TodoItem[];
  notes: NoteItem[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "agent-store.json");

let queue: Promise<unknown> = Promise.resolve();

async function readData(): Promise<LocalData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalData>;
    return {
      todos: Array.isArray(parsed.todos) ? parsed.todos : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    };
  } catch {
    return { todos: [], notes: [] };
  }
}

async function writeData(data: LocalData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

/** 串行化读改写，避免并发工具调用相互覆盖 */
function mutate<T>(fn: (data: LocalData) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const data = await readData();
    const result = await fn(data);
    await writeData(data);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export async function listTodos(): Promise<TodoItem[]> {
  const data = await readData();
  return [...data.todos].sort((a, b) => b.createdAt - a.createdAt);
}

export function addTodo(input: {
  title: string;
  due?: string;
  priority?: TodoItem["priority"];
}): Promise<TodoItem> {
  return mutate((data) => {
    const todo: TodoItem = {
      id: randomUUID().slice(0, 8),
      title: input.title.slice(0, 120),
      due: input.due?.slice(0, 40),
      priority: input.priority ?? "medium",
      status: "open",
      createdAt: Date.now(),
    };
    data.todos.unshift(todo);
    return todo;
  });
}

export function completeTodo(id: string): Promise<TodoItem | null> {
  return mutate((data) => {
    const todo = data.todos.find((item) => item.id === id);
    if (!todo) return null;
    todo.status = "done";
    return todo;
  });
}

export async function listNotes(): Promise<NoteItem[]> {
  const data = await readData();
  return [...data.notes].sort((a, b) => b.createdAt - a.createdAt);
}

export function saveNote(input: { title: string; content: string }): Promise<NoteItem> {
  return mutate((data) => {
    const note: NoteItem = {
      id: randomUUID().slice(0, 8),
      title: input.title.slice(0, 80),
      content: input.content.slice(0, 4000),
      createdAt: Date.now(),
    };
    data.notes.unshift(note);
    return note;
  });
}
