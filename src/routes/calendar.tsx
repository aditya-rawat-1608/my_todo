import { createFileRoute } from "@tanstack/react-router";
import { CalendarPage } from "@/components/calendar/CalendarPage";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
  head: () => ({
    meta: [
      { title: "Calendar — Lumen" },
      { name: "description", content: "Browse your tasks across the month and add tasks to any date." },
    ],
  }),
});
