export type Prioridad = "alta" | "media" | "baja";
export type EstadoTarea = "pendiente" | "hecho";

export interface Task {
  id: string;
  user_id: string;
  category_id: string | null;
  titulo: string;
  nota: string | null;
  fecha_vencimiento: string | null;
  costo_previsto: number | null;
  prioridad: Prioridad;
  estado: EstadoTarea;
  recordatorio: string | null;
  es_pago: boolean;
  eliminado: boolean;
  created_at: string;
}

export type TaskInsert = Pick<Task, "user_id" | "titulo"> &
  Partial<Pick<Task, "category_id" | "nota" | "fecha_vencimiento" | "costo_previsto" | "prioridad" | "estado" | "recordatorio" | "es_pago">>;

export type TaskUpdate = Partial<
  Pick<
    Task,
    "category_id" | "titulo" | "nota" | "fecha_vencimiento" | "costo_previsto" | "prioridad" | "estado" | "recordatorio" | "es_pago" | "eliminado"
  >
>;
