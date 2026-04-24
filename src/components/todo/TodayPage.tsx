import { useMemo, useState } from "react";
import { useApp } from "@/components/app/AppStore";
import { TaskForm } from "./TaskForm";
import { TaskList } from "./TaskList";
import { CATEGORIES, Category, formatDateLabel } from "./types";

type Filter = "All" | Category;

export function TodayPage() {
  const { tasks, hydrated, today, addTask } = useApp();
  const [filter, setFilter] = useState<Filter>("All");

  const todays = useMemo(() => tasks.filter((t) => t.date === today), [tasks, today]);
  const filtered = useMemo(
    () => filter === "All" ? todays : todays.filter((t) => t.category === filter),
    [todays, filter]
  );

  const remaining = todays.filter((t) => !t.done).length;
  const carried = todays.filter((t) => t.carriedFrom && !t.done).length;
  const done = todays.filter((t) => t.done).length;
  const filters: Filter[] = ["All", ...CATEGORIES];

  return (
    <div className="px-5 sm:px-8 py-8 max-w-3xl mx-auto">
      <header className="mb-6">
        <div className="text-xs uppercase tracking-widest text-faint">{formatDateLabel(today)}</div>
        <h1 className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">Your day, organized.</h1>
        <p className="mt-1 text-soft text-sm">
          {hydrated ? (
            <>
              {remaining > 0 ? `${remaining} remaining · ${done} done` : done > 0 ? "All clear ✨" : "Nothing scheduled yet"}
              {carried > 0 && <span className="text-[var(--accent)]"> · {carried} carried over</span>}
            </>
          ) : "\u00A0"}
        </p>
      </header>

      <div className="mb-4">
        <TaskForm onAdd={addTask} defaultDate={today} />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4 no-scrollbar overflow-x-auto">
        {filters.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                active ? "bg-[var(--surface-3)] text-foreground ring-1 ring-[var(--hairline-strong)]"
                       : "text-soft hover:text-foreground hover:bg-[var(--surface-2)]"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      <TaskList tasks={filtered} draggable emptyText="Nothing here. Add a task above to start your day." />
    </div>
  );
}
