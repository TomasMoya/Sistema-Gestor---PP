import { Button } from "./Button";
import { Icon } from "./Icon";

interface ErrorStateProps {
  text?: string;
  onRetry: () => void;
}

export function ErrorState({ text = "Algo falló al cargar los datos.", onRetry }: ErrorStateProps) {
  return (
    <div className="gp-error" role="alert">
      <span className="gp-error__icon">
        <Icon name="error" size="lg" />
      </span>
      <p className="gp-error__text">{text}</p>
      <Button variant="outlined" icon="refresh" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}
