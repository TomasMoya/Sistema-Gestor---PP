import { diffInCalendarDays, formatCurrency, formatShortDate, parseISODate } from "./format";
import type { Task } from "./types";

export interface TaskMeta {
  icon: string;
  text: string;
  amount?: string;
}

/**
 * Línea de metadatos de una fila de tarea. La fecha solo se muestra cuando aporta algo que el
 * grupo no dice ya: en los grupos "Hoy" y "Mañana" se omite y se usa la categoría (con su
 * icono); el resto de grupos muestra la fecha corta y, junto a ella, el importe o la categoría.
 */
export function getTaskMeta(task: Task, today: Date): TaskMeta {
  const diff = task.dueDate ? diffInCalendarDays(parseISODate(task.dueDate), today) : null;
  const showDate = diff !== null && diff !== 0 && diff !== 1;

  if (showDate && task.dueDate) {
    const parts = [formatShortDate(task.dueDate)];
    if (task.amount != null) parts.push(formatCurrency(task.amount));
    else if (task.category) parts.push(task.category.name);
    return { icon: "event", text: parts.join(" · ") };
  }

  if (task.note) {
    return { icon: task.category?.icon ?? "event", text: task.note };
  }
  if (task.category) {
    return { icon: task.category.icon, text: task.category.name };
  }
  if (task.dueDate) {
    return { icon: "event", text: formatShortDate(task.dueDate) };
  }
  return { icon: "event", text: "Sin fecha" };
}
