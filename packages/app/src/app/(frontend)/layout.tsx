import "./frontend.css";
import { Toaster } from "@devmentor/ui/frontend/toast";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Kompas", template: "%s · Kompas" },
  description: "Mentoring 1:1 dla programistów",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#13463d",
};

/**
 * Wspólny root layout stron React (Tailwind) i ekranów z `src/legacy` pod `/app` — przejścia między nimi
 * są nawigacją klienta, więc stan demo w pamięci (i komunikaty `toast`) zostaje. Style: `frontend.css` (bez preflightu Tailwinda).
 */
export default function FrontendRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
