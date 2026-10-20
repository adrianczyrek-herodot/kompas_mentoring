import { Container } from "@devmentor/ui/frontend/container";
import Link from "next/link";
import type { ReactNode } from "react";

/** Strony frontendowe (publiczne): Tailwind + `@devmentor/ui/frontend`. Bez komponentów shadcn. */
export default function FrontendLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-indigo-700">
            DevMentor
          </Link>
          <nav className="flex gap-6 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900">
              Mentorzy
            </Link>
            <Link href="/admin" className="hover:text-slate-900">
              Panel
            </Link>
          </nav>
        </Container>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 py-6 text-sm text-slate-500">
        <Container>© DevMentor</Container>
      </footer>
    </div>
  );
}
