"use client";

import { useCallback, useEffect, useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { CategoryRow } from "@/components/ui/CategoryRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Fab } from "@/components/ui/Fab";
import { GroupedList } from "@/components/ui/GroupedList";
import { IconButton } from "@/components/ui/IconButton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Snackbar } from "@/components/ui/Snackbar";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { BaseCurrencySheet } from "./BaseCurrencySheet";
import { MovementFormSheet, type MovementFormInput } from "./MovementFormSheet";
import { UpcomingPaymentRow } from "./UpcomingPaymentRow";
import { ViewAmountInCurrencySheet } from "./ViewAmountInCurrencySheet";
import { dateToMonthKey, formatMonthName, formatMonthYear, getToday, monthKeyToDate, shiftMonth } from "@/lib/format";
import { categoriesRepository, type CreateCategoryInput } from "@/lib/repositories/categories-repository";
import { DISPLAY_CURRENCY, financeRepository } from "@/lib/repositories/finance-repository";
import { tasksRepository } from "@/lib/repositories/tasks-repository";
import type { Coins } from "@/lib/coins/coin";
import type { FinanceData } from "@/lib/types";
import type { Category } from "@/types/category";

const TODAY = getToday();
const INITIAL_MONTH = dateToMonthKey(TODAY);

/** Color fijo pedido para el botón de moneda base; no es un color del sistema de diseño. */
const BASE_CURRENCY_BUTTON_STYLE = { background: "#3B342B", color: "#ffffff" };

export function FinanzasScreen() {
  const [month, setMonth] = useState(INITIAL_MONTH);
  const [data, setData] = useState<FinanceData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [baseCurrencySheetOpen, setBaseCurrencySheetOpen] = useState(false);
  const [baseCurrency, setBaseCurrency] = useState<Coins>("EUR");
  const [viewAvailableInCurrency, setViewAvailableInCurrency] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const load = useCallback(async (targetMonth: string) => {
    setError(false);
    setData(null);
    try {
      const result = await financeRepository.getMonthData(targetMonth);
      setData(result);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    // `load` resetea a estado de carga antes del `await`: es el patrón estándar de
    // carga de datos, no estado derivado — sincroniza con la API real.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(month);
  }, [month, load]);

  useEffect(() => {
    categoriesRepository.listCategories().then(setCategories);
  }, []);

  async function handleTogglePaid(taskId: string, paid: boolean) {
    await tasksRepository.setTaskDone(taskId, paid);
    setData((prev) => (prev ? { ...prev, upcomingPayments: prev.upcomingPayments.map((p) => (p.id === taskId ? { ...p, paid } : p)) } : prev));
  }

  async function handleCreateMovement(input: MovementFormInput) {
    await financeRepository.createMovement(input);
    setSheetOpen(false);
    setSnackbar(input.type === "ingreso" ? "Ingreso añadido" : "Gasto añadido");
    load(month);
  }

  async function handleCreateCategory(input: CreateCategoryInput) {
    const created = await categoriesRepository.createCategory(input);
    setCategories((prev) => [...prev, created]);
    return created;
  }

  function handleBaseCurrencySubmit(currency: Coins) {
    setBaseCurrency(currency);
    setBaseCurrencySheetOpen(false);
    setSnackbar("Moneda base actualizada para esta pantalla");
  }

  const totalExpenses = data?.summary.expenses ?? 0;
  const sortedCategories = data ? [...data.categories].sort((a, b) => b.amount - a.amount) : [];

  return (
    <>
      <AppBar overline="Finanzas" title={formatMonthYear(monthKeyToDate(month))}>
        <IconButton icon="chevron_left" ariaLabel="Mes anterior" onClick={() => setMonth((m) => shiftMonth(m, -1))} />
        <IconButton icon="chevron_right" ariaLabel="Mes siguiente" onClick={() => setMonth((m) => shiftMonth(m, 1))} />
        <Button variant="filled" icon="add" className="gp-desk-only" onClick={() => setSheetOpen(true)} style={{ marginLeft: 8 }}>
          Añadir movimiento
        </Button>
        <Button
          variant="tonal"
          icon="currency_exchange"
          className="gp-desk-only"
          onClick={() => setBaseCurrencySheetOpen(true)}
          style={{ marginLeft: 8, ...BASE_CURRENCY_BUTTON_STYLE }}
          suppressHydrationWarning
        >
          Moneda base
        </Button>
      </AppBar>

      {error && <ErrorState onRetry={() => load(month)} />}

      {!error && data === null && (
        <div style={{ display: "grid", gap: "var(--space-6)" }}>
          <Skeleton variant="card" count={1} />
          <Skeleton count={3} />
        </div>
      )}

      {!error && data && (
        <div className="gp-cols">
          <div style={{ display: "grid", gap: "var(--space-6)" }}>
            <SummaryCard
              available={data.summary.income - data.summary.expenses}
              income={data.summary.income}
              expenses={data.summary.expenses}
              budget={data.summary.budget}
              monthLabel={formatMonthName(monthKeyToDate(month))}
              heroAction={
                <IconButton
                  icon="currency_exchange"
                  ariaLabel="Ver en otra moneda"
                  onClick={() => setViewAvailableInCurrency(true)}
                />
              }
            />

            <section className="gp-section">
              <SectionHeader title="Próximos pagos" actionLabel="Ver todos" />
              {data.upcomingPayments.length === 0 ? (
                <EmptyState icon="event_available" text="No hay tareas con pagos próximos este mes." />
              ) : (
                <GroupedList aria-label="Próximos pagos">
                  {data.upcomingPayments.map((payment) => (
                    <UpcomingPaymentRow
                      key={payment.id}
                      payment={payment}
                      today={TODAY}
                      onTogglePaid={() => handleTogglePaid(payment.id, !payment.paid)}
                    />
                  ))}
                </GroupedList>
              )}
            </section>
          </div>

          <section className="gp-section">
            <SectionHeader title="Gastos por categoría" actionLabel="Ver detalle" href={`/finanzas/detalle?month=${month}`} />
            {sortedCategories.length === 0 ? (
              <EmptyState icon="donut_large" text="Aún no hay movimientos este mes." actionLabel="Añadir movimiento" onAction={() => setSheetOpen(true)} />
            ) : (
              <GroupedList aria-label="Gastos por categoría">
                {sortedCategories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    name={category.name}
                    icon={category.icon}
                    colorVar={category.colorVar}
                    amount={category.amount}
                    share={totalExpenses > 0 ? category.amount / totalExpenses : 0}
                  />
                ))}
              </GroupedList>
            )}
          </section>
        </div>
      )}

      <div className="gp-screen__fab">
        <Fab
          icon="currency_exchange"
          ariaLabel="Configurar moneda base"
          onClick={() => setBaseCurrencySheetOpen(true)}
          style={BASE_CURRENCY_BUTTON_STYLE}
          suppressHydrationWarning
        />
        <Fab icon="add" ariaLabel="Movimiento" onClick={() => setSheetOpen(true)} />
      </div>

      {sheetOpen && (
        <MovementFormSheet
          categories={categories}
          onClose={() => setSheetOpen(false)}
          onSubmit={handleCreateMovement}
          onCreateCategory={handleCreateCategory}
          defaultDate={`${month}-01`}
        />
      )}

      {baseCurrencySheetOpen && (
        <BaseCurrencySheet
          currency={baseCurrency}
          onClose={() => setBaseCurrencySheetOpen(false)}
          onSubmit={handleBaseCurrencySubmit}
        />
      )}

      {viewAvailableInCurrency && data && (
        <ViewAmountInCurrencySheet
          amount={data.summary.income - data.summary.expenses}
          baseCurrency={DISPLAY_CURRENCY}
          onClose={() => setViewAvailableInCurrency(false)}
        />
      )}

      {snackbar && <Snackbar message={snackbar} onClose={() => setSnackbar(null)} />}
    </>
  );
}
