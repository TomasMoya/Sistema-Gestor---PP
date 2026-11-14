"use client";

import { Icon } from "@/components/ui/Icon";
import { RowMenu } from "@/components/ui/RowMenu";
import { formatCurrency, formatShortDate } from "@/lib/format";
import type { Movement } from "@/lib/types";

interface MovementRowProps {
  movement: Movement;
  onEdit: () => void;
  onDelete: () => void;
}

/** Fila de un gasto individual (vista "Ver detalle"), con menú ⋮ para editar/eliminar. */
export function MovementRow({ movement, onEdit, onDelete }: MovementRowProps) {
  return (
    <li className="gp-item">
      <span className="gp-item__lead">
        <Icon name={movement.category?.icon ?? "receipt_long"} />
      </span>
      <div className="gp-item__body">
        <div className="gp-item__title">{movement.note || movement.category?.name || "Gasto"}</div>
        <div className="gp-item__meta">
          <Icon name="event" />
          {formatShortDate(movement.date)}
          {movement.note && movement.category && (
            <>
              <span aria-hidden="true">·</span>
              <span>{movement.category.name}</span>
            </>
          )}
        </div>
      </div>
      <div className="gp-item__trail" onClick={(event) => event.stopPropagation()}>
        <span className="gp-num">{formatCurrency(movement.amount)}</span>
        <RowMenu
          ariaLabel={`Más opciones: ${movement.note || movement.category?.name || "gasto"} del ${formatShortDate(movement.date)}`}
          items={[
            { label: "Editar", icon: "edit", onSelect: onEdit },
            { label: "Eliminar", icon: "delete", onSelect: onDelete },
          ]}
        />
      </div>
    </li>
  );
}
