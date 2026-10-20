import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Panel" };

/** Strony backendowe (panel administracyjny): komponenty shadcn/ui z `@devmentor/ui/backend`. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="hidden w-60 border-r bg-background p-4 md:block">
        <Link href="/admin" className="font-semibold">
          DevMentor · Panel
        </Link>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
