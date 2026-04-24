import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "@/components/app/AppStore";
import { TaskForm } from "@/components/todo/TaskForm";
import { TaskList } from "@/components/todo/TaskList";
import { todayStr, formatDateLabel, getTaskColor } from "@/components/todo/types";

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function pad(n: number) { return String(n).padStart(2, "0"); }
function ymd(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }

export function CalendarPage() {
  const { tasks, addTask } = useApp();
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(todayStr());

  const grid = useMemo(() => {
    const first = startOfMonth(cursor);
    const startWeekday = first.getDay(); // 0 Sun
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth()+1, 0).getDate();
    const cells: { date: string | null; inMonth: boolean }[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ date: null, inMonth: false });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: ymd(new Date(cursor.getFullYear(), cursor.getMonth(), d)), inMonth: true });
    }
    while (cells.length % 7 !== 0) cells.push({ date: null, inMonth: false });
    return cells;
  }, [cursor]);

  const tasksByDate = useMemo(() => {
    const m = new Map<string, typeof tasks>();
    for (const t of tasks) {
      const arr = m.get(t.date) ?? [];
      arr.push(t);
      m.set(t.date, arr);
    }
    return m;
  }, [tasks]);

  const todayKey = todayStr();
  const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });
  const selectedTasks = (tasksByDate.get(selected) ?? []).slice().sort((a, b) => {
    if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
    if (a.startTime) return -1;
    if (b.startTime) return 1;
    return a.createdAt - b.createdAt;
  });

  return (
    <div className="px-5 sm:px-8 py-8 max-w-5xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-faint">Calendar</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{monthLabel}</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()-1, 1))}
            className="size-9 rounded-lg hover:bg-[var(--surface-2)] grid place-items-center text-soft">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={() => { setCursor(startOfMonth(new Date())); setSelected(todayStr()); }}
            className="px-3 py-1.5 text-xs rounded-lg hover:bg-[var(--surface-2)] text-soft">Today</button>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()+1, 1))}
            className="size-9 rounded-lg hover:bg-[var(--surface-2)] grid place-items-center text-soft">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="glass rounded-2xl p-3">
          <div className="grid grid-cols-7 mb-2">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <div key={d} className="text-[10px] uppercase tracking-wider text-faint text-center py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {grid.map((c, i) => {
              if (!c.date) return <div key={i} className="aspect-square" />;
              const dayTasks = tasksByDate.get(c.date) ?? [];
              const isToday = c.date === todayKey;
              const isSelected = c.date === selected;
              const dayNum = Number(c.date.slice(-2));
              return (
                <button
                  key={c.date}
                  onClick={() => setSelected(c.date!)}
                  className={`relative aspect-square rounded-lg p-1.5 text-left transition-all
                    ${isSelected ? "bg-[var(--surface-3)] ring-1 ring-[var(--primary)]"
                                 : "hover:bg-[var(--surface-2)]"}
                    ${isToday && !isSelected ? "ring-1 ring-[var(--accent)]/60" : ""}`}
                >
                  <div className={`text-xs font-medium ${isToday ? "text-[var(--accent)]" : "text-soft"}`}>{dayNum}</div>
                  <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 flex-wrap">
                    {dayTasks.slice(0, 4).map((t) => (
                      <span key={t.id} className="size-1.5 rounded-full"
                        style={{ backgroundColor: getTaskColor(t), opacity: t.done ? 0.4 : 1 }} />
                    ))}
                    {dayTasks.length > 4 && (
                      <span className="text-[8px] text-faint leading-none">+{dayTasks.length - 4}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs text-faint uppercase tracking-widest mb-1">{formatDateLabel(selected)}</div>
            <div className="text-sm text-soft mb-3">{selectedTasks.length} task{selectedTasks.length === 1 ? "" : "s"}</div>
          </div>
          <TaskForm defaultDate={selected} onAdd={addTask} compact />
          <TaskList tasks={selectedTasks} showDate={false} emptyText="Nothing scheduled this day." />
        </div>
      </div>
    </div>
  );
}
