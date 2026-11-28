"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Fab } from "@/components/ui/Fab";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SegmentedButton } from "@/components/ui/SegmentedButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { groupTasksByDate } from "@/lib/calendario/calendar-items";
import { formatMonthYear, getToday, parseISODate, toISODate } from "@/lib/format";
import { tasksRepository } from "@/lib/repositories/tasks-repository";
import type { Task } from "@/lib/types";
import { CalendarMonth } from "./CalendarMonth";
import { DayAgenda } from "./DayAgenda";
import { UpcomingDaysList } from "./UpcomingDaysList";

const TODAY = getToday();
const VIEW_OPTIONS = [
  { value: "mes", label: "Mes" },
  { value: "semana", label: "Semana" },
  { value: "agenda", label: "Agenda" },
];

type CalendarView = "mes" | "semana" | "agenda";

export function CalendarioScreen() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => toISODate(TODAY));
  const [view, setView] = useState<CalendarView>("mes");

  const load = useCallback(async () => {
    setError(false);
    setTasks(null);
    try {
      const data = await tasksRepository.listTasks();
      setTasks(data);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const itemsByDate = useMemo(() => groupTasksByDate(tasks ?? []), [tasks]);
  const selectedDayItems = itemsByDate.get(selectedDate) ?? [];

  const upcomingItems = useMemo(() => {
    if (!tasks) return [];
    return tasks
      .filter((task) => task.dueDate && task.dueDate > selectedDate)
      .sort((a, b) => (a.dueDate as string).localeCompare(b.dueDate as string))
      .slice(0, 4);
  }, [tasks, selectedDate]);

  function handleSelectDate(iso: string) {
    setSelectedDate(iso);
    const date = parseISODate(iso);
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  function goToday() {
    setVisibleMonth(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
    setSelectedDate(toISODate(TODAY));
  }

  function shiftVisibleMonth(delta: number) {
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + delta, 1));
  }

  const handleToggleTask = useCallback(async (id: string, done: boolean) => {
    setTasks((prev) => (prev ? prev.map((task) => (task.id === id ? { ...task, done } : task)) : prev));
    await tasksRepository.setTaskDone(id, done);
  }, []);

  return (
    <>
      <AppBar overline="Calendario" title={formatMonthYear(visibleMonth)}>
        <Button variant="text" onClick={goToday}>
          Hoy
        </Button>
        <IconButton icon="chevron_left" ariaLabel="Mes anterior" onClick={() => shiftVisibleMonth(-1)} />
        <IconButton icon="chevron_right" ariaLabel="Mes siguiente" onClick={() => shiftVisibleMonth(1)} />
        <Button variant="filled" icon="add" className="gp-desk-only" style={{ marginLeft: 8 }}>
          Nuevo evento
        </Button>
      </AppBar>

      {error && <ErrorState onRetry={load} />}

      {!error && tasks === null && <Skeleton variant="card" count={1} />}

      {!error && tasks !== null && (
        <div className="gp-cols gp-cols--wide">
          <div style={{ display: "grid", gap: "var(--space-3)", alignContent: "start" }}>
            <div className="gp-toolbar">
              <SegmentedButton
                ariaLabel="Vista"
                value={view}
                onChange={(value) => setView(value as CalendarView)}
                options={VIEW_OPTIONS}
              />
            </div>

            {view === "mes" ? (
              <CalendarMonth
                monthDate={visibleMonth}
                selectedDate={selectedDate}
                today={TODAY}
                itemsByDate={itemsByDate}
                onSelectDate={handleSelectDate}
              />
            ) : (
              <div className="gp-empty">
                <span className="gp-empty__icon">
                  <Icon name="calendar_month" size="lg" />
                </span>
                <p className="gp-empty__text">Próximamente.</p>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gap: "var(--space-6)", alignContent: "start" }}>
            <DayAgenda selectedDate={selectedDate} items={selectedDayItems} today={TODAY} onToggleTask={handleToggleTask} />

            <section className="gp-section gp-next" aria-label="Próximos días">
              <SectionHeader title="Próximos días" actionLabel="Ver agenda" onAction={() => setView("agenda")} />
              {upcomingItems.length === 0 ? (
                <EmptyState icon="event_available" text="No hay más elementos próximos." />
              ) : (
                <UpcomingDaysList items={upcomingItems} today={TODAY} onSelectDate={handleSelectDate} />
              )}
            </section>
          </div>
        </div>
      )}

      <Fab icon="add" label="Evento" className="gp-screen__fab" />
    </>
  );
}
