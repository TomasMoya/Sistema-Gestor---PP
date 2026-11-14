import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gestión personal",
  description: "Tareas, finanzas y calendario en un solo lugar.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${fraunces.variable} ${plusJakartaSans.variable} h-full`}
    >
      <head>
        {/* Material Symbols Rounded: fuente variable sin soporte en next/font/google; es la
            carga que recomienda el handoff de diseño y se aplica a toda la app (no a una sola página). */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font, @next/next/google-font-display */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400..600,0..1,0&display=block"
        />
        <script dangerouslySetInnerHTML={{ __html: `(${themeInitScript.toString()})();` }} />
      </head>
      <body className="gp h-full antialiased" cz-shortcut-listen="true">{children}</body>
    </html>
  );
}
