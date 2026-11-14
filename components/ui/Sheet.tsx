"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface SheetProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/** Hoja inferior en móvil, diálogo centrado en escritorio (mismo componente, breakpoint en CSS). */
export function Sheet({ title, onClose, children, footer }: SheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("input, select, textarea, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div className="gp-scrim" onClick={onClose} />
      <div className="gp-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={panelRef}>
        <div className="gp-sheet__grip" aria-hidden="true" />
        <h2 className="gp-sheet__title" id={titleId}>
          {title}
        </h2>
        {children}
        {footer && <div className="gp-sheet__actions">{footer}</div>}
      </div>
    </>,
    document.body,
  );
}
