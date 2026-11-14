"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Tag } from "@/components/ui/Tag";
import { diffInCalendarDays, formatCurrency, formatDayMonth, parseISODate } from "@/lib/format";
import type { UpcomingPayment } from "@/lib/types";

interface UpcomingPaymentRowProps {
  payment: UpcomingPayment;
  today: Date;
  onTogglePaid: () => void;
}

/** Fila de próximo pago: mosaico `accent-soft`, importe + vínculo a Tareas, y la fecha próxima (o "Pagado"). */
export function UpcomingPaymentRow({ payment, today, onTogglePaid }: UpcomingPaymentRowProps) {
  const router = useRouter();
  const diff = diffInCalendarDays(parseISODate(payment.dueDate), today);
  const openTask = payment.taskId ? () => router.push(`/tareas/${payment.taskId}`) : undefined;

  return (
    <li className={`gp-item${openTask ? " gp-item--link" : ""}`} onClick={openTask}>
      <span className="gp-item__lead" style={{ background: "var(--accent-soft)", color: "var(--on-accent-soft)" }}>
        <Icon name="shield" />
      </span>
      <div className="gp-item__body">
        <div className="gp-item__title">{payment.concept}</div>
        <div className="gp-item__meta">
          <span className="gp-num">{formatCurrency(payment.amount)}</span>
          {payment.taskId && (
            <>
              <span aria-hidden="true">·</span>
              <span>También en Tareas</span>
            </>
          )}
        </div>
      </div>
      <div className="gp-item__trail" onClick={(event) => event.stopPropagation()}>
        {payment.paid ? (
          <Tag variant="ok" icon="check_circle" label="Pagado" />
        ) : diff < 0 ? (
          <Tag variant="overdue" icon="error" label="Vencido" />
        ) : diff <= 3 ? (
          <Tag variant="soon" icon="schedule" label={formatDayMonth(payment.dueDate)} />
        ) : (
          <span className="gp-item__meta">
            <Icon name="event" />
            {formatDayMonth(payment.dueDate)}
          </span>
        )}
        <IconButton
          icon={payment.paid ? "radio_button_unchecked" : "check_circle"}
          ariaLabel={payment.paid ? `Marcar como pendiente: ${payment.concept}` : `Marcar como pagado: ${payment.concept}`}
          onClick={onTogglePaid}
        />
      </div>
    </li>
  );
}
