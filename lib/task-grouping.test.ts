import { describe, expect, it } from "vitest";
import { parseISODate } from "./format";
import { countByPriority, groupTasks } from "./task-grouping";
import type { Task } from "./types";

/** Mismos datos de ejemplo del handoff (§7), anclados al martes 27/10/2026. */
const TODAY_ISO = "2026-10-27";
const TODAY = parseISODate(TODAY_ISO);

const SAMPLE_TASKS: Task[] = [
  { id: "t1", title: "Llamar a la aseguradora", dueDate: "2026-10-27", priority: "medium", done: false },
  { id: "t2", title: "Revisar gastos del mes", dueDate: "2026-10-27", priority: "medium", done: false },
  { id: "t3", title: "Comprar leche y pan", dueDate: "2026-10-28", priority: "low", done: false },
  { id: "t4", title: "Renovar el seguro", dueDate: "2026-10-29", priority: "high", done: false },
  { id: "t5", title: "Pagar la luz", dueDate: "2026-10-30", priority: "medium", done: false },
  { id: "t6", title: "Entregar informe Q4", dueDate: "2026-10-31", priority: "high", done: false },
  { id: "t7", title: "Revisar facturas pendientes", dueDate: "2026-11-01", priority: "high", done: false },
  { id: "t8", title: "Planificar presupuesto de noviembre", priority: "medium", done: false },
];

function groupKeys(tasks: Task[]) {
  return groupTasks(tasks, TODAY).map((g) => g.key);
}

describe("groupTasks", () => {
  it("agrupa los datos de ejemplo del handoff en el orden y con el contenido esperados", () => {
    const groups = groupTasks(SAMPLE_TASKS, TODAY);
    expect(groups.map((g) => g.key)).toEqual(["today", "tomorrow", "week", "later", "no-date"]);

    const byKey = Object.fromEntries(groups.map((g) => [g.key, g.tasks.map((t) => t.title)]));
    expect(byKey.today).toEqual(["Llamar a la aseguradora", "Revisar gastos del mes"]);
    expect(byKey.tomorrow).toEqual(["Comprar leche y pan"]);
    expect(byKey.week).toEqual(["Renovar el seguro", "Pagar la luz", "Entregar informe Q4"]);
    expect(byKey.later).toEqual(["Revisar facturas pendientes"]);
    expect(byKey["no-date"]).toEqual(["Planificar presupuesto de noviembre"]);
  });

  it("oculta los grupos vacíos", () => {
    const tasks: Task[] = [{ id: "1", title: "Única", priority: "medium", dueDate: TODAY_ISO, done: false }];
    expect(groupKeys(tasks)).toEqual(["today"]);
  });

  it("agrupa las vencidas por separado y antes que Hoy", () => {
    const tasks: Task[] = [
      { id: "1", title: "Vencida", priority: "high", dueDate: "2026-10-20", done: false },
      { id: "2", title: "De hoy", priority: "medium", dueDate: TODAY_ISO, done: false },
    ];
    expect(groupKeys(tasks)).toEqual(["overdue", "today"]);
  });

  it("deja el domingo que sigue a la semana actual en Más adelante, no en Esta semana", () => {
    // Martes 27/10/2026: el sábado 31/10 es el último día de "esta semana"; el domingo
    // 1/11 ya es la semana siguiente, como en los datos de referencia del handoff.
    const tasks: Task[] = [
      { id: "1", title: "Sábado", priority: "medium", dueDate: "2026-10-31", done: false },
      { id: "2", title: "Domingo siguiente", priority: "medium", dueDate: "2026-11-01", done: false },
    ];
    const groups = groupTasks(tasks, TODAY);
    expect(groups.find((g) => g.key === "week")?.tasks.map((t) => t.id)).toEqual(["1"]);
    expect(groups.find((g) => g.key === "later")?.tasks.map((t) => t.id)).toEqual(["2"]);
  });

  it("ordena dentro de un grupo por fecha y luego por prioridad", () => {
    const tasks: Task[] = [
      { id: "low", title: "Baja", priority: "low", dueDate: "2026-10-30", done: false },
      { id: "high", title: "Alta", priority: "high", dueDate: "2026-10-30", done: false },
      { id: "earlier", title: "Antes", priority: "low", dueDate: "2026-10-29", done: false },
    ];
    const week = groupTasks(tasks, TODAY).find((g) => g.key === "week");
    expect(week?.tasks.map((t) => t.id)).toEqual(["earlier", "high", "low"]);
  });

  it("separa las tareas sin fecha y las completadas en sus propios grupos", () => {
    const tasks: Task[] = [
      { id: "1", title: "Sin fecha", priority: "medium", done: false },
      { id: "2", title: "Hecha", priority: "medium", dueDate: TODAY_ISO, done: true },
    ];
    expect(groupKeys(tasks)).toEqual(["no-date", "done"]);
  });
});

describe("countByPriority", () => {
  it("cuenta solo las tareas pendientes de los datos de ejemplo", () => {
    expect(countByPriority(SAMPLE_TASKS)).toEqual({ high: 3, medium: 4, low: 1 });
  });

  it("no cuenta las tareas completadas", () => {
    const tasks: Task[] = [
      { id: "1", title: "A", priority: "high", done: true },
      { id: "2", title: "B", priority: "high", done: false },
    ];
    expect(countByPriority(tasks)).toEqual({ high: 1, medium: 0, low: 0 });
  });
});
