import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, LogOut, Cloud, CloudOff } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";

export function AccountChip() {
  const { user, signOut, ready } = useAuth();
  const navigate = useNavigate();
  if (!ready) return null;

  if (!user) {
    return (
      <Link to="/auth"
        className="mx-3 mb-3 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-soft hover:text-foreground bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors">
        <LogIn className="size-4 text-[var(--primary)]" />
        <span className="truncate">Sign in to sync</span>
        <CloudOff className="size-3.5 ml-auto text-faint" />
      </Link>
    );
  }

  const initial = (user.email?.[0] ?? "?").toUpperCase();
  return (
    <div className="mx-3 mb-3 flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[var(--surface-2)]">
      <div className="size-7 rounded-full grid place-items-center text-[oklch(0.15_0.02_150)] font-semibold text-sm gradient-primary shrink-0">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-foreground truncate">{user.email}</div>
        <div className="text-[10px] text-faint inline-flex items-center gap-1"><Cloud className="size-3" /> Synced</div>
      </div>
      <button onClick={async () => { await signOut(); toast("Signed out"); navigate({ to: "/" }); }}
        aria-label="Sign out"
        className="size-7 rounded-md grid place-items-center text-faint hover:text-foreground hover:bg-[var(--surface-3)]">
        <LogOut className="size-3.5" />
      </button>
    </div>
  );
}
