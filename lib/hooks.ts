"use client";

import { useEffect, useState } from "react";

/** Clase de ventana de Material 3: `true` desde que el navegador confirma el match (sin asumir nada en el primer render). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    // `matchMedia` no existe en el servidor; se lee tras montar para no desajustar la hidratación.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatches(mql.matches);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export function useIsExpanded(): boolean {
  return useMediaQuery("(min-width: 840px)");
}
