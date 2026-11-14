import type { ReactNode } from "react";
import { AppShell } from "@/components/ui/AppShell";

// La navegación resalta el destino activo con `usePathname()`, que depende de la ruta en
// tiempo de ejecución; toda la app renderiza datos simulados en el cliente, así que no hay
// nada que ganar prerenderizando un shell estático aquí (ver "Adopting incrementally" en la
// guía de migración a Cache Components de Next.js).
export const instant = false;

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
