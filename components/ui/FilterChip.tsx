import type { ReactNode } from "react";
import { Icon } from "./Icon";

interface FilterChipProps {
  label: string;
  count?: number;
  selected: boolean;
  onClick: () => void;
}

/** Chip de filtro de selección única. Seleccionado: fondo `primary-soft` + icono `check`. */
export function FilterChip({ label, count, selected, onClick }: FilterChipProps) {
  return (
    <button type="button" className="gp-chip" aria-pressed={selected} onClick={onClick}>
      {selected && <Icon name="check" />}
      {label} {count != null && <span className="gp-chip__count">{count}</span>}
    </button>
  );
}

export function ChipGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="gp-chips" role="group" aria-label={label}>
      {children}
    </div>
  );
}
