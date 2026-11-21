"use client";

import { useState, type FormEvent } from "react";
import { Button } from "./Button";
import { Field } from "./Field";
import { Sheet } from "./Sheet";
import type { CreateCategoryInput } from "@/lib/repositories/categories-repository";
import type { TipoCategoria } from "@/types/category";

interface CategoryFormSheetProps {
  onClose: () => void;
  onSubmit: (input: CreateCategoryInput) => void;
  /**
   * En Finanzas la categoría sí se asocia a un gasto o un ingreso, así que tiene sentido elegir el tipo.
   * En Tareas una categoría es solo una etiqueta (Trabajo, Personal, etc.): se oculta el selector y se
   * guarda como "gasto" por defecto (la columna es NOT NULL en la base, pero nada de la app filtra por
   * ese valor fuera de Finanzas).
   */
  showTipo?: boolean;
}

/** Hoja para dar de alta una categoría nueva desde el selector de categoría de otro formulario (Tareas o Finanzas). */
export function CategoryFormSheet({ onClose, onSubmit, showTipo = true }: CategoryFormSheetProps) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<TipoCategoria>("gasto");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!nombre.trim()) return;
    onSubmit({ nombre: nombre.trim(), tipo });
  }

  return (
    <Sheet
      title="Nueva categoría"
      onClose={onClose}
      footer={
        <>
          <Button variant="text" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="filled" icon="check" type="submit" form="new-category-form">
            Guardar
          </Button>
        </>
      }
    >
      <form id="new-category-form" onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--space-4)" }}>
        <Field label="Nombre" htmlFor="category-name">
          <input
            id="category-name"
            className="gp-field__control"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            required
            autoFocus
          />
        </Field>
        {showTipo && (
          <Field label="Tipo" htmlFor="category-type">
            <div className="gp-segmented" role="radiogroup" aria-label="Tipo de categoría" id="category-type">
              <button type="button" role="radio" aria-checked={tipo === "gasto"} onClick={() => setTipo("gasto")}>
                Gasto
              </button>
              <button type="button" role="radio" aria-checked={tipo === "ingreso"} onClick={() => setTipo("ingreso")}>
                Ingreso
              </button>
            </div>
          </Field>
        )}
      </form>
    </Sheet>
  );
}
