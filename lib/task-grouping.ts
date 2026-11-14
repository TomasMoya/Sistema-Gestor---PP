import { diffInCalendarDays, parseISODate } from "./format";
import type { Priority, Task } from "./types";

export type TaskGroupKey = "overdue" | "today" | "tomorrow" | "week" | "later" | "no-date" | "done";

export interface TaskGroup {
  key: TaskGroupKey;
  label: string;
  tasks: Task[];
}

const GROUP_LABELS: Record<TaskGroupKey, string> = {
  overdue: "Vencidas",
  today: "Hoy",
  tomorrow: "Mañana",
  week: "Esta semana",
  later: "Más adelante",
  "no-date": "Sin fecha",
  done: "Hechas",
};

export const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function compareTasks(a: Task, b: Task): number {
  const da = a.dueDate ? parseISODate(a.dueDate).getTime() : Infinity;
  const db = b.dueDate ? parseISODate(b.dueDate).getTime() : Infinity;
  if (da !== db) return da - db;
  return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
}

/**
 * Agrupa tareas por vencimiento (§6.1 del handoff): Vencidas · Hoy · Mañana · Esta semana ·
 * Más adelante · Sin fecha · Hechas, ocultando los grupos vacíos.
 *
 * "Esta semana" llega hasta el sábado que sigue a `today` (semana domingo-sábado): así el
 * domingo siguiente ya cuenta como "Más adelante", que es como se agrupan los datos de
 * referencia del handoff (p. ej. "Revisar facturas pendientes", 01/11, un domingo, cae en
 * "Más adelante" y no en "Esta semana").
 */
export function groupTasks(tasks: Task[], today: Date): TaskGroup[] {
  const buckets: Record<Exclude<TaskGroupKey, "done">, Task[]> = {
    overdue: [],
    today: [],
    tomorrow: [],
    week: [],
    later: [],
    "no-date": [],
  };
  const done: Task[] = [];

  const daysUntilSaturday = 6 - today.getDay();

  for (const task of tasks) {
    if (task.done) {
      done.push(task);
      continue;
    }
    if (!task.dueDate) {
      buckets["no-date"].push(task);
      continue;
    }
    const diff = diffInCalendarDays(parseISODate(task.dueDate), today);
    if (diff < 0) buckets.overdue.push(task);
    else if (diff === 0) buckets.today.push(task);
    else if (diff === 1) buckets.tomorrow.push(task);
    else if (diff <= daysUntilSaturday) buckets.week.push(task);
    else buckets.later.push(task);
  }

  const order: Exclude<TaskGroupKey, "done">[] = ["overdue", "today", "tomorrow", "week", "later", "no-date"];
  const groups: TaskGroup[] = order.map((key) => ({
    key,
    label: GROUP_LABELS[key],
    tasks: [...buckets[key]].sort(compareTasks),
  }));
  groups.push({ key: "done", label: GROUP_LABELS.done, tasks: [...done].sort(compareTasks) });

  return groups.filter((group) => group.tasks.length > 0);
}

export function countByPriority(tasks: Task[]): Record<Priority, number> {
  return tasks.reduce(
    (acc, task) => {
      if (!task.done) acc[task.priority] += 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 } as Record<Priority, number>,
  );
}
