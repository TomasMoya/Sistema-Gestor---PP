import { cn } from "@/lib/cn";

interface ProgressBarProps {
  /** 0–1 (o más, para presupuestos superados); el ancho visual se recorta al 100%. */
  value: number;
  tone?: "success" | "warning" | "danger";
  thin?: boolean;
  label: string;
  color?: string;
  className?: string;
}

/** Barra de progreso lineal; siempre acompañada de texto (y, en presupuestos, icono) en quien la usa. */
export function ProgressBar({ value, tone, thin, label, color, className }: ProgressBarProps) {
  const widthPct = Math.max(0, Math.min(value, 1)) * 100;
  const toneClass = tone === "warning" ? "gp-progress--warn" : tone === "danger" ? "gp-progress--over" : undefined;
  return (
    <div
      className={cn("gp-progress", thin && "gp-progress--thin", toneClass, className)}
      role="progressbar"
      aria-valuenow={Math.round(Math.min(value, 1) * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="gp-progress__bar" style={{ width: `${widthPct}%`, background: color }} />
    </div>
  );
}
