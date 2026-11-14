interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
}

/** Encabezado de módulo (Fraunces 18/24) con una acción de texto opcional ("Ver todos"). Alto mínimo 40px. */
export function SectionHeader({ title, actionLabel, onAction, href }: SectionHeaderProps) {
  return (
    <div className="gp-section__head">
      <h2 className="gp-section__title">{title}</h2>
      {actionLabel &&
        (href ? (
          <a className="gp-btn gp-btn--text" href={href}>
            {actionLabel}
          </a>
        ) : (
          <button type="button" className="gp-btn gp-btn--text" onClick={onAction}>
            {actionLabel}
          </button>
        ))}
    </div>
  );
}
