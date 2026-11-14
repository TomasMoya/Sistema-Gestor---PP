import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { AppBar } from "@/components/ui/AppBar";
import { ChipGroup, FilterChip } from "@/components/ui/FilterChip";
import { GroupedList } from "@/components/ui/GroupedList";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { TaskItem } from "@/components/ui/TaskItem";
import { parseISODate } from "@/lib/format";
import type { Task } from "@/lib/types";

const TODAY = parseISODate("2026-10-27");

const SAMPLE_TASKS: Task[] = [
  { id: "t1", title: "Llamar a la aseguradora", dueDate: "2026-10-27", priority: "medium", done: false },
  { id: "t2", title: "Revisar gastos del mes", dueDate: "2026-10-27", priority: "medium", done: false },
  { id: "t3", title: "Comprar leche y pan", dueDate: "2026-10-28", priority: "low", done: false },
];

describe("accesibilidad automatizada (axe)", () => {
  it("la cabecera, los filtros de prioridad y el resumen financiero no tienen violaciones serias", async () => {
    const { container } = render(
      <div>
        <AppBar overline="Tareas · 8 pendientes" title="Martes, 27 oct" />
        <ChipGroup label="Filtrar por prioridad">
          <FilterChip label="Todas" count={8} selected onClick={() => {}} />
          <FilterChip label="Alta" count={3} selected={false} onClick={() => {}} />
        </ChipGroup>
        <SummaryCard available={116000} income={280000} expenses={164000} budget={200000} monthLabel="octubre" />
      </div>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("una lista agrupada de tareas (casilla, título, prioridad, menú) no tiene violaciones serias", async () => {
    const { container } = render(
      <GroupedList aria-label="Hoy">
        {SAMPLE_TASKS.map((task) => (
          <TaskItem key={task.id} task={task} today={TODAY} onToggle={() => {}} onOpen={() => {}} onPostpone={() => {}} onDelete={() => {}} />
        ))}
      </GroupedList>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
