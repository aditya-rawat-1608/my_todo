import { useState, useRef } from "react";
import { Check, Trash2, GripVertical } from "lucide-react";
import { Task, PALETTE, getTaskColor, CATEGORY_COLORS } from "./types";

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSetColor: (id: string, color: string | null) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isOver: boolean;
}

export function TaskItem({
  task, onToggle, onDelete, onSetColor,
  onDragStart, onDragOver, onDragEnd, isDragging, isOver,
}: Props) {
  const [showPalette, setShowPalette] = useState(false);
  const [removing, setRemoving] = useState(false);
  const color = getTaskColor(task);
  const itemRef = useRef<HTMLLIElement>(null);

  const handleDelete = () => {
    if (!confirm("Delete this task?")) return;
    setRemoving(true);
    setTimeout(() => onDelete(task.id), 320);
  };

  return (
    <li
      ref={itemRef}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragOver={(e) => onDragOver(e, task.id)}
      onDragEnd={onDragEnd}
      className={`task-enter group glass rounded-2xl p-4 flex items-center gap-3 transition-all
        ${isDragging ? "opacity-40 scale-95" : ""}
        ${isOver ? "ring-2 ring-white/40" : ""}
        ${removing ? "task-fade-out" : ""}`}
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <GripVertical className="size-4 text-white/40 cursor-grab active:cursor-grabbing shrink-0" />

      <button
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? "Mark as not done" : "Mark as done"}
        className="size-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110"
        style={{
          borderColor: color,
          backgroundColor: task.done ? color : "transparent",
        }}
      >
        {task.done && <Check className="size-4 text-white" strokeWidth={3} />}
      </button>

      <span
        className={`flex-1 text-white/90 text-base select-none transition-opacity ${
          task.done ? "task-strike opacity-60" : ""
        }`}
      >
        {task.text}
      </span>

      <span
        className="text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline-block"
        style={{
          backgroundColor: `${CATEGORY_COLORS[task.category]}30`,
          color: CATEGORY_COLORS[task.category],
        }}
      >
        {task.category}
      </span>

      <div className="relative">
        <button
          onClick={() => setShowPalette((v) => !v)}
          aria-label="Change color"
          className="size-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <span className="size-4 rounded-full ring-2 ring-white/30" style={{ backgroundColor: color }} />
        </button>
        {showPalette && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowPalette(false)} />
            <div className="absolute right-0 top-9 z-20 glass-strong rounded-xl p-2 grid grid-cols-4 gap-1.5 w-fit">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => { onSetColor(task.id, c); setShowPalette(false); }}
                  className="size-6 rounded-full hover:scale-125 transition-transform ring-1 ring-white/30"
                  style={{ backgroundColor: c }}
                  aria-label={`Set color ${c}`}
                />
              ))}
              <button
                onClick={() => { onSetColor(task.id, null); setShowPalette(false); }}
                className="col-span-4 mt-1 text-xs text-white/70 hover:text-white py-1 rounded hover:bg-white/10"
              >
                Reset to category
              </button>
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleDelete}
        aria-label="Delete task"
        className="size-7 rounded-full flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-white/10 transition-colors"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}