import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import { formatCurrency, formatLongDate, formatRelativeSoon } from "@/lib/format";
import { PRIORITY_TAG } from "@/lib/priority";
import type { Task } from "@/lib/types";

interface TaskDetailContentProps {
  task: Task;
  today: Date;
  onToggleDone: () => void;
  onEdit?: () => void;
}

export function TaskDetailContent({ task, today, onToggleDone, onEdit }: TaskDetailContentProps) {
  const soon = task.dueDate ? formatRelativeSoon(task.dueDate, today) : null;
  const priority = PRIORITY_TAG[task.priority];

  return (
    <>
      <div className="gp-detail__head">
        <h2 className="gp-detail__title">{task.title}</h2>
      </div>
      <dl className="gp-facts">
        {task.dueDate && (
          <>
            <dt>
              <Icon name="event" />
              Vence
            </dt>
            <dd>
              {formatLongDate(task.dueDate)}
              {soon && <Tag variant="soon" icon="schedule" label={soon} className="gp-tag--inline" />}
            </dd>
          </>
        )}
        <dt>
          <Icon name="flag" />
          Prioridad
        </dt>
        <dd>
          <Tag variant={task.priority} icon={priority.icon} label={priority.label} />
        </dd>
        {task.amount != null && (
          <>
            <dt>
              <Icon name="payments" />
              Importe
            </dt>
            <dd className="gp-num">{formatCurrency(task.amount)}</dd>
          </>
        )}
      </dl>
      {task.paymentId && (
        <Link href="/finanzas" className="gp-link-tile">
          <Icon name="shield" style={{ color: "var(--primary)" }} />
          <span style={{ flex: 1 }}>
            Vinculada al pago próximo en <b>Finanzas</b>
          </span>
          <Icon name="chevron_right" />
        </Link>
      )}
      <div className="gp-actions">
        <Button variant="filled" icon="check" onClick={onToggleDone}>
          {task.done ? "Marcar como pendiente" : "Marcar como hecha"}
        </Button>
        <Button variant="outlined" icon="edit" onClick={onEdit}>
          Editar
        </Button>
      </div>
    </>
  );
}
