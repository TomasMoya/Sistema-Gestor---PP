export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "gp-theme";

/**
 * Se ejecuta inline en <head>, antes de pintar, para no parpadear entre temas.
 * No puede importar nada: se serializa a texto con `toString()`.
 */
export function themeInitScript() {
  try {
    const stored = localStorage.getItem("gp-theme");
    const theme =
      stored === "light" || stored === "dark"
        ? stored
        : matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    document.documentElement.dataset.theme = theme;
  } catch {
    // localStorage puede no estar disponible (modo privado, etc.); se sigue el tema del sistema.
  }
}

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(THEME_STORAGE_KEY);
  return value === "light" || value === "dark" ? value : null;
}

export function setStoredTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function getCurrentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}
