import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Una sola superficie con divisores de 1px, en vez de una tarjeta por fila. */
export function GroupedList({ children, className, "aria-label": ariaLabel }: { children: ReactNode; className?: string; "aria-label"?: string }) {
  return (
    <ul className={cn("gp-list", className)} aria-label={ariaLabel}>
      {children}
    </ul>
  );
}
