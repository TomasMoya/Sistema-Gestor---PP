import type { CategoryRef } from "../types";
import type { Category } from "@/types/category";

/** Solo hay 4 tokens de color de categoría en el sistema de diseño (§tokens.css): se ciclan por índice. */
const CATEGORY_COLOR_VARS = ["var(--cat-home)", "var(--cat-leisure)", "var(--cat-food)", "var(--cat-transport)"];
const DEFAULT_CATEGORY_ICON = "label";

export interface CategoriesRepository {
  listCategories(): Promise<Category[]>;
}

export const categoriesRepository: CategoriesRepository = {
  async listCategories() {
    const res = await fetch("/api/categories");
    if (!res.ok) throw new Error("No se pudieron cargar las categorías");
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
