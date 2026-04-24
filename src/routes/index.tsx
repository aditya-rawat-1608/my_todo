import { createFileRoute } from "@tanstack/react-router";
import { TodoApp } from "@/components/todo/TodoApp";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Glass Tasks — A beautiful to-do app" },
      { name: "description", content: "Organize your day with a glassmorphic to-do list. Categorize, color, drag to reorder — all saved in your browser." },
      { property: "og:title", content: "Glass Tasks — A beautiful to-do app" },
      { property: "og:description", content: "A glassmorphic to-do list with categories, custom colors, and drag-and-drop reordering." },
    ],
  }),
});

function Index() {
  return <TodoApp />;
}
