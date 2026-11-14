"use client";

import { useRef, useState, type TouchEvent } from "react";
import { cn } from "@/lib/cn";
import { PRIORITY_TAG } from "@/lib/priority";
import { getTaskMeta } from "@/lib/task-meta";
import type { Task } from "@/lib/types";
import { Icon } from "./Icon";
import { RowMenu } from "./RowMenu";
import { Tag } from "./Tag";

interface TaskItemProps {
  task: Task;
  today: Date;
  selected?: boolean;
  onToggle: (done: boolean) => void;
  onOpen: () => void;
  onPostpone: () => void;
  onDelete: () => void;
}

const SWIPE_THRESHOLD = 64;

/**
 * Fila de tarea: casilla (48px de área táctil), título, metadatos y prioridad. En móvil,
 * deslizar a la derecha completa y a la izquierda pospone a mañana; el menú ⋮ es la
 * alternativa siempre visible a ambos gestos.
 */
export function TaskItem({ task, today, selected, onToggle, onOpen, onPostpone, onDelete }: TaskItemProps) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);

  const meta = getTaskMeta(task, today);
  const priority = PRIORITY_TAG[task.priority];

  function handleTouchStart(event: TouchEvent) {
    startX.current = event.touches[0].clientX;
    setDragging(true);
  }
  function handleTouchMove(event: TouchEvent) {
    if (startX.current == null) return;
    const delta = event.touches[0].clientX - startX.current;
    setDragX(Math.max(-96, Math.min(96, delta)));
  }
  function handleTouchEnd() {
    if (dragX > SWIPE_THRESHOLD) onToggle(!task.done);
    else if (dragX < -SWIPE_THRESHOLD) onPostpone();
    setDragging(false);
    setDragX(0);
    startX.current = null;
  }

  return (
    <li
      className={cn("gp-item", "gp-item--link", task.done && "gp-item--done")}
      aria-current={selected ? "true" : undefined}
      onClick={onOpen}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ transform: dragX ? `translateX(${dragX}px)` : undefined, transition: dragging ? "none" : "transform 150ms ease" }}
    >
      <button
        type="button"
        className="gp-check"
        role="checkbox"
        aria-checked={task.done}
        aria-label={`${task.done ? "Completada" : "Completar"}: ${task.title}`}
        onClick={(event) => {
          event.stopPropagation();
          onToggle(!task.done);
        }}
      >
        <span className="gp-check__box">
          <Icon name="check" />
        </span>
      </button>
      <div className="gp-item__body">
        <div className="gp-item__title">{task.title}</div>
        <div className="gp-item__meta">
          <Icon name={meta.icon} />
          {meta.text}
        </div>
      </div>
      <div className="gp-item__trail" onClick={(event) => event.stopPropagation()}>
        {!task.done && <Tag variant={task.priority} icon={priority.icon} label={priority.label} />}
        <RowMenu
          ariaLabel={`Más opciones: ${task.title}`}
          items={[
            ...(!task.done
              ? [
                  { label: "Completar", icon: "check", onSelect: () => onToggle(true) },
                  { label: "Posponer a mañana", icon: "schedule", onSelect: onPostpone },
                ]
              : []),
            { label: "Eliminar", icon: "delete", onSelect: onDelete },
          ]}
        />
      </div>
    </li>
  );
}
