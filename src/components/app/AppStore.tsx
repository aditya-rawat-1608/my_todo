import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { Task, Habit, todayStr, computeStreak } from "@/components/todo/types";
import { loadTasks, saveTasks, loadHabits, saveHabits, loadMeta, saveMeta } from "@/lib/storage";
import { toast } from "sonner";

interface AppCtx {
  tasks: Task[];
  habits: Habit[];
  hydrated: boolean;
  today: string;
  addTask: (t: Omit<Task, "id" | "createdAt" | "completedAt" | "carriedFrom">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  reorderTasks: (next: Task[]) => void;
  addHabit: (h: Omit<Habit, "id" | "createdAt" | "completions">) => void;
  toggleHabit: (id: string, date?: string) => void;
  removeHabit: (id: string) => void;
  renameHabit: (id: string, name: string) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [today, setToday] = useState<string>(todayStr());
  const rolledRef = useRef(false);

  useEffect(() => {
    const t = loadTasks();
    const h = loadHabits();
    const meta = loadMeta();
    const now = todayStr();

    // Daily rollover: pending tasks from previous days get carried to today
    if (meta.lastOpened !== now && !rolledRef.current) {
      rolledRef.current = true;
      const updated = t.map((task) => {
        if (!task.done && task.date < now) {
          return { ...task, date: now, carriedFrom: task.carriedFrom ?? task.date };
        }
        return task;
      });
      setTasks(updated);
      saveTasks(updated);
      const carried = updated.filter((x) => x.carriedFrom && x.date === now && !x.done).length;
      if (carried > 0) {
        setTimeout(() => toast(`${carried} pending task${carried === 1 ? "" : "s"} carried to today`), 400);
      }
    } else {
      setTasks(t);
    }
    setHabits(h);
    saveMeta({ lastOpened: now });
    setToday(now);
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) saveTasks(tasks); }, [tasks, hydrated]);
  useEffect(() => { if (hydrated) saveHabits(habits); }, [habits, hydrated]);

  const value: AppCtx = useMemo(() => ({
    tasks, habits, hydrated, today,
    addTask: (input) => {
      const newTask: Task = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        completedAt: null,
        carriedFrom: null,
        ...input,
      };
      setTasks((p) => [newTask, ...p]);
    },
    updateTask: (id, patch) =>
      setTasks((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    toggleTask: (id) =>
      setTasks((p) => p.map((t) => (t.id === id
        ? { ...t, done: !t.done, completedAt: !t.done ? Date.now() : null }
        : t))),
    removeTask: (id) => setTasks((p) => p.filter((t) => t.id !== id)),
    reorderTasks: (next) => setTasks(next),
    addHabit: (input) => {
      const h: Habit = { id: crypto.randomUUID(), createdAt: Date.now(), completions: [], ...input };
      setHabits((p) => [...p, h]);
    },
    toggleHabit: (id, date = todayStr()) => {
      setHabits((prev) => prev.map((h) => {
        if (h.id !== id) return h;
        const has = h.completions.includes(date);
        const completions = has ? h.completions.filter((d) => d !== date) : [...h.completions, date];
        // celebrate
        if (!has && date === todayStr()) {
          const next = computeStreak(completions);
          setTimeout(() => {
            if (next.current === 1) toast.success(`Nice start! Day 1 of ${h.name} 🌱`);
            else if ([3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365].includes(next.current))
              toast.success(`🔥 ${next.current}-day streak on ${h.name}! Keep going!`, { duration: 4500 });
            else toast(`${h.emoji} ${next.current}-day streak — ${h.name}`);
          }, 50);
        }
        return { ...h, completions };
      }));
    },
    removeHabit: (id) => setHabits((p) => p.filter((h) => h.id !== id)),
    renameHabit: (id, name) => setHabits((p) => p.map((h) => h.id === id ? { ...h, name } : h)),
  }), [tasks, habits, hydrated, today]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be inside AppProvider");
  return v;
}
