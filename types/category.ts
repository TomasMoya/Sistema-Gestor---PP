export type TipoCategoria = "gasto" | "ingreso";

export interface Category {
  id: string;
  user_id: string;
  nombre: string;
  tipo: TipoCategoria;
  icono: string | null;
  created_at: string;
}

export type CategoryInsert = Pick<Category, "user_id" | "nombre" | "tipo"> & Partial<Pick<Category, "icono">>;
