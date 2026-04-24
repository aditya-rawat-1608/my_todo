import { Task, Habit, todayStr } from "@/components/todo/types";

const TASKS_KEY = "lt-tasks-v2";
const HABITS_KEY = "lt-habits-v1";
const META_KEY = "lt-meta-v1";

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch { return []; }
}
export function saveTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function loadHabits(): Habit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch { return []; }
}
export function saveHabits(habits: Habit[]) {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

interface Meta { lastOpened: string }
export function loadMeta(): Meta {
  if (typeof window === "undefined") return { lastOpened: todayStr() };
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return { lastOpened: todayStr() };
    return JSON.parse(raw);
  } catch { return { lastOpened: todayStr() }; }
}
export function saveMeta(m: Meta) {
  localStorage.setItem(META_KEY, JSON.stringify(m));
}
