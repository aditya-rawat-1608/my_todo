export type Category = "Study" | "Exercise" | "Chores" | "Personal";

export interface Task {
  id: string;
  text: string;
  category: Category;
  color: string | null; // overrides category color when set
  done: boolean;
  createdAt: number;
}

export const CATEGORIES: Category[] = ["Study", "Exercise", "Chores", "Personal"];

export const CATEGORY_COLORS: Record<Category, string> = {
  Study: "#60a5fa",      // blue
  Exercise: "#f87171",   // red
  Chores: "#fbbf24",     // amber
  Personal: "#a78bfa",   // violet
};

export const PALETTE: string[] = [
  "#60a5fa", "#f87171", "#fbbf24", "#a78bfa",
  "#34d399", "#f472b6", "#fb923c", "#22d3ee",
];

export function getTaskColor(t: Task): string {
  return t.color ?? CATEGORY_COLORS[t.category];
}