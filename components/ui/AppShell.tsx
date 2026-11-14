import type { ReactNode } from "react";
import { NavigationBar, NavigationRail } from "./Navigation";
import { ThemeToggle } from "./ThemeToggle";

/** Barra inferior en móvil, riel lateral en escritorio (§4 del handoff); el resto de la pantalla lo define cada ruta. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="gp-screen">
      <div className="gp-screen__frame">
        <NavigationRail />
        <main className="gp-screen__main">{children}</main>
        <ThemeToggle className="gp-screen__theme-toggle" />
      </div>
      <NavigationBar />
    </div>
  );
}
