import { createFileRoute } from "@tanstack/react-router";
import { HistoryPage } from "@/components/todo/HistoryPage";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
  head: () => ({
    meta: [
      { title: "History — Lumen" },
      { name: "description", content: "All your previous to-do lists, organized by day." },
    ],
  }),
});
