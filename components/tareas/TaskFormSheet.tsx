"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { PRIORITY_TAG } from "@/lib/priority";
import type { Priority, Task } from "@/lib/types";
import type { Category } from "@/types/category";

export interface TaskFormInput {
  title: string;
  dueDate?: string;
  priority: Priority;
  category?: string;
  amount?: number;
}

/** Precarga la hoja de edición con los valores actuales de la tarea. */
export function taskToFormInitial(task: Task): TaskFormInput {
  return {
    title: task.title,
    dueDate: task.dueDate,
    priority: task.priority,
    category: task.category?.id,
    amount: task.amount,
  };
}

interface TaskFormSheetProps {
  categories: Category[];
  /** Si se pasa, la hoja abre en modo edición precargada con estos valores. */
  initial?: TaskFormInput;
  onClose: () => void;
  onSubmit: (input: TaskFormInput) => void;
}

const PRIORITIES: Priority[] = ["high", "medium", "low"];

/** Hoja inferior (móvil) / diálogo (escritorio) para crear o editar una tarea. Prioridad Media por defecto. */
export function TaskFormSheet({ categories, initial, onClose, onSubmit }: TaskFormSheetProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "medium");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [amount, setAmount] = useState(initial?.amount != null ? (initial.amount / 100).toString().replace(".", ",") : "");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      dueDate: dueDate || undefined,
      priority,
      category: category || undefined,
      amount: amount ? Math.round(parseFloat(amount.replace(",", ".")) * 100) : undefined,
    });
  }

  return (
    <Sheet
      title={initial ? "Editar tarea" : "Nueva tarea"}
      onClose={onClose}
      footer={
        <>
          <Button variant="text" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="filled" icon="check" type="submit" form="new-task-form">
            Guardar
          </Button>
        </>
      }
    >
      <form id="new-task-form" onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--space-4)" }}>
        <Field label="Título" htmlFor="task-title">
          <input
            id="task-title"
            className="gp-field__control"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            autoFocus
          />
        </Field>
        <Field label="Fecha" htmlFor="task-date">
          <input id="task-date" type="date" className="gp-field__control" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </Field>
        <Field label="Prioridad" htmlFor="task-priority">
          <div className="gp-segmented" role="radiogroup" aria-label="Prioridad" id="task-priority">
            {PRIORITIES.map((value) => (
              <button key={value} type="button" role="radio" aria-checked={priority === value} onClick={() => setPriority(value)}>
                {PRIORITY_TAG[value].label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Categoría" htmlFor="task-category">
          <select
            id="task-category"
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
        <Field label="Importe (opcional)" htmlFor="task-amount">
          <input
            id="task-amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            className="gp-field__control"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0,00"
          />
        </Field>
      </form>
    </Sheet>
  );
}
