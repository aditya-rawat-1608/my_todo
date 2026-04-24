import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" }) as { mode?: "signin" | "signup"; redirect?: string };
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const fn = mode === "signin" ? signIn : signUp;
    const { error: err } = await fn(parsed.data.email, parsed.data.password);
    setLoading(false);
    if (err) { setError(err); return; }
    toast.success(mode === "signin" ? "Welcome back!" : "Account created — you're in.");
    navigate({ to: search.redirect ?? "/" });
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="size-9 rounded-lg gradient-primary grid place-items-center shadow-elegant">
            <Sparkles className="size-5 text-[oklch(0.15_0.02_150)]" />
          </div>
          <div className="font-semibold text-lg tracking-tight text-foreground">Lumen</div>
        </div>

        <div className="glass-strong rounded-2xl p-6">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-soft text-sm mt-1">
            {mode === "signin"
              ? "Sign in to sync your tasks and habits across devices."
              : "Your existing local tasks & habits will be uploaded automatically."}
          </p>

          <form onSubmit={submit} className="mt-5 space-y-3">
            <label className="block">
              <span className="text-[11px] uppercase tracking-wide text-faint">Email</span>
              <input type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full glass-input rounded-lg px-3 py-2.5 text-foreground placeholder:text-faint outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                placeholder="you@example.com" />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-wide text-faint">Password</span>
              <input type="password" required
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full glass-input rounded-lg px-3 py-2.5 text-foreground placeholder:text-faint outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                placeholder="At least 6 characters" />
            </label>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full rounded-lg px-4 py-2.5 font-medium text-[oklch(0.15_0.02_150)] gradient-primary inline-flex items-center justify-center gap-2 shadow-elegant hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60">
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
            className="mt-4 text-sm text-soft hover:text-foreground w-full text-center">
            {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <button onClick={() => navigate({ to: "/" })}
          className="mt-4 text-xs text-faint hover:text-soft w-full text-center">
          ← Continue without signing in
        </button>
      </div>
    </div>
  );
}
