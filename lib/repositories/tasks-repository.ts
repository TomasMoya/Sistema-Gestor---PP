import { addDays, toISODate } from "../format";
import { fetchCategoryMap } from "./categories-repository";
import type { CategoryRef, Priority, Task } from "../types";
import type { Task as DbTask } from "@/types/task";

type CategoryMap = Map<string, CategoryRef & { colorVar: string }>;

export interface CreateTaskInput {
  title: string;
  dueDate?: string;
  priority: Priority;
  /** Id de una fila de `categories`. */
  category?: string;
  amount?: number; // céntimos
}

/**
 * Puerto que desacopla la UI de dónde viven los datos. Esta implementación llama a la API real
 * (`/api/tasks`), respaldada por Supabase; antes hubo una versión en memoria con datos simulados.
 */
export interface TasksRepository {
  listTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  setTaskDone(id: string, done: boolean): Promise<Task>;
  postpone(id: string, days: number): Promise<Task>;
  setDueDate(id: string, dueDate?: string): Promise<Task>;
  createTask(input: CreateTaskInput): Promise<Task>;
  updateTask(id: string, input: CreateTaskInput): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  restoreTask(id: string): Promise<Task>;
}

const PRIORITY_TO_DB: Record<Priority, DbTask["prioridad"]> = { high: "alta", medium: "media", low: "baja" };
const PRIORITY_FROM_DB: Record<DbTask["prioridad"], Priority> = { alta: "high", media: "medium", baja: "low" };

function defaultUserId(): string {
  const userId = process.env.NEXT_PUBLIC_DEFAULT_USER_ID;
  if (!userId) throw new Error("Falta NEXT_PUBLIC_DEFAULT_USER_ID en el entorno");
  return userId;
}

function toTask(row: DbTask, categoryMap: CategoryMap): Task {
  return {
    id: row.id,
    title: row.titulo,
    dueDate: row.fecha_vencimiento ?? undefined,
    priority: PRIORITY_FROM_DB[row.prioridad],
    category: row.category_id ? categoryMap.get(row.category_id) : undefined,
    note: row.nota ?? undefined,
    amount: row.costo_previsto != null ? Math.round(row.costo_previsto * 100) : undefined,
    done: row.estado === "hecho",
    paymentId: row.es_pago ? row.id : undefined,
  };
}

async function parseTaskResponse(res: Response): Promise<Task> {
  if (!res.ok) throw new Error("No se pudo guardar la tarea");
  const row: DbTask = await res.json();
  const categoryMap = await fetchCategoryMap();
  return toTask(row, categoryMap);
}

function taskInputToDbFields(input: CreateTaskInput) {
  return {
    titulo: input.title,
    fecha_vencimiento: input.dueDate ?? null,
    prioridad: PRIORITY_TO_DB[input.priority],
    category_id: input.category ?? null,
    costo_previsto: input.amount != null ? input.amount / 100 : null,
    es_pago: input.amount != null,
  };
}

export const tasksRepository: TasksRepository = {
  async listTasks() {
    const [res, categoryMap] = await Promise.all([fetch("/api/tasks"), fetchCategoryMap()]);
    if (!res.ok) throw new Error("No se pudieron cargar las tareas");
    const rows: DbTask[] = await res.json();
    return rows.map((row) => toTask(row, categoryMap));
  },

  async getTask(id) {
    const res = await fetch(`/api/tasks/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("No se pudo cargar la tarea");
    const row: DbTask = await res.json();
    const categoryMap = await fetchCategoryMap();
    return toTask(row, categoryMap);
  },

  async setTaskDone(id, done) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: done ? "hecho" : "pendiente" }),
    });
    return parseTaskResponse(res);
  },

  async postpone(id, days) {
    const current = await fetch(`/api/tasks/${id}`);
    if (!current.ok) throw new Error("No se pudo cargar la tarea");
    const row: DbTask = await current.json();
    const fecha_vencimiento = row.fecha_vencimiento ? addDays(row.fecha_vencimiento, days) : toISODate(new Date());

    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha_vencimiento }),
    });
    return parseTaskResponse(res);
  },

  async setDueDate(id, dueDate) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha_vencimiento: dueDate ?? null }),
    });
    return parseTaskResponse(res);
  },

  async createTask(input) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: defaultUserId(), ...taskInputToDbFields(input) }),
    });
    return parseTaskResponse(res);
  },

  async updateTask(id, input) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskInputToDbFields(input)),
    });
    return parseTaskResponse(res);
  },

  async deleteTask(id) {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("No se pudo eliminar la tarea");
  },

  async restoreTask(id) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eliminado: false }),
    });
    return parseTaskResponse(res);
  },
};
