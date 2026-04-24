import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Task, Category, CATEGORIES, CATEGORY_COLORS } from "./types";
import { TaskItem } from "./TaskItem";

const STORAGE_KEY = "glass-todo-v1";

type Filter = "All" | Category;

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category>("Study");
  const [filter, setFilter] = useState<Filter>("All");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // hydrate from localStorage on client
  useEffect(() => {
    setTasks(loadTasks());
    setHydrated(true);
  }, []);

  // persist
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, hydrated]);

  const filtered = useMemo(
    () => (filter === "All" ? tasks : tasks.filter((t) => t.category === filter)),
    [tasks, filter],
  );

  const remaining = tasks.filter((t) => !t.done).length;

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: trimmed,
      category,
      color: null,
      done: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setText("");
  };

  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const setColor = (id: string, color: string | null) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, color } : t)));

  // Drag & drop reorder (operates on full tasks array regardless of filter)
  const dragSourceIndex = useRef<number | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    dragSourceIndex.current = tasks.findIndex((t) => t.id === id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id === draggingId) return;
    setOverId(id);
    setTasks((prev) => {
      const from = prev.findIndex((t) => t.id === draggingId);
      const to = prev.findIndex((t) => t.id === id);
      if (from < 0 || to < 0 || from === to) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const onDragEnd = () => {
    setDraggingId(null);
    setOverId(null);
    dragSourceIndex.current = null;
  };

  const filters: Filter[] = ["All", ...CATEGORIES];

  return (
    <main className="min-h-screen px-4 py-10 sm:py-16 flex justify-center">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-4">
            <Sparkles className="size-3.5 text-white/80" />
            <span className="text-xs text-white/80 font-medium tracking-wide">
              GLASS TASKS
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Your day, organized.
          </h1>
          <p className="mt-2 text-white/60">
            {hydrated && remaining > 0
              ? `${remaining} task${remaining === 1 ? "" : "s"} remaining`
              : hydrated
                ? "All clear ✨"
                : "\u00A0"}
          </p>
        </header>

        {/* Add form */}
        <form
          onSubmit={addTask}
          className="glass-strong rounded-2xl p-3 flex flex-col sm:flex-row gap-2 mb-4"
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs doing?"
            className="flex-1 glass-input rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/30 transition"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="glass-input rounded-xl px-3 py-3 text-white outline-none focus:ring-2 focus:ring-white/30 transition cursor-pointer"
            style={{ borderLeft: `4px solid ${CATEGORY_COLORS[category]}` }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-slate-800 text-white">
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl px-5 py-3 font-medium text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))",
              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}
          >
            <Plus className="size-4" /> Add
          </button>
        </form>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {filters.map((f) => {
            const active = filter === f;
            const color = f === "All" ? "#ffffff" : CATEGORY_COLORS[f];
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  active ? "glass-strong text-white scale-105" : "glass text-white/70 hover:text-white"
                }`}
                style={active ? { boxShadow: `0 0 0 1px ${color}40, 0 4px 16px ${color}30` } : {}}
              >
                <span
                  className="inline-block size-2 rounded-full mr-2 align-middle"
                  style={{ backgroundColor: color }}
                />
                {f}
              </button>
            );
          })}
        </div>

        {/* List */}
        <ul className="flex flex-col gap-2.5">
          {filtered.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              onToggle={toggle}
              onDelete={remove}
              onSetColor={setColor}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragEnd={onDragEnd}
              isDragging={draggingId === t.id}
              isOver={overId === t.id && draggingId !== t.id}
            />
          ))}
        </ul>

        {hydrated && filtered.length === 0 && (
          <div className="glass rounded-2xl p-10 text-center text-white/60">
            <p className="text-lg">No tasks here yet.</p>
            <p className="text-sm mt-1">Add one above to get started.</p>
          </div>
        )}
      </div>
    </main>
  );
}