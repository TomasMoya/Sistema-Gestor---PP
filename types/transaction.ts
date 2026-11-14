export type TipoTransaccion = "ingreso" | "gasto";

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  task_id: string | null;
  tipo: TipoTransaccion;
  monto: number;
  fecha: string;
  descripcion: string | null;
  limite: number | null;
  eliminado: boolean;
  created_at: string;
}

export type TransactionInsert = Pick<Transaction, "user_id" | "tipo" | "monto"> &
  Partial<Pick<Transaction, "category_id" | "task_id" | "fecha" | "descripcion" | "limite">>;

export type TransactionUpdate = Partial<
  Pick<Transaction, "category_id" | "task_id" | "tipo" | "monto" | "fecha" | "descripcion" | "limite" | "eliminado">
>;
