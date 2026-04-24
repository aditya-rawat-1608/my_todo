import { useMemo } from "react";
import { useApp } from "@/components/app/AppStore";
import { TaskList } from "./TaskList";
import { formatDateLabel, todayStr } from "./types";

export function HistoryPage() {
  const { tasks, today } = useApp();
  const past = useMemo(() => tasks.filter((t) => t.date < today), [tasks, today]);
  const grouped = useMemo(() => {
    const m = new Map<string, typeof tasks>();
    for (const t of past) {
      const arr = m.get(t.date) ?? [];
      arr.push(t);
      m.set(t.date, arr);
    }
    return [...m.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [past]);

  const totalDone = past.filter((t) => t.done).length;
  const totalAll = past.length;

  return (
    <div className="px-5 sm:px-8 py-8 max-w-3xl mx-auto">
      <header className="mb-6">
        <div className="text-xs uppercase tracking-widest text-faint">Previous days</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">History</h1>
        <p className="mt-1 text-soft text-sm">
          {totalAll === 0 ? "No past entries yet." : `${totalDone} of ${totalAll} completed across ${grouped.length} day${grouped.length === 1 ? "" : "s"}.`}
        </p>
        <p className="mt-2 text-xs text-faint">
          Pending tasks from earlier days are automatically carried into today and shown there.
        </p>
      </header>

      {grouped.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-soft">
          <p>Your past lists will appear here once you've used the app for a day.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, list]) => {
            const done = list.filter((t) => t.done).length;
            return (
              <section key={date}>
                <div className="flex items-baseline justify-between mb-2 px-1">
                  <h2 className="text-sm font-medium text-foreground">{formatDateLabel(date)}</h2>
                  <span className="text-[11px] text-faint">{done}/{list.length} done</span>
                </div>
                <TaskList tasks={list} />
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
