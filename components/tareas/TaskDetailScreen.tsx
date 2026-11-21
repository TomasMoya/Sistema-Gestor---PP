"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { ErrorState } from "@/components/ui/ErrorState";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { TaskDetailContent } from "./TaskDetailContent";
import { TaskFormSheet, taskToFormInitial } from "./TaskFormSheet";
import { getToday } from "@/lib/format";
import { categoriesRepository, type CreateCategoryInput } from "@/lib/repositories/categories-repository";
import { tasksRepository } from "@/lib/repositories/tasks-repository";
import type { Task } from "@/lib/types";
import type { Category } from "@/types/category";

const TODAY = getToday();

/** Pantalla de detalle de tarea en < 840px (ruta propia, §6.1 punto 6 del handoff). */
export function TaskDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState(false);

  async function load() {
    setError(false);
    setTask(undefined);
    try {
      const found = await tasksRepository.getTask(id);
      setTask(found);
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    // Patrón estándar de carga de datos (sincroniza con el repositorio simulado), no estado derivado.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    categoriesRepository.listCategories().then(setCategories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleToggleDone() {
    if (!task) return;
    const done = !task.done;
    const updated = await tasksRepository.setTaskDone(task.id, done);
    setTask(updated);
  }

  async function handleEditSubmit(input: ReturnType<typeof taskToFormInitial>) {
    if (!task) return;
    const updated = await tasksRepository.updateTask(task.id, input);
    setTask(updated);
    setEditing(false);
  }

  async function handleCreateCategory(input: CreateCategoryInput) {
    const created = await categoriesRepository.createCategory(input);
    setCategories((prev) => [...prev, created]);
    return created;
  }

  return (
    <>
      <AppBar overline="Tareas" title="Detalle">
        <IconButton icon="arrow_back" ariaLabel="Volver a Tareas" onClick={() => router.back()} />
      </AppBar>

      {error && <ErrorState onRetry={load} />}
      {!error && task === undefined && <Skeleton variant="card" count={1} />}
      {!error && task === null && <p className="gp-item__meta">No se encontró la tarea.</p>}
      {!error && task && (
        <div className="gp-card gp-detail">
          <TaskDetailContent task={task} today={TODAY} onToggleDone={handleToggleDone} onEdit={() => setEditing(true)} />
        </div>
      )}

      {editing && task && (
        <TaskFormSheet
          categories={categories}
          initial={taskToFormInitial(task)}
          onClose={() => setEditing(false)}
          onSubmit={handleEditSubmit}
          onCreateCategory={handleCreateCategory}
        />
      )}
    </>
  );
}
