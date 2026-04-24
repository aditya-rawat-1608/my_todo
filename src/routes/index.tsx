import { createFileRoute } from "@tanstack/react-router";
import { TodayPage } from "@/components/todo/TodayPage";

export const Route = createFileRoute("/")({
  component: TodayPage,
  head: () => ({
    meta: [
      { title: "Today — Lumen" },
      { name: "description", content: "Plan today's tasks with categories, custom colors and time ranges. Pending tasks carry forward automatically." },
    ],
  }),
});
