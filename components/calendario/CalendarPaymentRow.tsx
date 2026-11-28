import { formatCurrency } from "@/lib/format";
import type { Task } from "@/lib/types";

interface CalendarPaymentRowProps {
  task: Task;
}

/** Fila de pago en la agenda de Calendario: concepto, importe y etiqueta de tipo "Pago". */
export function CalendarPaymentRow({ task }: CalendarPaymentRowProps) {
  return (
    <li className="gp-item gp-type--payment">
      <div className="gp-item__body">
        <div className="gp-item__title">{task.title}</div>
        <div className="gp-item__meta">
          <span className="gp-num">{formatCurrency(task.amount ?? 0)}</span>
        </div>
      </div>
      <div className="gp-item__trail">
        <span className="gp-typetag">Pago</span>
      </div>
    </li>
  );
}
