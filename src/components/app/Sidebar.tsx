import { Link, useLocation } from "@tanstack/react-router";
import { CalendarDays, ListTodo, History, Sparkles, Flame } from "lucide-react";

const items = [
  { to: "/", label: "Today", icon: ListTodo },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/history", label: "History", icon: History },
  { to: "/habits", label: "Habits", icon: Flame },
] as const;

export function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col border-r border-[var(--hairline)] bg-[var(--sidebar)]/80 backdrop-blur-xl">
      <div className="px-5 py-5 flex items-center gap-2">
        <div className="size-8 rounded-lg gradient-primary grid place-items-center shadow-elegant">
          <Sparkles className="size-4 text-[oklch(0.15_0.02_150)]" />
        </div>
        <div>
          <div className="font-semibold text-foreground tracking-tight">Lumen</div>
          <div className="text-[11px] text-faint">Tasks · Habits</div>
        </div>
      </div>
      <nav className="px-3 flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-[var(--sidebar-accent)] text-foreground shadow-[inset_0_0_0_1px_var(--hairline-strong)]"
                  : "text-soft hover:bg-[var(--sidebar-accent)]/60 hover:text-foreground"
              }`}
            >
              <Icon className={`size-4 ${active ? "text-[var(--primary)]" : ""}`} />
              {label}
              {active && <span className="ml-auto size-1.5 rounded-full bg-[var(--accent)]" />}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-4 text-[11px] text-faint">
        <div className="rounded-lg p-3 ring-hairline">
          Stored locally on this device. Your data never leaves your browser.
        </div>
      </div>
    </aside>
  );
}

export function MobileTabs() {
  const { pathname } = useLocation();
  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-30 glass-strong rounded-2xl px-2 py-1.5 flex justify-around">
      {items.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] transition-colors ${
              active ? "text-[var(--primary)]" : "text-soft"
            }`}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
