import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { Task, Habit, todayStr, computeStreak } from "@/components/todo/types";
import { loadTasks, saveTasks, loadHabits, saveHabits, loadMeta, saveMeta } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";

interface AppCtx {
  tasks: Task[];
  habits: Habit[];
  hydrated: boolean;
  today: string;
  cloud: boolean;
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

// ---------- Mappers between DB rows and app types ----------
type TaskRow = {
  id: string; user_id: string; text: string; category: string; color: string | null;
  done: boolean; date: string; start_time: string | null; end_time: string | null;
  notes: string; carried_from: string | null; position: number;
  completed_at: string | null; created_at: string;
};
type HabitRow = {
  id: string; user_id: string; name: string; emoji: string; color: string;
  position: number; created_at: string;
};
type CompletionRow = { habit_id: string; date: string };

function rowToTask(r: TaskRow): Task {
  return {
    id: r.id, text: r.text, category: r.category as Task["category"], color: r.color,
    done: r.done, date: r.date, startTime: r.start_time, endTime: r.end_time,
    notes: r.notes, carriedFrom: r.carried_from,
    createdAt: new Date(r.created_at).getTime(),
    completedAt: r.completed_at ? new Date(r.completed_at).getTime() : null,
  };
}
function taskToInsert(t: Task, userId: string, position: number) {
  return {
    id: t.id, user_id: userId, text: t.text, category: t.category, color: t.color,
    done: t.done, date: t.date, start_time: t.startTime, end_time: t.endTime,
    notes: t.notes, carried_from: t.carriedFrom, position,
    completed_at: t.completedAt ? new Date(t.completedAt).toISOString() : null,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const cloud = !!user;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [today] = useState<string>(todayStr());
  const rolledRef = useRef(false);
  const migratedKey = user ? `lt-migrated-${user.id}` : null;

  // ---------- Hydration: local OR cloud ----------
  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    setHydrated(false);

    (async () => {
      if (!user) {
        // Local mode
        const t = loadTasks();
        const h = loadHabits();
        const meta = loadMeta();
        const now = todayStr();
        let tasksFinal = t;
        if (meta.lastOpened !== now && !rolledRef.current) {
          rolledRef.current = true;
          tasksFinal = t.map((task) => (!task.done && task.date < now)
            ? { ...task, date: now, carriedFrom: task.carriedFrom ?? task.date } : task);
          saveTasks(tasksFinal);
          const carried = tasksFinal.filter((x) => x.carriedFrom && x.date === now && !x.done).length;
          if (carried > 0) setTimeout(() => toast(`${carried} pending task${carried === 1 ? "" : "s"} carried to today`), 400);
        }
        saveMeta({ lastOpened: now });
        if (!cancelled) {
          setTasks(tasksFinal);
          setHabits(h);
          setHydrated(true);
        }
        return;
      }

      // Cloud mode: optionally migrate local data once per user, then fetch
      const migrated = localStorage.getItem(migratedKey!) === "1";
      if (!migrated) {
        const localT = loadTasks();
        const localH = loadHabits();
        if (localT.length > 0) {
          const rows = localT.map((t, i) => taskToInsert(t, user.id, i));
          const { error } = await supabase.from("tasks").insert(rows);
          if (error && !error.message.toLowerCase().includes("duplicate")) {
            console.error("migrate tasks", error);
          }
        }
        if (localH.length > 0) {
          const habitRows = localH.map((h, i) => ({
            id: h.id, user_id: user.id, name: h.name, emoji: h.emoji, color: h.color, position: i,
          }));
          const { error: he } = await supabase.from("habits").insert(habitRows);
          if (he && !he.message.toLowerCase().includes("duplicate")) console.error("migrate habits", he);
          const completions = localH.flatMap((h) => h.completions.map((d) => ({
            habit_id: h.id, user_id: user.id, date: d,
          })));
          if (completions.length > 0) {
            const { error: ce } = await supabase.from("habit_completions").insert(completions);
            if (ce && !ce.message.toLowerCase().includes("duplicate")) console.error("migrate completions", ce);
          }
        }
        localStorage.setItem(migratedKey!, "1");
        if (localT.length + localH.length > 0) {
          setTimeout(() => toast.success("Your local data was uploaded to your account."), 400);
        }
      }

      // Fetch from cloud
      const [tRes, hRes, cRes] = await Promise.all([
        supabase.from("tasks").select("*").order("position", { ascending: true }),
        supabase.from("habits").select("*").order("position", { ascending: true }),
        supabase.from("habit_completions").select("habit_id,date"),
      ]);
      if (cancelled) return;
      const fetchedTasks = (tRes.data ?? []).map(rowToTask);

      // Cloud-side rollover: pending tasks before today move to today
      const pending = fetchedTasks.filter((t) => !t.done && t.date < today);
      if (pending.length > 0) {
        const updates = pending.map((t) => ({
          id: t.id,
          date: today,
          carried_from: t.carriedFrom ?? t.date,
        }));
        // upsert one-by-one update calls in parallel
        await Promise.all(updates.map((u) =>
          supabase.from("tasks").update({ date: u.date, carried_from: u.carried_from }).eq("id", u.id)
        ));
        for (const t of fetchedTasks) {
          if (!t.done && t.date < today) {
            t.carriedFrom = t.carriedFrom ?? t.date;
            t.date = today;
          }
        }
        setTimeout(() => toast(`${pending.length} pending task${pending.length === 1 ? "" : "s"} carried to today`), 400);
      }

      const completionsByHabit = new Map<string, string[]>();
      for (const c of (cRes.data ?? []) as CompletionRow[]) {
        const arr = completionsByHabit.get(c.habit_id) ?? [];
        arr.push(c.date);
        completionsByHabit.set(c.habit_id, arr);
      }
      const fetchedHabits: Habit[] = ((hRes.data ?? []) as HabitRow[]).map((h) => ({
        id: h.id, name: h.name, emoji: h.emoji, color: h.color,
        createdAt: new Date(h.created_at).getTime(),
        completions: completionsByHabit.get(h.id) ?? [],
      }));

      setTasks(fetchedTasks);
      setHabits(fetchedHabits);
      setHydrated(true);
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user?.id]);

  // ---------- Local persistence (only when signed out) ----------
  useEffect(() => { if (hydrated && !cloud) saveTasks(tasks); }, [tasks, hydrated, cloud]);
  useEffect(() => { if (hydrated && !cloud) saveHabits(habits); }, [habits, hydrated, cloud]);

  const value: AppCtx = useMemo(() => ({
    tasks, habits, hydrated, today, cloud,

    addTask: (input) => {
      const id = crypto.randomUUID();
      const newTask: Task = {
        id, createdAt: Date.now(), completedAt: null, carriedFrom: null, ...input,
      };
      setTasks((p) => [newTask, ...p]);
      if (cloud && user) {
        supabase.from("tasks").insert(taskToInsert(newTask, user.id, -Date.now()))
          .then(({ error }) => { if (error) { toast.error("Failed to save task"); console.error(error); } });
      }
    },
    updateTask: (id, patch) => {
      setTasks((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      if (cloud) {
        const dbPatch: Record<string, unknown> = {};
        if ("text" in patch) dbPatch.text = patch.text;
        if ("category" in patch) dbPatch.category = patch.category;
        if ("color" in patch) dbPatch.color = patch.color;
        if ("done" in patch) dbPatch.done = patch.done;
        if ("date" in patch) dbPatch.date = patch.date;
        if ("startTime" in patch) dbPatch.start_time = patch.startTime;
        if ("endTime" in patch) dbPatch.end_time = patch.endTime;
        if ("notes" in patch) dbPatch.notes = patch.notes;
        if ("carriedFrom" in patch) dbPatch.carried_from = patch.carriedFrom;
        if ("completedAt" in patch) dbPatch.completed_at = patch.completedAt ? new Date(patch.completedAt).toISOString() : null;
        if (Object.keys(dbPatch).length > 0) {
          supabase.from("tasks").update(dbPatch).eq("id", id)
            .then(({ error }) => { if (error) console.error("update task", error); });
        }
      }
    },
    toggleTask: (id) => {
      let next: Task | undefined;
      setTasks((p) => p.map((t) => {
        if (t.id !== id) return t;
        next = { ...t, done: !t.done, completedAt: !t.done ? Date.now() : null };
        return next;
      }));
      if (cloud && next) {
        supabase.from("tasks").update({
          done: next.done,
          completed_at: next.completedAt ? new Date(next.completedAt).toISOString() : null,
        }).eq("id", id).then(({ error }) => { if (error) console.error(error); });
      }
    },
    removeTask: (id) => {
      setTasks((p) => p.filter((t) => t.id !== id));
      if (cloud) {
        supabase.from("tasks").delete().eq("id", id)
          .then(({ error }) => { if (error) console.error(error); });
      }
    },
    reorderTasks: (next) => {
      setTasks(next);
      if (cloud) {
        const updates = next.map((t, i) =>
          supabase.from("tasks").update({ position: i }).eq("id", t.id)
        );
        Promise.all(updates).catch((e) => console.error("reorder", e));
      }
    },

    addHabit: (input) => {
      const id = crypto.randomUUID();
      const h: Habit = { id, createdAt: Date.now(), completions: [], ...input };
      setHabits((p) => [...p, h]);
      if (cloud && user) {
        supabase.from("habits").insert({
          id, user_id: user.id, name: h.name, emoji: h.emoji, color: h.color,
          position: Date.now(),
        }).then(({ error }) => { if (error) { toast.error("Failed to save habit"); console.error(error); } });
      }
    },
    toggleHabit: (id, date = todayStr()) => {
      let isAdding = false;
      let nextHabit: Habit | undefined;
      setHabits((prev) => prev.map((h) => {
        if (h.id !== id) return h;
        const has = h.completions.includes(date);
        isAdding = !has;
        const completions = has ? h.completions.filter((d) => d !== date) : [...h.completions, date];
        nextHabit = { ...h, completions };
        if (!has && date === todayStr()) {
          const stat = computeStreak(completions);
          setTimeout(() => {
            if (stat.current === 1) toast.success(`Nice start! Day 1 of ${h.name} 🌱`);
            else if ([3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365].includes(stat.current))
              toast.success(`🔥 ${stat.current}-day streak on ${h.name}! Keep going!`, { duration: 4500 });
            else toast(`${h.emoji} ${stat.current}-day streak — ${h.name}`);
          }, 50);
        }
        return nextHabit;
      }));
      if (cloud && user) {
        if (isAdding) {
          supabase.from("habit_completions").insert({ habit_id: id, user_id: user.id, date })
            .then(({ error }) => {
              if (error && !error.message.toLowerCase().includes("duplicate")) console.error(error);
            });
        } else {
          supabase.from("habit_completions").delete().eq("habit_id", id).eq("date", date)
            .then(({ error }) => { if (error) console.error(error); });
        }
      }
    },
    removeHabit: (id) => {
      setHabits((p) => p.filter((h) => h.id !== id));
      if (cloud) {
        supabase.from("habits").delete().eq("id", id)
          .then(({ error }) => { if (error) console.error(error); });
      }
    },
    renameHabit: (id, name) => {
      setHabits((p) => p.map((h) => h.id === id ? { ...h, name } : h));
      if (cloud) {
        supabase.from("habits").update({ name }).eq("id", id)
          .then(({ error }) => { if (error) console.error(error); });
      }
    },
  }), [tasks, habits, hydrated, today, cloud, user]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be inside AppProvider");
  return v;
}
