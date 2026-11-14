import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  ariaLabel: string;
}

/** Botón de solo icono, 40px (área táctil 48). `ariaLabel` es obligatorio. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, ariaLabel, className, type = "button", ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={cn("gp-iconbtn", className)} aria-label={ariaLabel} {...rest}>
      <Icon name={icon} />
    </button>
  );
});
