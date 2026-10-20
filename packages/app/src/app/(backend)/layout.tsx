import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "DevMentor", template: "%s · DevMentor" },
  description: "Mentoring 1:1 dla programistów",
};

/** Root layout stron z Tailwindem (panel na shadcn/ui). */
export default function BackendRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
