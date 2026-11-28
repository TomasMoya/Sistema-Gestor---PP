import { cn } from "@/lib/cn";
import { CALENDAR_TYPE_LABEL, itemType } from "@/lib/calendario/calendar-items";
import { formatCurrency, formatRelativeSoon, formatWeekdayShort, parseISODate } from "@/lib/format";
import type { Task } from "@/lib/types";

interface UpcomingDaysListProps {
  items: Task[];
  today: Date;
  onSelectDate: (iso: string) => void;
}

function metaFor(task: Task, today: Date): string {
  if (itemType(task) === "payment") return formatCurrency(task.amount ?? 0);
  const relative = task.dueDate ? formatRelativeSoon(task.dueDate, today) : null;
  return [relative, task.category?.name].filter(Boolean).join(" · ");
}

/** "Próximos días": los siguientes elementos tras el día seleccionado, con bloque de fecha a la izquierda. */
export function UpcomingDaysList({ items, today, onSelectDate }: UpcomingDaysListProps) {
  return (
    <ul className="gp-list" aria-label="Próximos días">
      {items.map((task) => {
        const type = itemType(task);
        const dueDate = task.dueDate as string;
        return (
          <li
            key={task.id}
            className={cn("gp-item", "gp-item--link", `gp-type--${type}`)}
            onClick={() => onSelectDate(dueDate)}
          >
            <div className="gp-datebox">
              {formatWeekdayShort(dueDate)}
              <b>{parseISODate(dueDate).getDate()}</b>
            </div>
            <div className="gp-item__body">
              <div className="gp-item__title">{task.title}</div>
              <div className="gp-item__meta">{metaFor(task, today)}</div>
            </div>
            <div className="gp-item__trail">
              <span className="gp-typetag">{CALENDAR_TYPE_LABEL[type]}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
