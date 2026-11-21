"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { COIN_OPTIONS, type Coins } from "@/lib/coins/coin";

interface BaseCurrencySheetProps {
  currency: Coins;
  onClose: () => void;
  onSubmit: (currency: Coins) => void;
}

/**
 * Elegir la moneda base de Finanzas. Todavía no persiste nada (ni localStorage ni backend):
 * no hay cuentas de usuario donde guardar esta preferencia, así que por ahora solo vive en el
 * estado de la pantalla y se resetea al recargar.
 */
export function BaseCurrencySheet({ currency, onClose, onSubmit }: BaseCurrencySheetProps) {
  const [selected, setSelected] = useState<Coins>(currency);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(selected);
  }

  return (
    <Sheet
      title="Moneda base"
      onClose={onClose}
      footer={
        <>
          <Button variant="text" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="filled" icon="check" type="submit" form="base-currency-form">
            Guardar
          </Button>
        </>
      }
    >
      <form id="base-currency-form" onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--space-4)" }}>
        <Field label="Moneda" htmlFor="base-currency">
          <select
            id="base-currency"
            className="gp-field__control"
            value={selected}
            onChange={(event) => setSelected(event.target.value as Coins)}
          >
            {COIN_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <p style={{ color: "var(--ink-muted)", fontSize: 13, margin: 0 }}>
          Por ahora esto solo cambia esta pantalla mientras la tengas abierta: todavía no hay cuentas de usuario
          donde guardarla de forma permanente.
        </p>
      </form>
    </Sheet>
  );
}
