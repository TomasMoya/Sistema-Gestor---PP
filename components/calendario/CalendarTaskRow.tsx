import { cn } from "@/lib/cn";
import { PRIORITY_TAG } from "@/lib/priority";
import { getTaskMeta } from "@/lib/task-meta";
import type { Task } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";

interface CalendarTaskRowProps {
  task: Task;
  today: Date;
  onToggle: (done: boolean) => void;
}

/** Fila de tarea en la agenda de Calendario: casilla (48px de área táctil), título, metadato y prioridad. */
export function CalendarTaskRow({ task, today, onToggle }: CalendarTaskRowProps) {
  const meta = getTaskMeta(task, today);
  const priority = PRIORITY_TAG[task.priority];

  return (
    <li className={cn("gp-item", "gp-type--task", task.done && "gp-item--done")}>
      <button
        type="button"
        className="gp-check"
        role="checkbox"
        aria-checked={task.done}
        aria-label={`${task.done ? "Completada" : "Completar"}: ${task.title}`}
        onClick={() => onToggle(!task.done)}
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
      <div className="gp-item__trail">
        {!task.done && <Tag variant={task.priority} icon={priority.icon} label={priority.label} />}
      </div>
    </li>
  );
}
