interface SkeletonProps {
  variant?: "row" | "card";
  count?: number;
}

/** Esqueletos con la forma de las filas o de la tarjeta; nunca un spinner a pantalla completa. */
export function Skeleton({ variant = "row", count = 3 }: SkeletonProps) {
  return (
    <div role="status" aria-label="Cargando" style={{ display: "grid", gap: "var(--space-2)" }}>
      <span className="gp-sr">Cargando…</span>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`gp-skeleton gp-skeleton--${variant}`} aria-hidden="true" />
      ))}
    </div>
  );
}
