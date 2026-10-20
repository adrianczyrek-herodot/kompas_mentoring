import type { ReactNode } from "react";
import { Container } from "./container";

type HeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

/** Sekcja otwierająca stronę publiczną. Czysty Tailwind — bez komponentów shadcn. */
export function Hero({ eyebrow, title, description, actions }: HeroProps) {
  return (
    <section className="bg-gradient-to-b from-indigo-50 to-white py-20 sm:py-28">
      <Container className="flex flex-col items-start gap-6">
        {eyebrow && (
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">{eyebrow}</span>
        )}
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">{title}</h1>
        <p className="max-w-2xl text-lg text-slate-600">{description}</p>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </Container>
    </section>
  );
}
