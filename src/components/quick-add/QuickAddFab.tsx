import { useEffect, useRef, useState } from "react";
import { Plus, X, ListTodo, Flame, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useApp } from "@/components/app/AppStore";
import { CATEGORIES, CATEGORY_COLORS, Category, HABIT_EMOJIS, todayStr } from "@/components/todo/types";

type Mode = "choose" | "task" | "habit";

export function QuickAddFab() {
  const { addTask, addHabit } = useApp();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("choose");

  // Task fields
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category>("Study");
  const [date, setDate] = useState(todayStr());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Habit fields
  const [habitName, setHabitName] = useState("");
  const [emoji, setEmoji] = useState(HABIT_EMOJIS[0]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const reset = () => {
    setMode("choose");
    setText(""); setCategory("Study"); setDate(todayStr());
    setStartTime(""); setEndTime("");
    setHabitName(""); setEmoji(HABIT_EMOJIS[0]);
  };

  const close = () => { setOpen(false); setTimeout(reset, 200); };

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Focus the name field when entering task or habit mode
  useEffect(() => {
    if (open && (mode === "task" || mode === "habit")) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open, mode]);

  const submitTask = () => {
    const t = text.trim();
    if (!t) return;
    addTask({
      text: t, category, color: null, done: false, date,
      startTime: startTime || null, endTime: endTime || null, notes: "",
    });
    close();
  };

  const submitHabit = () => {
    const n = habitName.trim();
    if (!n) return;
    // Default to brand primary so habit cards stay on-theme.
    addHabit({ name: n, emoji, color: "var(--primary)" });
    close();
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Quick add"
        className="fixed z-40 left-1/2 -translate-x-1/2 bottom-20 md:bottom-6
          h-14 w-14 rounded-full gradient-primary shadow-elegant
          grid place-items-center text-[oklch(0.15_0.02_150)]
          hover:scale-105 active:scale-95 transition-transform
          ring-1 ring-[var(--hairline-strong)]"
      >
        <Plus className="size-6" strokeWidth={2.5} />
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/50 backdrop-blur-sm task-enter"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div className="glass-strong w-full sm:w-[440px] sm:rounded-2xl rounded-t-3xl p-5 m-0 sm:m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {mode === "choose" ? "What do you want to add?" : mode === "task" ? "New task" : "New habit"}
              </h2>
              <button onClick={close} aria-label="Close"
                className="size-8 rounded-full grid place-items-center text-faint hover:text-foreground hover:bg-[var(--surface-2)]">
                <X className="size-4" />
              </button>
            </div>

            {mode === "choose" && (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setMode("task")}
                  className="glass rounded-2xl p-5 flex flex-col items-center gap-2 hover:bg-[var(--surface-2)] transition-colors group">
                  <div className="size-12 rounded-xl grid place-items-center"
                    style={{ background: "color-mix(in oklab, var(--primary) 22%, transparent)" }}>
                    <ListTodo className="size-6 text-[var(--primary)]" />
                  </div>
                  <div className="font-medium text-foreground">Task</div>
                  <div className="text-[11px] text-faint text-center">One-off with date & time</div>
                </button>
                <button onClick={() => setMode("habit")}
                  className="glass rounded-2xl p-5 flex flex-col items-center gap-2 hover:bg-[var(--surface-2)] transition-colors group">
                  <div className="size-12 rounded-xl grid place-items-center"
                    style={{ background: "color-mix(in oklab, var(--accent) 22%, transparent)" }}>
                    <Flame className="size-6 text-[var(--accent)]" />
                  </div>
                  <div className="font-medium text-foreground">Habit</div>
                  <div className="text-[11px] text-faint text-center">Daily streak you track</div>
                </button>
              </div>
            )}

            {mode === "task" && (
              <form onSubmit={(e) => { e.preventDefault(); submitTask(); }} className="flex flex-col gap-3">
                <input
                  ref={inputRef}
                  type="text" value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="Task name (press Enter to add)…"
                  className="glass-input rounded-xl px-4 py-3 text-foreground placeholder:text-faint outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                />

                <div>
                  <div className="text-[10px] text-faint uppercase tracking-wide mb-1.5">Category</div>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((c) => (
                      <button key={c} type="button" onClick={() => setCategory(c)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          category === c
                            ? "text-foreground ring-1 ring-[var(--hairline-strong)]"
                            : "text-soft hover:text-foreground hover:bg-[var(--surface-2)]"
                        }`}
                        style={category === c ? {
                          background: `color-mix(in oklab, ${CATEGORY_COLORS[c]} 22%, transparent)`,
                          borderLeft: `3px solid ${CATEGORY_COLORS[c]}`,
                        } : { borderLeft: `3px solid ${CATEGORY_COLORS[c]}` }}
                      >{c}</button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] text-faint uppercase tracking-wide flex items-center gap-1">
                      <CalendarIcon className="size-3" /> Date
                    </span>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                      className="glass-input rounded-lg px-2.5 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[var(--primary)]/40" />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] text-faint uppercase tracking-wide flex items-center gap-1">
                      <Clock className="size-3" /> From
                    </span>
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                      className="glass-input rounded-lg px-2.5 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[var(--primary)]/40" />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] text-faint uppercase tracking-wide flex items-center gap-1">
                      <Clock className="size-3" /> To
                    </span>
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                      className="glass-input rounded-lg px-2.5 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[var(--primary)]/40" />
                  </label>
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setMode("choose")}
                    className="px-4 py-2.5 rounded-xl text-sm text-soft hover:text-foreground hover:bg-[var(--surface-2)] transition">
                    Back
                  </button>
                  <button type="submit" disabled={!text.trim()}
                    className="flex-1 rounded-xl px-4 py-2.5 font-medium text-[oklch(0.15_0.02_150)] gradient-primary shadow-elegant hover:scale-[1.01] active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Add task
                  </button>
                </div>
              </form>
            )}

            {mode === "habit" && (
              <form onSubmit={(e) => { e.preventDefault(); submitHabit(); }} className="flex flex-col gap-3">
                <input
                  ref={inputRef}
                  type="text" value={habitName} onChange={(e) => setHabitName(e.target.value)}
                  placeholder="Habit name (press Enter to add)…"
                  className="glass-input rounded-xl px-4 py-3 text-foreground placeholder:text-faint outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                />

                <div>
                  <div className="text-[10px] text-faint uppercase tracking-wide mb-1.5">Pick an icon</div>
                  <div className="flex flex-wrap gap-1.5">
                    {HABIT_EMOJIS.map((e) => (
                      <button key={e} type="button" onClick={() => setEmoji(e)}
                        className={`size-10 rounded-xl text-lg transition-all ${
                          emoji === e
                            ? "bg-[var(--surface-3)] ring-1 ring-[var(--primary)]/60 scale-105"
                            : "hover:bg-[var(--surface-2)]"
                        }`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setMode("choose")}
                    className="px-4 py-2.5 rounded-xl text-sm text-soft hover:text-foreground hover:bg-[var(--surface-2)] transition">
                    Back
                  </button>
                  <button type="submit" disabled={!habitName.trim()}
                    className="flex-1 rounded-xl px-4 py-2.5 font-medium text-[oklch(0.15_0.02_150)] gradient-primary shadow-elegant hover:scale-[1.01] active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Add habit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}