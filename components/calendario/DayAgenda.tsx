import { diffInCalendarDays, formatWeekdayDay, parseISODate } from "@/lib/format";
import { itemType } from "@/lib/calendario/calendar-items";
import type { Task } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { GroupedList } from "@/components/ui/GroupedList";
import { CalendarPaymentRow } from "./CalendarPaymentRow";
import { CalendarTaskRow } from "./CalendarTaskRow";

interface DayAgendaProps {
  selectedDate: string;
  items: Task[];
  today: Date;
  onToggleTask: (id: string, done: boolean) => void;
}

/** "Hoy, martes 27" / "Mañana, miércoles 28" / "Jueves 29". */
function formatAgendaHeading(selectedDate: string, today: Date): string {
  const diff = diffInCalendarDays(parseISODate(selectedDate), today);
  const weekdayDay = formatWeekdayDay(selectedDate);
  if (diff === 0) return `Hoy, ${weekdayDay}`;
  if (diff === 1) return `Mañana, ${weekdayDay}`;
  return weekdayDay.charAt(0).toUpperCase() + weekdayDay.slice(1);
}

/** Agenda del día seleccionado: tareas y pagos de ese día, agrupados; oculta los grupos vacíos. */
export function DayAgenda({ selectedDate, items, today, onToggleTask }: DayAgendaProps) {
  const tasks = items.filter((item) => itemType(item) === "task");
  const payments = items.filter((item) => itemType(item) === "payment");

  return (
    <section className="gp-section" aria-label="Agenda del día">
      <div className="gp-section__head gp-agenda-head">
        <h2 className="gp-section__title">{formatAgendaHeading(selectedDate, today)}</h2>
        <span className="gp-section__meta">
          {items.length} {items.length === 1 ? "elemento" : "elementos"}
        </span>
      </div>

      {items.length === 0 && <EmptyState icon="event_available" text="Nada para este día." />}

      {tasks.length > 0 && (
        <>
          <div className="gp-group-label">Tareas del día</div>
          <GroupedList aria-label="Tareas del día">
            {tasks.map((task) => (
              <CalendarTaskRow key={task.id} task={task} today={today} onToggle={(done) => onToggleTask(task.id, done)} />
            ))}
          </GroupedList>
        </>
      )}

      {payments.length > 0 && (
        <>
          <div className="gp-group-label">Pagos</div>
          <GroupedList aria-label="Pagos">
            {payments.map((task) => (
              <CalendarPaymentRow key={task.id} task={task} />
            ))}
          </GroupedList>
        </>
      )}
    </section>
  );
}
