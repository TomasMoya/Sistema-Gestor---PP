"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

const DESTINATIONS = [
  { href: "/hoy", label: "Hoy", icon: "today" },
  { href: "/tareas", label: "Tareas", icon: "task_alt" },
  { href: "/finanzas", label: "Finanzas", icon: "account_balance_wallet" },
  { href: "/calendario", label: "Calendario", icon: "calendar_month" },
];

/** Los destinos sin resaltar el activo: shell estático mientras `usePathname()` no se resuelve (p. ej. bajo una ruta dinámica como `/tareas/[id]`). */
function NavLinksFallback() {
  return (
    <>
      {DESTINATIONS.map((destination) => (
        <Link key={destination.href} href={destination.href}>
          <span className="gp-nav__pill">
            <Icon name={destination.icon} />
          </span>
          {destination.label}
        </Link>
      ))}
    </>
  );
}

function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {DESTINATIONS.map((destination) => {
        const active = pathname?.startsWith(destination.href) ?? false;
        return (
          <Link key={destination.href} href={destination.href} aria-current={active ? "page" : undefined}>
            <span className="gp-nav__pill">
              <Icon name={destination.icon} filled={active} />
            </span>
            {destination.label}
          </Link>
        );
      })}
    </>
  );
}

/** < 840px: barra inferior fija. */
export function NavigationBar() {
  return (
    <nav className="gp-navbar gp-screen__navbar" aria-label="Secciones">
      <Suspense fallback={<NavLinksFallback />}>
        <NavLinks />
      </Suspense>
    </nav>
  );
}

/** ≥ 840px: riel lateral de 88px. */
export function NavigationRail() {
  return (
    <nav className="gp-rail gp-screen__rail" aria-label="Secciones">
      <Suspense fallback={<NavLinksFallback />}>
        <NavLinks />
      </Suspense>
    </nav>
  );
}
