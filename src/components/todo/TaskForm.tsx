import { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { Task, Category, CATEGORIES, CATEGORY_COLORS, todayStr } from "./types";

interface Props {
  defaultDate?: string;
  onAdd: (input: Omit<Task, "id" | "createdAt" | "completedAt" | "carriedFrom">) => void;
  compact?: boolean;
}

export function TaskForm({ defaultDate, onAdd, compact }: Props) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category>("Study");
  const [date, setDate] = useState(defaultDate ?? todayStr());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showMore, setShowMore] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onAdd({
      text: t,
      category,
      color: null,
      done: false,
      date,
      startTime: startTime || null,
      endTime: endTime || null,
      notes: "",
    });
    setText("");
    setStartTime("");
    setEndTime("");
  };

  return (
    <form onSubmit={submit} className="glass-strong rounded-2xl p-3 flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task…"
          className="flex-1 glass-input rounded-xl px-4 py-2.5 text-foreground placeholder:text-faint outline-none focus:ring-2 focus:ring-[var(--primary)]/40 transition"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="glass-input rounded-xl px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[var(--primary)]/40 transition cursor-pointer"
          style={{ borderLeft: `3px solid ${CATEGORY_COLORS[category]}` }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="bg-[var(--surface-2)] text-foreground">{c}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl px-4 py-2.5 font-medium text-[oklch(0.15_0.02_150)] gradient-primary flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-elegant"
        >
          <Plus className="size-4" /> Add
        </button>
      </div>

      {!compact && (
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="self-start text-[11px] text-soft hover:text-foreground inline-flex items-center gap-1 px-1"
        >
          <ChevronDown className={`size-3 transition-transform ${showMore ? "rotate-180" : ""}`} />
          Date & time
        </button>
      )}

      {(showMore || compact) && (
        <div className="grid grid-cols-3 gap-2">
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] text-faint uppercase tracking-wide">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="glass-input rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-[var(--primary)]/40" />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] text-faint uppercase tracking-wide">Start</span>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
              className="glass-input rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-[var(--primary)]/40" />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[10px] text-faint uppercase tracking-wide">End</span>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
              className="glass-input rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-[var(--primary)]/40" />
          </label>
        </div>
      )}
    </form>
  );
}
