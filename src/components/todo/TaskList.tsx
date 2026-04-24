import { useRef, useState } from "react";
import { Task } from "./types";
import { TaskItem } from "./TaskItem";
import { useApp } from "@/components/app/AppStore";

interface Props {
  tasks: Task[];
  draggable?: boolean;
  showDate?: boolean;
  emptyText?: string;
}

export function TaskList({ tasks, draggable, showDate, emptyText }: Props) {
  const { tasks: allTasks, toggleTask, removeTask, updateTask, reorderTasks } = useApp();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const dragSourceIndex = useRef<number | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    dragSourceIndex.current = allTasks.findIndex((t) => t.id === id);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id === draggingId) return;
    setOverId(id);
    const from = allTasks.findIndex((t) => t.id === draggingId);
    const to = allTasks.findIndex((t) => t.id === id);
    if (from < 0 || to < 0 || from === to) return;
    const next = [...allTasks];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    reorderTasks(next);
  };
  const onDragEnd = () => { setDraggingId(null); setOverId(null); };

  if (tasks.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-soft">
        <p className="text-base">{emptyText ?? "No tasks here yet."}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((t) => (
        <TaskItem
          key={t.id}
          task={t}
          onToggle={toggleTask}
          onDelete={removeTask}
          onSetColor={(id, color) => updateTask(id, { color })}
          onDragStart={draggable ? onDragStart : undefined}
          onDragOver={draggable ? onDragOver : undefined}
          onDragEnd={draggable ? onDragEnd : undefined}
          isDragging={draggingId === t.id}
          isOver={overId === t.id && draggingId !== t.id}
          showDate={showDate}
        />
      ))}
    </ul>
  );
}
