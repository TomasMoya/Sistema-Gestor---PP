"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

interface FabProps {
  icon: string;
  label?: string;
  ariaLabel?: string;
  onClick?: () => void;
  className?: string;
}

/** FAB extendido por defecto; se contrae a 56×56 al hacer scroll hacia abajo. Solo visible en < 840px (lo oculta `.gp-screen`). */
export function Fab({ icon, label, ariaLabel, onClick, className }: FabProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const scrollEl = ref.current?.closest(".gp-screen__main");
    if (!(scrollEl instanceof HTMLElement)) return;
    let lastTop = scrollEl.scrollTop;
    const onScroll = () => {
      const top = scrollEl.scrollTop;
      setCollapsed(top > lastTop + 4 && top > 24);
      if (top < lastTop - 4) setCollapsed(false);
      lastTop = top;
    };
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, []);

  const extended = Boolean(label) && !collapsed;

  return (
    <button
      ref={ref}
      type="button"
      className={cn("gp-fab", extended && "gp-fab--extended", className)}
      onClick={onClick}
      aria-label={extended ? undefined : (ariaLabel ?? label)}
    >
      <Icon name={icon} />
      {extended && label}
    </button>
  );
}
