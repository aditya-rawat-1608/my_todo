import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/auth/AuthPage";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  validateSearch: (s: Record<string, unknown>) => ({
    mode: s.mode === "signup" ? "signup" as const : "signin" as const,
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Lumen" },
      { name: "description", content: "Sign in or create a free Lumen account to sync your tasks and habits across devices." },
    ],
  }),
});
