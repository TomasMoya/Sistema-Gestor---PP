"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";

export interface RowMenuItem {
  label: string;
  icon: string;
  onSelect: () => void;
}

interface RowMenuProps {
  ariaLabel: string;
  items: RowMenuItem[];
}

/** Botón ⋮ con menú flotante: alternativa siempre visible a los gestos de deslizar (completar / posponer). */
export function RowMenu({ ariaLabel, items }: RowMenuProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    // "mousedown" (no "click"): si solo mirara el botón, el mousedown sobre un ítem del menú
    // (que vive en un portal fuera de btnRef) cerraría el menú y lo desmontaría antes de que
    // llegara su propio "click", y el ítem nunca se seleccionaría.
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!btnRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle(event: React.MouseEvent) {
    event.stopPropagation();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: Math.min(Math.max(8, rect.right - 220), window.innerWidth - 228) });
    }
    setOpen((value) => !value);
  }

  return (
    <>
      <IconButton ref={btnRef} icon="more_vert" ariaLabel={ariaLabel} onClick={toggle} />
      {open &&
        createPortal(
          <div ref={menuRef} className="gp-menu" role="menu" style={{ position: "fixed", top: pos.top, left: pos.left }}>
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={(event) => {
                  event.stopPropagation();
                  item.onSelect();
                  setOpen(false);
                }}
              >
                <Icon name={item.icon} />
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
