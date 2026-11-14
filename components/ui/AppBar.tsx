import type { ReactNode } from "react";

interface AppBarProps {
  overline: string;
  title: string;
  children?: ReactNode;
}

/** Overline en mayúsculas + título Fraunces (34px desde 840px vía CSS). */
export function AppBar({ overline, title, children }: AppBarProps) {
  return (
    <header className="gp-appbar">
      <div>
        <div className="gp-appbar__over">{overline}</div>
        <h1 className="gp-appbar__title">{title}</h1>
      </div>
      {children && <div className="gp-month">{children}</div>}
    </header>
  );
}
