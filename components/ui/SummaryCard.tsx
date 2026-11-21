import type { ReactNode } from "react";
import { budgetTone } from "@/lib/budget";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Icon } from "./Icon";
import { ProgressBar } from "./ProgressBar";

interface SummaryCardProps {
  available: number;
  income: number;
  expenses: number;
  budget: number;
  monthLabel: string;
  /** Acción opcional junto a la etiqueta "Disponible este mes" (p. ej. un botón para verlo en otra moneda). */
  heroAction?: ReactNode;
}

const TONE_TEXT_COLOR: Record<ReturnType<typeof budgetTone>, string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
};

/** Cifra protagonista (Fraunces 36/40), ingresos/gastos y el avance del presupuesto, con la barra de tono automático. */
export function SummaryCard({ available, income, expenses, budget, monthLabel, heroAction }: SummaryCardProps) {
  const ratio = budget > 0 ? expenses / budget : 0;
  const tone = budgetTone(ratio);
  const remaining = budget - expenses;

  return (
    <section className="gp-card gp-summary" aria-label="Resumen del mes">
      <div className="gp-summary__hero">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-2)" }}>
          <span className="gp-summary__label">Disponible este mes</span>
          {heroAction}
        </div>
        <span className="gp-summary__value gp-num">{formatCurrency(available)}</span>
        <span className="gp-section__meta">Ingresos menos gastos de {monthLabel}</span>
      </div>
      <div className="gp-summary__row">
        <div className="gp-stat">
          <Icon name="south_west" style={{ color: "var(--success)" }} />
          <div>
            <div className="gp-stat__k">Ingresos</div>
            <div className="gp-stat__v gp-num">{formatCurrency(income)}</div>
          </div>
        </div>
        <div className="gp-stat">
          <Icon name="north_east" style={{ color: "var(--ink-muted)" }} />
          <div>
            <div className="gp-stat__k">Gastos</div>
            <div className="gp-stat__v gp-num">{formatCurrency(expenses)}</div>
          </div>
        </div>
      </div>
      {budget > 0 && (
        <div className="gp-budget">
          <div className="gp-budget__top">
            <b>Presupuesto de gastos</b>
            <span className="gp-num">
              {formatCurrency(expenses)} / {formatCurrency(budget)}
            </span>
          </div>
          <ProgressBar value={ratio} tone={tone} label="Presupuesto usado" />
          <div className="gp-item__meta" style={{ color: TONE_TEXT_COLOR[tone] }}>
            <Icon name={tone === "success" ? "check_circle" : "warning"} />
            <span>
              {formatPercent(Math.min(ratio, 1))} usado
              {remaining >= 0 ? (
                <>
                  {" "}
                  · te quedan <b className="gp-num">{formatCurrency(remaining)}</b>
                </>
              ) : (
                <>
                  {" "}
                  · superado por <b className="gp-num">{formatCurrency(-remaining)}</b>
                </>
              )}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
