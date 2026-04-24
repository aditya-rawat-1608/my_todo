import { useMemo, useState } from "react";
import { Plus, Flame, Trash2, Trophy, Check } from "lucide-react";
import { useApp } from "@/components/app/AppStore";
import { HABIT_EMOJIS, PALETTE, computeStreak, todayStr } from "@/components/todo/types";

function lastNDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(todayStr(d));
  }
  return out;
}

export function HabitsPage() {
  const { habits, addHabit, toggleHabit, removeHabit } = useApp();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(HABIT_EMOJIS[0]);
  const [color, setColor] = useState(PALETTE[0]);
  const today = todayStr();
  const days = useMemo(() => lastNDays(14), []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = name.trim();
    if (!t) return;
    addHabit({ name: t, emoji, color });
    setName("");
  };

  const stats = habits.map((h) => ({ habit: h, ...computeStreak(h.completions, today) }));
  const totalStreak = stats.reduce((s, x) => s + (x.doneToday ? 1 : 0), 0);

  return (
    <div className="px-5 sm:px-8 py-8 max-w-4xl mx-auto">
      <header className="mb-6">
        <div className="text-xs uppercase tracking-widest text-faint">Daily habits</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Habit tracker</h1>
        <p className="mt-1 text-soft text-sm">
          {habits.length === 0
            ? "Build something small, every day. Streaks reward consistency."
            : `${totalStreak}/${habits.length} done today · keep your fire alive 🔥`}
        </p>
      </header>

      <form onSubmit={submit} className="glass-strong rounded-2xl p-3 mb-6 flex flex-col sm:flex-row gap-2 items-stretch">
        <select value={emoji} onChange={(e) => setEmoji(e.target.value)}
          className="glass-input rounded-xl px-3 py-2.5 text-lg outline-none">
          {HABIT_EMOJIS.map((e) => <option key={e} value={e} className="bg-[var(--surface-2)]">{e}</option>)}
        </select>
        <input value={name} onChange={(e) => setName(e.target.value)}
          placeholder="New habit (e.g. 30-min reading)"
          className="flex-1 glass-input rounded-xl px-4 py-2.5 text-foreground placeholder:text-faint outline-none focus:ring-2 focus:ring-[var(--primary)]/40" />
        <div className="flex gap-1 items-center justify-center px-2 glass-input rounded-xl">
          {PALETTE.slice(0, 6).map((c) => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className={`size-5 rounded-full transition-transform ${color === c ? "scale-125 ring-2 ring-foreground" : ""}`}
              style={{ backgroundColor: c }} aria-label={`Color ${c}`} />
          ))}
        </div>
        <button type="submit" className="rounded-xl px-4 py-2.5 font-medium text-[oklch(0.15_0.02_150)] gradient-primary inline-flex items-center justify-center gap-2 shadow-elegant hover:scale-[1.02] active:scale-95 transition">
          <Plus className="size-4" /> Add habit
        </button>
      </form>

      {habits.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-soft">
          <Flame className="mx-auto size-8 text-[var(--accent)] mb-2" />
          <p>No habits yet. Add one above and start your first streak today.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stats.map(({ habit, current, longest, doneToday }) => (
            <div key={habit.id} className="glass rounded-2xl p-4"
              style={{ borderLeft: `3px solid ${habit.color}` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">{habit.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">{habit.name}</div>
                  <div className="text-[11px] text-faint">Best streak: {longest} day{longest === 1 ? "" : "s"}</div>
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold ${
                  current > 0 ? "text-[var(--accent)]" : "text-faint"
                }`} style={current > 0 ? { background: "color-mix(in oklab, var(--accent) 15%, transparent)" } : {}}>
                  {current > 0 ? <Flame className={`size-4 ${doneToday ? "flame" : ""}`} /> : <Trophy className="size-4" />}
                  <span className={doneToday ? "streak-pop inline-block" : ""}>{current}</span>
                </div>
                <button onClick={() => { if (confirm(`Delete habit "${habit.name}"?`)) removeHabit(habit.id); }}
                  aria-label="Delete habit"
                  className="size-7 rounded-full grid place-items-center text-faint hover:text-red-400 hover:bg-white/10">
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {days.map((d) => {
                  const isDone = habit.completions.includes(d);
                  const isToday = d === today;
                  return (
                    <button
                      key={d}
                      onClick={() => toggleHabit(habit.id, d)}
                      title={d}
                      className={`flex-1 h-10 rounded-md flex items-center justify-center transition-all
                        ${isDone ? "shadow-inner" : "hover:bg-[var(--surface-2)]"}
                        ${isToday ? "ring-1 ring-[var(--primary)]/60" : ""}`}
                      style={isDone ? { backgroundColor: habit.color, color: "#0b0b0b" } : { backgroundColor: "color-mix(in oklab, var(--surface-2) 60%, transparent)" }}
                    >
                      {isDone ? <Check className="size-4" strokeWidth={3} /> : (
                        <span className="text-[10px] text-faint">{Number(d.slice(-2))}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-faint px-0.5">
                <span>14 days ago</span>
                <span>Today</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
