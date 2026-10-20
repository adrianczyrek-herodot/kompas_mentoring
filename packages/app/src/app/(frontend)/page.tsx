import { Hero } from "@devmentor/ui/frontend/hero";
import Link from "next/link";

export default function HomePage() {
  return (
    <Hero
      eyebrow="Mentoring 1:1"
      title="Rozwijaj się szybciej z doświadczonym mentorem"
      description="Znajdź mentora, umów sesję próbną i zaplanuj regularne spotkania — wszystko w jednym miejscu."
      actions={
        <Link
          href="/admin"
          className="rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-indigo-500"
        >
          Przejdź do panelu
        </Link>
      }
    />
  );
}
