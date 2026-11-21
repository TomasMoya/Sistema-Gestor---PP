import type { Coins } from "./coins/coin";

export type Priority = "high" | "medium" | "low";

/** Categoría resuelta para mostrar en la UI (nombre/icono vienen de la tabla `categories`). */
export interface CategoryRef {
  id: string;
  name: string;
  icon: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate?: string; // ISO yyyy-mm-dd
  priority: Priority;
  category?: CategoryRef;
  /** Sustituye a la etiqueta de categoría en los metadatos cuando quiere decir algo más específico. */
  note?: string;
  amount?: number; // céntimos
  done: boolean;
  /** Presente cuando la tarea también es un pago (es_pago): su id es el mismo que el de la tarea. */
  paymentId?: string;
}

export interface UpcomingPayment {
  id: string;
  concept: string;
  amount: number; // céntimos
  dueDate: string;
  taskId?: string;
  paid: boolean;
}

export interface CategorySpend {
  id: string;
  name: string;
  icon: string;
  colorVar: string;
  amount: number; // céntimos
}

export interface MonthSummary {
  month: string; // yyyy-mm
  income: number; // céntimos
  expenses: number; // céntimos
  budget: number; // céntimos
}

export interface FinanceData {
  summary: MonthSummary;
  upcomingPayments: UpcomingPayment[];
  categories: CategorySpend[];
}

/** Un gasto individual (vista "Ver detalle", §Gastos por categoría). */
export interface Movement {
  id: string;
  amount: number; // céntimos
  currency: Coins;
  date: string; // ISO yyyy-mm-dd
  note?: string;
  category?: CategoryRef;
}
