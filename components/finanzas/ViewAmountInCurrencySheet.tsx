"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { COIN_OPTIONS, type Coins } from "@/lib/coins/coin";
import { convertTotal, formatCurrency } from "@/lib/format";

interface ViewAmountInCurrencySheetProps {
  /** Céntimos, ya expresados en `baseCurrency`. */
  amount: number;
  baseCurrency: Coins;
  onClose: () => void;
}

/** Convierte un único importe (p. ej. "Disponible este mes") a la moneda que elija el usuario, sin tocar el dato original. */
export function ViewAmountInCurrencySheet({ amount, baseCurrency, onClose }: ViewAmountInCurrencySheetProps) {
  const [target, setTarget] = useState<Coins>(baseCurrency === "USD" ? "EUR" : "USD");
  const [converted, setConverted] = useState<{ amount: number; currency: Coins } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await convertTotal([{ amount, currency: baseCurrency }], target);
      setConverted({ amount: result, currency: target });
    } catch {
      setError("No se pudo convertir. Revisá que EXCHANGE_RATE_API_KEY esté configurada.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet
      title="Ver en otra moneda"
      onClose={onClose}
      footer={
        <>
          <Button variant="text" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="filled" icon="currency_exchange" type="submit" form="view-amount-currency-form" disabled={loading}>
            {loading ? "Convirtiendo…" : "Convertir"}
          </Button>
        </>
      }
    >
      <form id="view-amount-currency-form" onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--space-4)" }}>
        <p style={{ margin: 0 }}>
          <span className="gp-num">{formatCurrency(amount, baseCurrency)}</span>
        </p>
        <Field label="Convertir a" htmlFor="view-amount-currency">
          <select
            id="view-amount-currency"
            className="gp-field__control"
            value={target}
            onChange={(event) => {
              setTarget(event.target.value as Coins);
              setConverted(null);
            }}
          >
            {COIN_OPTIONS.filter((option) => option !== baseCurrency).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        {error && (
          <p role="alert" style={{ color: "var(--danger)", margin: 0 }}>
            {error}
          </p>
        )}
        {converted && !error && (
          <p style={{ margin: 0 }}>
            ≈ <span className="gp-num">{formatCurrency(converted.amount, converted.currency)}</span>
          </p>
        )}
      </form>
    </Sheet>
  );
}
