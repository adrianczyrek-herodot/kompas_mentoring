"use client";

import { CATEGORIES } from "@devmentor/core/domain";
import { length } from "@devmentor/core/validation";
import { MENTORS } from "@devmentor/db/fixtures";
import { buttonVariants } from "@devmentor/ui/frontend/button";
import { chipVariants } from "@devmentor/ui/frontend/chip";
import { Icon } from "@devmentor/ui/frontend/icon";
import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { toUrl } from "@/demo/navigation";
import { startMentorOnboarding } from "@/demo/actions";
import { useViewState } from "@/demo/use-view-state";
import { MentorMiniCard } from "./mentor-cards";

const STEPS = [
  ["Znajdź mentora", "Filtruj po temacie, budżecie i godzinach. Obejrzyj wideo i opinie."],
  ["Sesja próbna", "30 minut na poznanie się i ustalenie celu. Gwarancja zamiany lub zwrotu."],
  ["Plan i postępy", "Stały rytm sesji, notatki i zadania po każdym spotkaniu."],
];

/** P1 — strona główna. */
export function HomeView() {
  const router = useRouter();
  const state = useViewState();
  const [error, setError] = useState<string | null>(null);
  const featured = MENTORS.filter((m) => m.verified).slice(0, 4);

  // Stare adresy mockupu (`/#/sesje`) prowadzą pod nowe (`/app#/sesje`, `/mentorzy`…).
  useEffect(() => {
    if (location.hash.startsWith("#/")) router.replace(toUrl(location.hash));
  }, [router]);

  const search = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    if (q.length === 1) { setError(length(2, 80)(q)); return; }
    router.push(q ? `/mentorzy?topic=${encodeURIComponent(q)}` : "/mentorzy");
  };

  return (
    <>
      <section className="max-w-[760px] pt-7 pb-2">
        <p className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-brand-2 uppercase">Mentoring 1:1 online</p>
        <h1 className="mb-[0.4em] font-serif text-[clamp(1.9rem,5vw,2.9rem)] leading-tight font-semibold tracking-[-0.01em]">
          Rozwijaj się szybciej z mentorem, który już przeszedł tę drogę
        </h1>
        <p className="text-[1.08rem] text-ink-2">
          Zweryfikowani praktycy z IT, produktu i designu. Zacznij od 30-minutowej sesji próbnej — jeśli nie zaiskrzy, zmienisz mentora za darmo.
        </p>
        <form onSubmit={search} role="search" noValidate className="mt-[18px] flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pr-1.5 pl-4 shadow-card">
          <Icon name="search" />
          <input name="q" list="topics" aria-label="Temat" aria-invalid={error ? true : undefined}
            placeholder="Czego chcesz się nauczyć? np. React, awans na lidera" className="min-w-0 flex-1 border-0 bg-transparent py-2 focus:outline-none" />
          <datalist id="topics">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
          <button type="submit" className={buttonVariants()}>Szukaj</button>
        </form>
        {error && <p className="m-0 text-[0.82rem] text-err" aria-live="polite">{error}</p>}
        <div className="my-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => <Link key={c} className={chipVariants()} href={`/mentorzy?topic=${encodeURIComponent(c)}`}>{c}</Link>)}
        </div>
      </section>

      <section className="my-8 grid gap-4 md:grid-cols-3">
        {STEPS.map(([title, text], i) => (
          <div key={title} className="border-t-2 border-brand pt-3">
            <span className="font-serif text-[1.6rem] text-accent">{i + 1}</span>
            <h3 className="mb-[0.4em] font-serif text-[1.12rem] font-semibold">{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-2.5 flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-[1.4rem] font-semibold">Polecani mentorzy</h2>
          <Link href="/mentorzy" className="inline-flex items-center gap-1 font-semibold text-brand-2 no-underline hover:underline">Wszyscy mentorzy <Icon name="arrow" /></Link>
        </div>
        {state === "loading" && <Skeleton rows={4} />}
        {state === "success" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{featured.map((m) => <MentorMiniCard key={m.id} mentor={m} />)}</div>
        )}
      </section>

      <section className="mt-9 flex flex-wrap items-center justify-between gap-4 rounded-card bg-brand px-[22px] py-[26px] text-[#e7f0ec]">
        <div>
          <h2 className="mb-[0.4em] font-serif text-[1.4rem] font-semibold text-white">Masz doświadczenie, którym chcesz się dzielić?</h2>
          <p>Ustal własną stawkę i godziny. Płatności i rozliczenia bierzemy na siebie.</p>
        </div>
        <Link
          className={buttonVariants({ variant: "light" })}
          href={toUrl("#/mentor/onboarding/1")}
          onClick={startMentorOnboarding}
        >
          Zostań mentorem
        </Link>
      </section>
    </>
  );
}
