import { describe, expect, it } from "vitest";
import {
  diffInCalendarDays,
  formatCurrency,
  formatDayMonth,
  formatHeadlineDate,
  formatLongDate,
  formatMonthYear,
  formatRelativeSoon,
  formatShortDate,
  parseISODate,
  shiftMonth,
} from "./format";

const TODAY = parseISODate("2026-10-27");

// Intl.NumberFormat separa el importe del símbolo con un espacio fino/irrompible (U+202F o
// U+00A0 según el motor ICU), no con un espacio normal — de ahí la normalización en el matcher.
function normalizeSpaces(value: string): string {
  return value.replace(/[  ]/g, " ");
}

describe("formatCurrency", () => {
  it("usa el formato es-ES con punto de miles y sin decimales para importes redondos", () => {
    expect(normalizeSpaces(formatCurrency(116000))).toBe("1.160 €");
    expect(normalizeSpaces(formatCurrency(85000))).toBe("850 €");
  });

  it("conserva los céntimos cuando el importe no es un euro redondo", () => {
    expect(normalizeSpaces(formatCurrency(4550))).toBe("45,5 €");
  });
});

describe("fechas", () => {
  it("formatHeadlineDate da el título de la pantalla Tareas", () => {
    expect(formatHeadlineDate(TODAY)).toBe("Martes, 27 oct");
  });

  it("formatLongDate da la fecha larga del panel de detalle", () => {
    expect(formatLongDate("2026-10-29")).toBe("Jueves, 29 de octubre");
  });

  it("formatShortDate da la fecha corta de los metadatos de fila", () => {
    expect(formatShortDate("2026-10-30")).toBe("Vie 30 oct");
  });

  it("formatDayMonth da la fecha sin día de la semana", () => {
    expect(formatDayMonth("2026-10-29")).toBe("29 oct");
  });

  it("formatMonthYear da la cabecera de Finanzas", () => {
    expect(formatMonthYear(parseISODate("2026-10-01"))).toBe("Octubre 2026");
  });

  it("diffInCalendarDays ignora la hora y cuenta días naturales", () => {
    expect(diffInCalendarDays(parseISODate("2026-10-29"), TODAY)).toBe(2);
    expect(diffInCalendarDays(parseISODate("2026-10-25"), TODAY)).toBe(-2);
    expect(diffInCalendarDays(TODAY, TODAY)).toBe(0);
  });

  it("shiftMonth avanza y retrocede meses conservando el formato yyyy-mm", () => {
    expect(shiftMonth("2026-10", 1)).toBe("2026-11");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
  });
});

describe("formatRelativeSoon", () => {
  it("da Hoy, Mañana o En N días dentro de la ventana de 3 días", () => {
    expect(formatRelativeSoon("2026-10-27", TODAY)).toBe("Hoy");
    expect(formatRelativeSoon("2026-10-28", TODAY)).toBe("Mañana");
    expect(formatRelativeSoon("2026-10-29", TODAY)).toBe("En 2 días");
    expect(formatRelativeSoon("2026-10-30", TODAY)).toBe("En 3 días");
  });

  it("da null fuera de la ventana de 3 días o si ya venció", () => {
    expect(formatRelativeSoon("2026-10-31", TODAY)).toBeNull();
    expect(formatRelativeSoon("2026-10-26", TODAY)).toBeNull();
  });
});
