import type { CategoryRef } from "../types";
import type { Category, TipoCategoria } from "@/types/category";

/** Solo hay 4 tokens de color de categoría en el sistema de diseño (§tokens.css): se ciclan por índice. */
const CATEGORY_COLOR_VARS = ["var(--cat-home)", "var(--cat-leisure)", "var(--cat-food)", "var(--cat-transport)"];
const DEFAULT_CATEGORY_ICON = "label";
function defaultUserId(): string {
  const userId = process.env.NEXT_PUBLIC_DEFAULT_USER_ID;
  if (!userId) throw new Error("Falta NEXT_PUBLIC_DEFAULT_USER_ID en el entorno");
  return userId;
}

export interface CreateCategoryInput {
  nombre: string;
  tipo: TipoCategoria;
  icono?: string | null;
}

function categoryInputToDbFields(input: CreateCategoryInput) {
  return { nombre: input.nombre, tipo: input.tipo, icono: input.icono ?? null };
}

export interface CategoriesRepository {
  listCategories(): Promise<Category[]>;
  createCategory(input: CreateCategoryInput): Promise<Category>;
}

export const categoriesRepository: CategoriesRepository = {
  async listCategories() {
    const res = await fetch("/api/categories");
    if (!res.ok) throw new Error("No se pudieron cargar las categorías");
    return res.json();
  },
  async createCategory(input) {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: defaultUserId(), ...categoryInputToDbFields(input) }),
    });
    if (!res.ok) throw new Error("No se pudo guardar la categoría");
    return res.json();
  },
};

/** Mapa id -> CategoryRef (nombre/icono resueltos, color cíclico), para denormalizar en tareas y gastos. */
export async function fetchCategoryMap(): Promise<Map<string, CategoryRef & { colorVar: string }>> {
  const categories = await categoriesRepository.listCategories();
  return new Map(
    categories.map((category, index) => [
      category.id,
      {
        id: category.id,
        name: category.nombre,
        icon: category.icono ?? DEFAULT_CATEGORY_ICON,
        colorVar: CATEGORY_COLOR_VARS[index % CATEGORY_COLOR_VARS.length],
      },
    ]),
  );
}
