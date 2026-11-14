const WEEKDAYS_LONG = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const WEEKDAYS_SHORT = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MONTHS_LONG = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Parsea una fecha "yyyy-mm-dd" como fecha local (evita el corrimiento de `new Date(iso)`, que la lee en UTC). */
export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** "Hoy" real, a medianoche local (para agrupar/comparar fechas). */
export function getToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Desplaza una fecha "yyyy-mm-dd" el número de días indicado (puede ser negativo). */
export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Diferencia en días naturales entre dos fechas, ignorando la hora. */
export function diffInCalendarDays(a: Date, b: Date): number {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcA - utcB) / 86_400_000);
}

/** "Martes, 27 oct" — cabecera de la pantalla Tareas. */
export function formatHeadlineDate(date: Date): string {
  return `${capitalize(WEEKDAYS_LONG[date.getDay()])}, ${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

/** "Jueves, 29 de octubre" — panel de detalle. */
export function formatLongDate(iso: string): string {
  const d = parseISODate(iso);
  return `${capitalize(WEEKDAYS_LONG[d.getDay()])}, ${d.getDate()} de ${MONTHS_LONG[d.getMonth()]}`;
}

/** "Jue 29 oct" — metadatos de fila. */
export function formatShortDate(iso: string): string {
  const d = parseISODate(iso);
  return `${capitalize(WEEKDAYS_SHORT[d.getDay()])} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** "29 oct" — fecha corta sin día de la semana (chip de fecha próxima en Finanzas). */
export function formatDayMonth(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** "Octubre 2026" — cabecera de la pantalla Finanzas. */
export function formatMonthYear(date: Date): string {
  return `${capitalize(MONTHS_LONG[date.getMonth()])} ${date.getFullYear()}`;
}

/** "octubre" — para frases como "Ingresos menos gastos de octubre". */
export function formatMonthName(date: Date): string {
  return MONTHS_LONG[date.getMonth()];
}

/** "2026-10" -> primer día de ese mes, como fecha local. */
export function monthKeyToDate(month: string): Date {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1);
}

export function dateToMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftMonth(month: string, delta: number): string {
  const date = monthKeyToDate(month);
  date.setMonth(date.getMonth() + delta);
  return dateToMonthKey(date);
}

/** "Hoy" / "Mañana" / "En 2 días", o null si la fecha ya pasó o está a más de 3 días. */
export function formatRelativeSoon(iso: string, today: Date): string | null {
  const diff = diffInCalendarDays(parseISODate(iso), today);
  if (diff < 0 || diff > 3) return null;
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  return `En ${diff} días`;
}

/** Importes en céntimos, formato es-ES ("1.160 €"). */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    useGrouping: "always",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)} %`;
}
