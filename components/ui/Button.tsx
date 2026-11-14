import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "filled" | "tonal" | "outlined" | "text";
  icon?: string;
}

/** Píldora de 40px de alto (área táctil 48). Un solo `filled` por vista. */
export function Button({ variant, icon, children, className, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={cn("gp-btn", `gp-btn--${variant}`, className)} {...rest}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}
