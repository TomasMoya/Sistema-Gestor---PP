import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export type TagVariant = "high" | "medium" | "low" | "soon" | "overdue" | "ok";

interface TagProps {
  variant: TagVariant;
  icon: string;
  label: string;
  className?: string;
}

/** Etiqueta pequeña y no interactiva: siempre icono + palabra, nunca color solo. */
export function Tag({ variant, icon, label, className }: TagProps) {
  return (
    <span className={cn("gp-tag", `gp-tag--${variant}`, className)}>
      <Icon name={icon} />
      {label}
    </span>
  );
}
