import type { Task } from "../types";

/**
 * No hay entidad "evento" todavía (solo tareas y pagos): la tabla `calendar_events` no existe en
 * la base real. Una tarea con `paymentId` (es_pago) se muestra como pago; el resto, como tarea.
 */
export type CalendarItemType = "task" | "payment";

export function itemType(task: Task): CalendarItemType {
  return task.paymentId ? "payment" : "task";
}

export const CALENDAR_TYPE_LABEL: Record<CalendarItemType, string> = {
  task: "Tarea",
  payment: "Pago",
};

/** Agrupa las tareas con fecha por día (`yyyy-mm-dd`), para buscar los elementos de una celda o de la agenda en O(1). */
export function groupTasksByDate(tasks: Task[]): Map<string, Task[]> {
  const map = new Map<string, Task[]>();
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const list = map.get(task.dueDate);
    if (list) list.push(task);
    else map.set(task.dueDate, [task]);
  }
  return map;
}
