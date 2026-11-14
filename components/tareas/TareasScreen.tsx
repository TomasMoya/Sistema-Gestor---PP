"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { ChipGroup, FilterChip } from "@/components/ui/FilterChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Fab } from "@/components/ui/Fab";
import { GroupedList } from "@/components/ui/GroupedList";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { Snackbar } from "@/components/ui/Snackbar";
import { TaskItem } from "@/components/ui/TaskItem";
import { TaskDetailContent } from "./TaskDetailContent";
import { TaskFormSheet, taskToFormInitial } from "./TaskFormSheet";
import { formatHeadlineDate, getToday } from "@/lib/format";
import { useIsExpanded } from "@/lib/hooks";
import { categoriesRepository } from "@/lib/repositories/categories-repository";
import { tasksRepository } from "@/lib/repositories/tasks-repository";
import { PRIORITY_ORDER, countByPriority, groupTasks } from "@/lib/task-grouping";
import { PRIORITY_FILTERS } from "@/lib/priority";
import type { Priority, Task } from "@/lib/types";
import type { Category } from "@/types/category";

const TODAY = getToday();

interface SnackbarState {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function TareasScreen() {
  const router = useRouter();
  const isExpanded = useIsExpanded();

  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortByPriority, setSortByPriority] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formTarget, setFormTarget] = useState<"closed" | "create" | Task>("closed");
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setError(false);
    setTasks(null);
    try {
      const data = await tasksRepository.listTasks();
      setTasks(data);
      setSelectedId((current) => current ?? groupTasks(data, TODAY).find((g) => g.key !== "done")?.tasks[0]?.id ?? null);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    // Patrón estándar de carga de datos (sincroniza con la API real), no estado derivado.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    categoriesRepository.listCategories().then(setCategories);
  }, [load]);

  const searchFiltered = useMemo(() => {
    if (!tasks) return [];
    const term = search.trim().toLowerCase();
    return term ? tasks.filter((t) => t.title.toLowerCase().includes(term)) : tasks;
  }, [tasks, search]);

  const priorityCounts = useMemo(() => countByPriority(searchFiltered), [searchFiltered]);
  const totalPending = priorityCounts.high + priorityCounts.medium + priorityCounts.low;

  const visibleTasks = useMemo(
    () => (priorityFilter === "all" ? searchFiltered : searchFiltered.filter((t) => t.priority === priorityFilter)),
    [searchFiltered, priorityFilter],
  );

  const groups = useMemo(() => {
    const base = groupTasks(visibleTasks, TODAY);
    if (!sortByPriority) return base;
    return base.map((group) => ({
      ...group,
      tasks: [...group.tasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
    }));
  }, [visibleTasks, sortByPriority]);

  const flatOrder = useMemo(() => groups.flatMap((g) => g.tasks), [groups]);
  const selectedTask = tasks?.find((t) => t.id === selectedId) ?? null;

  const handleOpen = useCallback(
    (task: Task) => {
      if (isExpanded) setSelectedId(task.id);
      else router.push(`/tareas/${task.id}`);
    },
    [isExpanded, router],
  );

  const handleToggle = useCallback(async (id: string, done: boolean) => {
    setTasks((prev) => (prev ? prev.map((t) => (t.id === id ? { ...t, done } : t)) : prev));
    await tasksRepository.setTaskDone(id, done);
    setSnackbar(
      done
        ? { message: "Tarea completada", actionLabel: "Deshacer", onAction: () => handleToggle(id, false) }
        : null,
    );
  }, []);

  const handlePostpone = useCallback(
    async (id: string) => {
      const previousDueDate = tasks?.find((t) => t.id === id)?.dueDate;
      const updated = await tasksRepository.postpone(id, 1);
      setTasks((prev) => (prev ? prev.map((t) => (t.id === id ? updated : t)) : prev));
      setSnackbar({
        message: "Tarea pospuesta a mañana",
        actionLabel: "Deshacer",
        onAction: async () => {
          const reverted = await tasksRepository.setDueDate(id, previousDueDate);
          setTasks((prev) => (prev ? prev.map((t) => (t.id === id ? reverted : t)) : prev));
        },
      });
    },
    [tasks],
  );

  const handleSubmitTaskForm = useCallback(
    async (input: { title: string; dueDate?: string; priority: Priority; category?: string; amount?: number }) => {
      if (formTarget !== "closed" && formTarget !== "create") {
        const updated = await tasksRepository.updateTask(formTarget.id, input);
        setTasks((prev) => (prev ? prev.map((t) => (t.id === updated.id ? updated : t)) : prev));
        setSelectedId(updated.id);
      } else {
        const created = await tasksRepository.createTask(input);
        setTasks((prev) => (prev ? [...prev, created] : [created]));
        setSelectedId(created.id);
      }
      setFormTarget("closed");
    },
    [formTarget],
  );

  const handleDelete = useCallback(async (id: string) => {
    setTasks((prev) => (prev ? prev.filter((t) => t.id !== id) : prev));
    await tasksRepository.deleteTask(id);
    setSnackbar({
      message: "Tarea eliminada",
      actionLabel: "Deshacer",
      onAction: async () => {
        const restored = await tasksRepository.restoreTask(id);
        setTasks((prev) => (prev ? [...prev, restored] : [restored]));
      },
    });
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (formTarget !== "closed") return;
      const target = event.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
      if (isTyping) return;
      if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        setFormTarget("create");
      } else if (event.key === "/") {
        event.preventDefault();
        setSearchOpen(true);
        requestAnimationFrame(() => searchInputRef.current?.focus());
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        if (!isExpanded || flatOrder.length === 0) return;
        event.preventDefault();
        const index = flatOrder.findIndex((t) => t.id === selectedId);
        const nextIndex =
          event.key === "ArrowDown" ? Math.min(flatOrder.length - 1, index + 1) : Math.max(0, index === -1 ? 0 : index - 1);
        setSelectedId(flatOrder[nextIndex].id);
      } else if (event.key === " " && selectedTask) {
        event.preventDefault();
        handleToggle(selectedTask.id, !selectedTask.done);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [formTarget, isExpanded, flatOrder, selectedId, selectedTask, handleToggle]);

  const pendingExists = tasks === null || tasks.some((t) => !t.done);

  return (
    <>
      <AppBar overline={`Tareas · ${totalPending} pendientes`} title={formatHeadlineDate(TODAY)}>
        <IconButton icon="search" ariaLabel="Buscar tareas" onClick={() => setSearchOpen((v) => !v)} />
        <IconButton icon="sort" ariaLabel="Ordenar por prioridad" aria-pressed={sortByPriority} onClick={() => setSortByPriority((v) => !v)} />
        <Button variant="filled" icon="add" className="gp-desk-only" onClick={() => setFormTarget("create")} style={{ marginLeft: 8 }}>
          Nueva tarea
        </Button>
      </AppBar>

      <div className="gp-cols">
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          {searchOpen && (
            <input
              ref={searchInputRef}
              className="gp-field__control"
              placeholder="Buscar tareas"
              aria-label="Buscar tareas"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          )}

          <ChipGroup label="Filtrar por prioridad">
            <FilterChip label="Todas" count={totalPending} selected={priorityFilter === "all"} onClick={() => setPriorityFilter("all")} />
            {PRIORITY_FILTERS.map((filter) => (
              <FilterChip
                key={filter.value}
                label={filter.label}
                count={priorityCounts[filter.value]}
                selected={priorityFilter === filter.value}
                onClick={() => setPriorityFilter(filter.value)}
              />
            ))}
          </ChipGroup>

          {error && <ErrorState onRetry={load} />}

          {!error && tasks === null && <Skeleton count={5} />}

          {!error && tasks !== null && groups.length === 0 && (
            <EmptyState icon="task_alt" text="No tienes tareas pendientes. Añade una." actionLabel="Nueva tarea" onAction={() => setFormTarget("create")} />
          )}

          {!error &&
            tasks !== null &&
            groups.map((group) =>
              group.key === "done" ? (
                <details key={group.key} className="gp-group-done">
                  <summary>
                    <div className="gp-group-label">
                      <span>{group.label}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {group.tasks.length}
                        <Icon name="expand_more" />
                      </span>
                    </div>
                  </summary>
                  <GroupedList aria-label={group.label}>
                    {group.tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        today={TODAY}
                        selected={isExpanded && task.id === selectedId}
                        onToggle={(done) => handleToggle(task.id, done)}
                        onOpen={() => handleOpen(task)}
                        onPostpone={() => handlePostpone(task.id)}
                        onDelete={() => handleDelete(task.id)}
                      />
                    ))}
                  </GroupedList>
                </details>
              ) : (
                <div key={group.key} style={{ display: "grid", gap: "var(--space-2)" }}>
                  <div className={`gp-group-label${group.key === "overdue" ? " gp-group-label--overdue" : ""}`}>
                    <span>{group.label}</span>
                    <span>{group.tasks.length}</span>
                  </div>
                  <GroupedList aria-label={group.label}>
                    {group.tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        today={TODAY}
                        selected={isExpanded && task.id === selectedId}
                        onToggle={(done) => handleToggle(task.id, done)}
                        onOpen={() => handleOpen(task)}
                        onPostpone={() => handlePostpone(task.id)}
                        onDelete={() => handleDelete(task.id)}
                      />
                    ))}
                  </GroupedList>
                </div>
              ),
            )}
        </div>

        <aside className="gp-card gp-desk-only" aria-label="Detalle de la tarea">
          <div className="gp-detail">
            {selectedTask ? (
              <TaskDetailContent
                task={selectedTask}
                today={TODAY}
                onToggleDone={() => handleToggle(selectedTask.id, !selectedTask.done)}
                onEdit={() => setFormTarget(selectedTask)}
              />
            ) : (
              <p className="gp-item__meta">Selecciona una tarea para ver el detalle.</p>
            )}
          </div>
        </aside>
      </div>

      {pendingExists && <Fab icon="add" label="Tarea" className="gp-screen__fab" onClick={() => setFormTarget("create")} />}

      {formTarget !== "closed" && (
        <TaskFormSheet
          categories={categories}
          initial={formTarget === "create" ? undefined : taskToFormInitial(formTarget)}
          onClose={() => setFormTarget("closed")}
          onSubmit={handleSubmitTaskForm}
        />
      )}

      {snackbar && (
        <Snackbar message={snackbar.message} actionLabel={snackbar.actionLabel} onAction={snackbar.onAction} onClose={() => setSnackbar(null)} />
      )}
    </>
  );
}
