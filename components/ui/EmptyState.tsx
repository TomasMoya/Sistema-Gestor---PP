import { Button } from "./Button";
import { Icon } from "./Icon";

interface EmptyStateProps {
  icon: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, text, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="gp-empty">
      <span className="gp-empty__icon">
        <Icon name={icon} size="lg" />
      </span>
      <p className="gp-empty__text">{text}</p>
      {actionLabel && (
        <Button variant="tonal" icon="add" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
