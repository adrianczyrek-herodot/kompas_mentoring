import "@devmentor/ui/styles.css";
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
 * Jeden root layout dla stron (`(site)`, Tailwind) i panelu (`(panel)`, shadcn/ui): przejścia między nimi
 * są nawigacją klienta, więc stan demo w pamięci (rola, sesje) i komunikaty `toast` zostają.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
