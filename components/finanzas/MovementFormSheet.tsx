"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import type { Category } from "@/types/category";

export interface MovementFormInput {
  type: "ingreso" | "gasto";
  amount: number;
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
  defaultDate: string;
}

/** Hoja (móvil) / diálogo (escritorio) para crear o editar un ingreso o gasto. */
export function MovementFormSheet({ categories, initial, onClose, onSubmit, defaultDate }: MovementFormSheetProps) {
  const [type, setType] = useState<"ingreso" | "gasto">(initial?.type ?? "gasto");
  const [amount, setAmount] = useState(initial ? (initial.amount / 100).toString().replace(".", ",") : "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [note, setNote] = useState(initial?.note ?? "");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!value || value <= 0) return;
    onSubmit({
      type,
      amount: Math.round(value * 100),
      category: type === "gasto" && category ? category : undefined,
      date,
      note: note.trim() || undefined,
    });
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
        {type === "gasto" && (
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
