"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { GroupedList } from "@/components/ui/GroupedList";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { Snackbar } from "@/components/ui/Snackbar";
import { MovementFormSheet, type MovementFormInput } from "./MovementFormSheet";
import { MovementRow } from "./MovementRow";
import { formatMonthYear, monthKeyToDate } from "@/lib/format";
import { categoriesRepository, type CreateCategoryInput } from "@/lib/repositories/categories-repository";
import { financeRepository } from "@/lib/repositories/finance-repository";
import type { Movement } from "@/lib/types";
import type { Category } from "@/types/category";

interface MovementsScreenProps {
  month: string;
}

interface SnackbarState {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

function movementToFormInitial(movement: Movement): MovementFormInput {
  return {
    type: "gasto",
    amount: movement.amount,
    currency: movement.currency,
    category: movement.category?.id,
    date: movement.date,
    note: movement.note,
  };
}

/** Gastos del mes divididos por categoría (§"Ver detalle"), cada uno editable/eliminable desde su menú ⋮. */
export function MovementsScreen({ month }: MovementsScreenProps) {
  const router = useRouter();
  const [movements, setMovements] = useState<Movement[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState<Movement | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  const load = useCallback(async () => {
    setError(false);
    setMovements(null);
    try {
      setMovements(await financeRepository.listMovements(month));
    } catch {
      setError(true);
    }
  }, [month]);

  useEffect(() => {
    // Patrón estándar de carga de datos (sincroniza con la API real), no estado derivado.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    categoriesRepository.listCategories().then(setCategories);
  }, [load]);

  async function handleEditSubmit(input: MovementFormInput) {
    if (!editing) return;
    await financeRepository.updateMovement(editing.id, input);
    setEditing(null);
    load();
  }

  async function handleCreateCategory(input: CreateCategoryInput) {
    const created = await categoriesRepository.createCategory(input);
    setCategories((prev) => [...prev, created]);
    return created;
  }

  async function handleDelete(movement: Movement) {
    setMovements((prev) => (prev ? prev.filter((m) => m.id !== movement.id) : prev));
    await financeRepository.deleteMovement(movement.id);
    setSnackbar({
      message: "Gasto eliminado",
      actionLabel: "Deshacer",
      onAction: async () => {
        await financeRepository.restoreMovement(movement.id);
        load();
      },
    });
  }

  const groups = (() => {
    if (!movements) return [];
    const byCategory = new Map<string, { label: string; total: number; movements: Movement[] }>();
    for (const movement of movements) {
      const key = movement.category?.id ?? "sin-categoria";
      const label = movement.category?.name ?? "Sin categoría";
      const group = byCategory.get(key) ?? { label, total: 0, movements: [] };
      group.total += movement.amount;
      group.movements.push(movement);
      byCategory.set(key, group);
    }
    return [...byCategory.values()].sort((a, b) => b.total - a.total);
  })();

  return (
    <>
      <AppBar overline="Finanzas" title={`Gastos por categoría · ${formatMonthYear(monthKeyToDate(month))}`}>
        <IconButton icon="arrow_back" ariaLabel="Volver a Finanzas" onClick={() => router.push("/finanzas")} />
      </AppBar>

      {error && <ErrorState onRetry={load} />}

      {!error && movements === null && <Skeleton count={5} />}

      {!error && movements !== null && groups.length === 0 && <EmptyState icon="donut_large" text="Aún no hay gastos este mes." />}

      {!error &&
        groups.map((group) => (
          <div key={group.label} style={{ display: "grid", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
            <div className="gp-group-label">
              <span>{group.label}</span>
              <span>{group.movements.length}</span>
            </div>
            <GroupedList aria-label={group.label}>
              {group.movements.map((movement) => (
                <MovementRow key={movement.id} movement={movement} onEdit={() => setEditing(movement)} onDelete={() => handleDelete(movement)} />
              ))}
            </GroupedList>
          </div>
        ))}

      {editing && (
        <MovementFormSheet
          categories={categories}
          initial={movementToFormInitial(editing)}
          defaultDate={editing.date}
          onClose={() => setEditing(null)}
          onSubmit={handleEditSubmit}
          onCreateCategory={handleCreateCategory}
        />
      )}

      {snackbar && (
        <Snackbar message={snackbar.message} actionLabel={snackbar.actionLabel} onAction={snackbar.onAction} onClose={() => setSnackbar(null)} />
      )}
    </>
  );
}
