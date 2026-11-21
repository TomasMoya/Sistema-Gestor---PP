"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { CategoryFormSheet } from "@/components/ui/CategoryFormSheet";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Sheet } from "@/components/ui/Sheet";
import { COIN_OPTIONS, type Coins } from "@/lib/coins/coin";
import type { CreateCategoryInput } from "@/lib/repositories/categories-repository";
import type { Category } from "@/types/category";

export interface MovementFormInput {
  type: "ingreso" | "gasto";
  amount: number;
  currency: Coins;
  category?: string;
  date: string;
  note?: string;
}

interface MovementFormSheetProps {
  categories: Category[];
  /** Si se pasa, la hoja abre en modo edición precargada con estos valores. */
  initial?: MovementFormInput;
  onClose: () => void;
  onSubmit: (input: MovementFormInput) => void;
  onCreateCategory: (input: CreateCategoryInput) => Promise<Category>;
  defaultDate: string;
}

/** Hoja (móvil) / diálogo (escritorio) para crear o editar un ingreso o gasto. */
export function MovementFormSheet({ categories, initial, onClose, onSubmit, onCreateCategory, defaultDate }: MovementFormSheetProps) {
  const [type, setType] = useState<"ingreso" | "gasto">(initial?.type ?? "gasto");
  const [amount, setAmount] = useState(initial ? (initial.amount / 100).toString().replace(".", ",") : "");
  const [currency, setCurrency] = useState<Coins>(initial?.currency ?? "EUR");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [note, setNote] = useState(initial?.note ?? "");
  const [addingCategory, setAddingCategory] = useState(false);

  async function handleCreateCategory(input: CreateCategoryInput) {
    const created = await onCreateCategory(input);
    setCategory(created.id);
    setAddingCategory(false);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!value || value <= 0) return;
    onSubmit({
      type,
      amount: Math.round(value * 100),
      currency,
      category: type === "gasto" && category ? category : undefined,
      date,
      note: note.trim() || undefined,
    });
  }

  if (addingCategory) {
    return <CategoryFormSheet onClose={() => setAddingCategory(false)} onSubmit={handleCreateCategory} />;
  }

  return (
    <Sheet
      title={initial ? "Editar movimiento" : "Nuevo movimiento"}
      onClose={onClose}
      footer={
        <>
          <Button variant="text" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="filled" icon="check" type="submit" form="new-movement-form">
            Guardar
          </Button>
        </>
      }
    >
      <form id="new-movement-form" onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--space-4)" }}>
        <Field label="Tipo" htmlFor="movement-type">
          <div className="gp-segmented" role="radiogroup" aria-label="Tipo de movimiento" id="movement-type">
            <button type="button" role="radio" aria-checked={type === "ingreso"} onClick={() => setType("ingreso")}>
              Ingreso
            </button>
            <button type="button" role="radio" aria-checked={type === "gasto"} onClick={() => setType("gasto")}>
              Gasto
            </button>
          </div>
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "var(--space-3)" }}>
          <Field label="Importe" htmlFor="movement-amount">
            <input
              id="movement-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              autoFocus
              className="gp-field__control"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0,00"
            />
          </Field>
          <Field label="Moneda" htmlFor="movement-currency">
            <select
              id="movement-currency"
              className="gp-field__control"
              value={currency}
              onChange={(event) => setCurrency(event.target.value as Coins)}
            >
              {COIN_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {type === "gasto" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "var(--space-3)" }}>
            <Field label="Categoría" htmlFor="movement-category">
              <select
                id="movement-category"
                className="gp-field__control"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">Sin categoría</option>
                {categories.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.nombre}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Agregar" htmlFor="movement-category-add">
              <button
                id="movement-category-add"
                type="button"
                className="gp-field__control"
                aria-label="Nueva categoría"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "var(--touch-target)" }}
                onClick={() => setAddingCategory(true)}
              >
                <Icon name="add" />
              </button>
            </Field>
          </div>
        )}
        <Field label="Fecha" htmlFor="movement-date">
          <input id="movement-date" type="date" className="gp-field__control" value={date} onChange={(event) => setDate(event.target.value)} />
        </Field>
        <Field label="Nota (opcional)" htmlFor="movement-note">
          <input id="movement-note" className="gp-field__control" value={note} onChange={(event) => setNote(event.target.value)} />
        </Field>
      </form>
    </Sheet>
  );
}
