export type Category = "Study" | "Exercise" | "Chores" | "Personal" | "Work" | "Health";

export interface Task {
  id: string;
  text: string;
  category: Category;
  color: string | null;
  done: boolean;
  date: string;        // YYYY-MM-DD (due date)
  startTime: string | null; // HH:MM 24h
  endTime: string | null;
  notes: string;
  createdAt: number;
  completedAt: number | null;
  carriedFrom: string | null; // original date if carried forward
}

export const CATEGORIES: Category[] = ["Study", "Exercise", "Chores", "Personal", "Work", "Health"];

export const CATEGORY_COLORS: Record<Category, string> = {
  Study:    "#60a5fa",
  Exercise: "#f87171",
  Chores:   "#fbbf24",
  Personal: "#a78bfa",
  Work:     "#34d399",
  Health:   "#f472b6",
};

export const PALETTE: string[] = [
  "#34d399", "#fb923c", "#60a5fa", "#a78bfa",
  "#f87171", "#fbbf24", "#22d3ee", "#f472b6",
  "#facc15", "#4ade80", "#fb7185", "#818cf8",
];

export function getTaskColor(t: Task): string {
  return t.color ?? CATEGORY_COLORS[t.category];
}

export function todayStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateLabel(s: string): string {
  const d = parseDate(s);
  const today = todayStr();
  const yest = todayStr(new Date(Date.now() - 86400000));
  const tom = todayStr(new Date(Date.now() + 86400000));
  if (s === today) return "Today";
  if (s === yest) return "Yesterday";
  if (s === tom) return "Tomorrow";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: number;
  completions: string[]; // YYYY-MM-DD list
}

export const HABIT_EMOJIS = ["💧", "🏃", "📚", "🧘", "💪", "🥗", "😴", "✍️", "🎵", "🌱"];

export function computeStreak(completions: string[], today: string = todayStr()): { current: number; longest: number; doneToday: boolean } {
  const set = new Set(completions);
  const doneToday = set.has(today);
  // current streak: count back from today (or yesterday if today not done)
  let current = 0;
  let cursor = new Date();
  if (!doneToday) cursor.setDate(cursor.getDate() - 1);
  while (set.has(todayStr(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }
  // longest streak
  const sorted = [...set].sort();
  let longest = 0, run = 0, prev: Date | null = null;
  for (const s of sorted) {
    const d = parseDate(s);
    if (prev && (d.getTime() - prev.getTime()) === 86400000) run++;
    else run = 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  return { current, longest, doneToday };
}
