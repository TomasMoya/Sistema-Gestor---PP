import { Coins } from "./coins/coin";

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
export function formatCurrency(cents: number, currency: Coins = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    useGrouping: "always",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)} %`;
}

interface CachedRate {
  rate: number;
  date: string; // yyyy-mm-dd; el plan free de ExchangeRate-API solo actualiza la tasa una vez por día
}

/** Caché en memoria del proceso/pestaña; sobrevive mientras no haya un reload completo. */
const rateMemoryCache = new Map<string, CachedRate>();
/** Llamadas en vuelo por par de monedas, para no disparar dos fetch si llegan pedidos simultáneos. */
const rateRequestsInFlight = new Map<string, Promise<number>>();

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function rateCacheKey(moneda1: Coins, moneda2: Coins): string {
  return `exchangeRate:${moneda1}_${moneda2}`;
}

function readCachedRate(key: string): number | null {
  const today = todayISO();

  const inMemory = rateMemoryCache.get(key);
  if (inMemory && inMemory.date === today) return inMemory.rate;

  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed: CachedRate = JSON.parse(raw);
    if (parsed.date !== today) return null;
    rateMemoryCache.set(key, parsed);
    return parsed.rate;
  } catch {
    return null;
  }
}

function writeCachedRate(key: string, rate: number): void {
  const entry: CachedRate = { rate, date: todayISO() };
  rateMemoryCache.set(key, entry);
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage no disponible (modo privado, cuota llena, etc.) - seguimos solo con la caché en memoria.
  }
}

/**
 * Tasa de conversión moneda1 -> moneda2, vía `/api/exchange-rate` (que a su vez llama a
 * ExchangeRate-API con EXCHANGE_RATE_API_KEY del lado del servidor: `convertTo` corre en el
 * navegador, y esa env var sin prefijo `NEXT_PUBLIC_` no debe llegar ahí).
 * Cachea el resultado por par de monedas y por día (localStorage + memoria) para no gastar cuota
 * de la API pidiendo de nuevo una tasa que el plan free solo actualiza una vez por día, y
 * deduplica pedidos simultáneos del mismo par.
 */
export async function convertTo(moneda1: Coins, moneda2: Coins): Promise<number> {
  if (moneda1 === moneda2) return 1;

  const key = rateCacheKey(moneda1, moneda2);

  const cached = readCachedRate(key);
  if (cached !== null) return cached;

  const inFlight = rateRequestsInFlight.get(key);
  if (inFlight) return inFlight;

  const request = (async () => {
    const response = await fetch(`/api/exchange-rate?from=${moneda1}&to=${moneda2}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? `/api/exchange-rate respondió con estado ${response.status}`);
    }

    writeCachedRate(key, data.conversion_rate);
    return data.conversion_rate;
  })();

  rateRequestsInFlight.set(key, request);
  try {
    return await request;
  } finally {
    rateRequestsInFlight.delete(key);
  }
}

/**
 * Suma importes (céntimos) de distintas monedas convertidos a `target`. Agrupa primero por
 * moneda y recién ahí convierte, así que hace una sola llamada a `convertTo` por cada moneda
 * distinta presente (no una por movimiento).
 */
export async function convertTotal(entries: { amount: number; currency: Coins }[], target: Coins): Promise<number> {
  const subtotalsByCurrency = new Map<Coins, number>();
  for (const { amount, currency } of entries) {
    subtotalsByCurrency.set(currency, (subtotalsByCurrency.get(currency) ?? 0) + amount);
  }

  const convertedSubtotals = await Promise.all(
    [...subtotalsByCurrency.entries()].map(async ([currency, subtotal]) => {
      if (currency === target) return subtotal;
      const rate = await convertTo(currency, target);
      return subtotal * rate;
    }),
  );

  return Math.round(convertedSubtotals.reduce((total, subtotal) => total + subtotal, 0));
}
