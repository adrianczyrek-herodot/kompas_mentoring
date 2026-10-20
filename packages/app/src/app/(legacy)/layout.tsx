import "@devmentor/ui/kompas.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Kompas · mockup",
  description: "Mentoring 1:1 dla programistów",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#13463d",
};

/**
 * Root layout aplikacji przenoszonej z mockupu: tylko style Kompasu, bez Tailwinda
 * (preflight Tailwinda zmieniłby wygląd). Ekrany wracają do `(frontend)` w miarę przepisywania na React.
 */
export default function LegacyRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
