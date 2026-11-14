import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

interface IconProps {
  name: string;
  filled?: boolean;
  size?: "sm" | "lg";
  className?: string;
  style?: CSSProperties;
}

/** Icono decorativo de Material Symbols Rounded. El significado va siempre junto a texto o a un `aria-label` del control que lo contiene. */
export function Icon({ name, filled, size, className, style }: IconProps) {
  return (
    <span className={cn("gp-ico", filled && "fill", size, className)} aria-hidden="true" style={style}>
      {name}
    </span>
  );
}
