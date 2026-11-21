import { convertTotal, monthKeyToDate, toISODate } from "../format";
import { fetchCategoryMap } from "./categories-repository";
import type { FinanceData, Movement } from "../types";
import type { Coins } from "../coins/coin";
import type { Task as DbTask } from "@/types/task";
import type { Transaction as DbTransaction } from "@/types/transaction";

/** Moneda en la que se muestran los totales (resumen y gasto por categoría) hasta que haya un selector en la UI. */
export const DISPLAY_CURRENCY: Coins = "EUR";

export interface CreateMovementInput {
  type: "ingreso" | "gasto";
  amount: number; // céntimos
  currency: Coins;
  /** Id de una fila de `categories`. */
  category?: string;
  date: string;
  note?: string;
}

/**
 * Puerto que desacopla la UI de dónde viven los datos. Esta implementación llama a la API real
 * (`/api/transactions` y `/api/tasks`), respaldada por Supabase. No hay todavía presupuestos
 * mensuales configurables desde la UI, así que `summary.budget` queda en 0 (la tarjeta de
 * resumen ya oculta la barra de presupuesto cuando vale 0).
 */
export interface FinanceRepository {
  getMonthData(month: string): Promise<FinanceData>;
  /** El mes del movimiento lo determina `input.date`, no hace falta pasarlo aparte. */
  createMovement(input: CreateMovementInput): Promise<void>;
  /** Gastos individuales del mes (vista "Ver detalle"), no agrupados por categoría. */
  listMovements(month: string): Promise<Movement[]>;
  updateMovement(id: string, input: CreateMovementInput): Promise<void>;
  deleteMovement(id: string): Promise<void>;
  restoreMovement(id: string): Promise<void>;
}

function defaultUserId(): string {
  const userId = process.env.NEXT_PUBLIC_DEFAULT_USER_ID;
  if (!userId) throw new Error("Falta NEXT_PUBLIC_DEFAULT_USER_ID en el entorno");
  return userId;
}

function monthRange(month: string): { desde: string; hasta: string } {
  const start = monthKeyToDate(month);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  return { desde: toISODate(start), hasta: toISODate(end) };
}

function movementInputToDbFields(input: CreateMovementInput) {
  return {
    tipo: input.type,
    monto: input.amount / 100,
    currency: input.currency,
    category_id: input.category ?? null,
    fecha: input.date,
    descripcion: input.note ?? null,
  };
}

export const financeRepository: FinanceRepository = {
  async getMonthData(month) {
    const { desde, hasta } = monthRange(month);

    const [transactionsRes, tasksRes, categoryMap] = await Promise.all([
      fetch(`/api/transactions?desde=${desde}&hasta=${hasta}`),
      fetch("/api/tasks"),
      fetchCategoryMap(),
    ]);
    if (!transactionsRes.ok) throw new Error("No se pudieron cargar los movimientos");
    if (!tasksRes.ok) throw new Error("No se pudieron cargar las tareas");

    const transactions: DbTransaction[] = await transactionsRes.json();
    const tasks: DbTask[] = await tasksRes.json();

    const incomeEntries: { amount: number; currency: Coins }[] = [];
    const expenseEntries: { amount: number; currency: Coins }[] = [];
    const byCategory = new Map<string, { amount: number; currency: Coins }[]>();
    for (const tx of transactions) {
      const entry = { amount: Math.round(tx.monto * 100), currency: tx.currency };
      if (tx.tipo === "ingreso") {
        incomeEntries.push(entry);
      } else {
        expenseEntries.push(entry);
        if (tx.category_id) {
          const entries = byCategory.get(tx.category_id) ?? [];
          entries.push(entry);
          byCategory.set(tx.category_id, entries);
        }
      }
    }

    const [income, expenses, categoryAmounts] = await Promise.all([
      convertTotal(incomeEntries, DISPLAY_CURRENCY),
      convertTotal(expenseEntries, DISPLAY_CURRENCY),
      Promise.all(
        [...byCategory.entries()].map(
          async ([categoryId, entries]) => [categoryId, await convertTotal(entries, DISPLAY_CURRENCY)] as const,
        ),
      ),
    ]);
    const categoryAmountMap = new Map(categoryAmounts);

    const categories = [...categoryAmountMap.entries()]
      .map(([categoryId, amount]) => {
        const category = categoryMap.get(categoryId);
        return category ? { id: category.id, name: category.name, icon: category.icon, colorVar: category.colorVar, amount } : null;
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    const upcomingPayments = tasks
      .filter((task) => task.es_pago && task.fecha_vencimiento?.startsWith(month))
      .map((task) => ({
        id: task.id,
        concept: task.titulo,
        amount: task.costo_previsto != null ? Math.round(task.costo_previsto * 100) : 0,
        dueDate: task.fecha_vencimiento as string,
        taskId: task.id,
        paid: task.estado === "hecho",
      }));

    return {
      summary: { month, income, expenses, budget: 0 },
      upcomingPayments,
      categories,
    };
  },

  async createMovement(input) {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: defaultUserId(), ...movementInputToDbFields(input) }),
    });
    if (!res.ok) throw new Error("No se pudo guardar el movimiento");
  },

  async listMovements(month) {
    const { desde, hasta } = monthRange(month);
    const [res, categoryMap] = await Promise.all([
      fetch(`/api/transactions?tipo=gasto&desde=${desde}&hasta=${hasta}`),
      fetchCategoryMap(),
    ]);
    if (!res.ok) throw new Error("No se pudieron cargar los movimientos");
    const rows: DbTransaction[] = await res.json();
    return rows.map((row) => ({
      id: row.id,
      amount: Math.round(row.monto * 100),
      currency: row.currency,
      date: row.fecha,
      note: row.descripcion ?? undefined,
      category: row.category_id ? categoryMap.get(row.category_id) : undefined,
    }));
  },

  async updateMovement(id, input) {
    const res = await fetch(`/api/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movementInputToDbFields(input)),
    });
    if (!res.ok) throw new Error("No se pudo guardar el movimiento");
  },

  async deleteMovement(id) {
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("No se pudo eliminar el movimiento");
  },

  async restoreMovement(id) {
    const res = await fetch(`/api/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eliminado: false }),
    });
    if (!res.ok) throw new Error("No se pudo deshacer");
  },
};
