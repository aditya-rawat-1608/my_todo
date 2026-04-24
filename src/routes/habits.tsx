import { createFileRoute } from "@tanstack/react-router";
import { HabitsPage } from "@/components/habits/HabitsPage";

export const Route = createFileRoute("/habits")({
  component: HabitsPage,
  head: () => ({
    meta: [
      { title: "Habits — Lumen" },
      { name: "description", content: "Track daily habits and celebrate streaks. Build consistency with small wins." },
    ],
  }),
});
