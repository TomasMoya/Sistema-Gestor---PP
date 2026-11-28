"use client";

import { useMemo, useRef } from "react";
import { cn } from "@/lib/cn";
import { getMonthGridDays } from "@/lib/calendario/calendar-grid";
import { itemType } from "@/lib/calendario/calendar-items";
import { formatMonthYear, toISODate } from "@/lib/format";
import type { Task } from "@/lib/types";

const WEEKDAY_HEADERS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const WEEKDAY_NAMES = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const ARROW_DELTA: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 };

interface CalendarMonthProps {
  monthDate: Date;
  selectedDate: string;
  today: Date;
  itemsByDate: Map<string, Task[]>;
  onSelectDate: (iso: string) => void;
}

/** Cuadrícula mensual (lunes a domingo, siempre semanas completas): puntos por tipo en móvil, títulos en escritorio. */
export function CalendarMonth({ monthDate, selectedDate, today, itemsByDate, onSelectDate }: CalendarMonthProps) {
  const days = useMemo(() => getMonthGridDays(monthDate), [monthDate]);
  const todayIso = toISODate(today);
  const gridRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    const delta = ARROW_DELTA[event.key];
    if (delta == null) return;
    event.preventDefault();
    const nextIndex = Math.max(0, Math.min(days.length - 1, index + delta));
    const nextIso = toISODate(days[nextIndex]);
    onSelectDate(nextIso);
    requestAnimationFrame(() => {
      gridRef.current?.querySelectorAll<HTMLButtonElement>("button.gp-cal__day")[nextIndex]?.focus();
    });
  }

  return (
    <section className="gp-card gp-cal" aria-label={formatMonthYear(monthDate)}>
      <div className="gp-cal__wk" aria-hidden="true">
        {WEEKDAY_HEADERS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="gp-cal__grid" role="grid" ref={gridRef}>
        {days.map((day, index) => {
          const iso = toISODate(day);
          const isOut = day.getMonth() !== monthDate.getMonth();
          const isToday = iso === todayIso;
          const isSelected = iso === selectedDate;
          const items = itemsByDate.get(iso) ?? [];
          const dotItems = items.slice(0, 3);
          const chipItems = items.slice(0, 2);
          const moreCount = items.length - chipItems.length;
          const label = `${WEEKDAY_NAMES[index % 7]} ${day.getDate()}${
            items.length ? `, ${items.length} ${items.length > 1 ? "elementos" : "elemento"}` : ""
          }`;

          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              className={cn("gp-cal__day", isOut && "is-out", isToday && "is-today", isSelected && "is-selected")}
              aria-label={label}
              aria-selected={isSelected}
              aria-current={isToday ? "date" : undefined}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelectDate(iso)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className="gp-cal__num">{day.getDate()}</span>
              <span className="gp-cal__dots" aria-hidden="true">
                {dotItems.map((item) => (
                  <span key={item.id} className={cn("gp-cal__dot", `gp-type--${itemType(item)}`)} />
                ))}
              </span>
              <span className="gp-cal__chips" aria-hidden="true">
                {chipItems.map((item) => (
                  <span key={item.id} className={cn("gp-cal__chip", `gp-type--${itemType(item)}`)}>
                    <span>{item.title}</span>
                  </span>
                ))}
                {moreCount > 0 && <span className="gp-cal__chip is-more">+{moreCount} más</span>}
              </span>
            </button>
          );
        })}
      </div>
      <div className="gp-cal__legend" aria-hidden="true">
        <span className="gp-type--task">
          <span className="gp-cal__dot" />
          Tarea
        </span>
        <span className="gp-type--payment">
          <span className="gp-cal__dot" />
          Pago
        </span>
        <span className="gp-type--event">
          <span className="gp-cal__dot" />
          Evento
        </span>
      </div>
    </section>
  );
}
