/** Lunes = 0 ... domingo = 6 (a diferencia de `Date#getDay()`, que empieza en domingo). */
function mondayFirstWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/**
 * Cuadrícula de un mes, de lunes a domingo, siempre en semanas completas (incluye los días de
 * los meses anterior y siguiente que completan la primera y la última semana).
 */
export function getMonthGridDays(monthDate: Date): Date[] {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

  const start = new Date(firstOfMonth);
  start.setDate(start.getDate() - mondayFirstWeekday(firstOfMonth));

  const end = new Date(lastOfMonth);
  end.setDate(end.getDate() + (6 - mondayFirstWeekday(lastOfMonth)));

  const days: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}
