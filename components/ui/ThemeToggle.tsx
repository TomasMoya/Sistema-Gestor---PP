"use client";

import { useEffect, useState } from "react";
import { getCurrentTheme, setStoredTheme, type Theme } from "@/lib/theme";
import { IconButton } from "./IconButton";

/** Cambia el tema sin recargar y lo persiste; respeta la preferencia del sistema por defecto. */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Lee `document.documentElement.dataset.theme` solo tras montar, para que el primer
    // render del cliente coincida con el del servidor (ninguno conoce el tema real) y no
    // haya desajuste de hidratación.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(getCurrentTheme());
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setStoredTheme(next);
    setTheme(next);
  }

  return (
    <IconButton
      icon={theme === "dark" ? "light_mode" : "dark_mode"}
      ariaLabel={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      onClick={toggle}
      className={className}
    />
  );
}
