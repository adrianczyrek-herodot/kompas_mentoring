"use client";

import { buttonVariants } from "@devmentor/ui/frontend/button";
import { cardClass } from "@devmentor/ui/frontend/card";
import { Icon } from "@devmentor/ui/frontend/icon";
import { Spinner } from "@devmentor/ui/frontend/spinner";
import { ErrorState } from "@devmentor/ui/frontend/state";
import { toast } from "@devmentor/ui/frontend/toast";
import { h1Class, h2Class, h3Class } from "@devmentor/ui/frontend/typography";
import { fmtDateLong, fmtTime } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { toUrl } from "@/demo/navigation";
import { mentorById, sessionById } from "@/demo/store";
import { useDemoStore } from "@/demo/use-demo-store";
import { useSetViewState, useViewState } from "@/demo/use-view-state";
import { MentorSummary, StepsBar, firstName, typeLabel } from "./common";

const CHECKLIST = [
  "Sprawdź kamerę i mikrofon — test jest przed wejściem do pokoju.",
  "Przygotuj link do kodu lub dokumentu, który chcesz omówić.",
  "Zapisz 2–3 pytania, na które chcesz poznać odpowiedź.",
];

/** U3 — potwierdzenie rezerwacji; stan „loading” to oczekiwanie na potwierdzenie płatności. */
export function ConfirmationView({ id }: { id: string }) {
  useDemoStore();
  const state = useViewState();
  const setState = useSetViewState();
  const s = sessionById(id);

  if (state === "loading") {
    return (
      <div className={cn(cardClass, "mx-auto flex max-w-[640px] flex-col items-center gap-3 text-center")}>
        <Spinner large />
        <h1 className={h2Class}>Potwierdzamy płatność…</h1>
        <p className="text-ink-2">To zwykle trwa kilka sekund. Jeśli potrwa dłużej, potwierdzimy rezerwację e-mailem.</p>
      </div>
    );
  }
  if (!s || state === "error") {
    return (
      <div className="mx-auto max-w-[640px]">
        <ErrorState text="Nie mamy jeszcze potwierdzenia płatności. Nie płać ponownie — skontaktuj się z pomocą, jeśli status nie zmieni się w ciągu 5 minut." onRetry={() => setState("success")} />
      </div>
    );
  }
  const m = mentorById(s.mentorId)!;
  const addToCalendar = () => toast("Dodano do kalendarza");
  return (
    <>
      <StepsBar step={3} />
      <div className="mx-auto max-w-[640px] space-y-5">
        <div className="text-center">
          <Icon name="check" className="mb-2.5 size-14 rounded-full bg-ok-soft p-3.5 text-ok" />
          <h1 className={h1Class}>Sesja zarezerwowana</h1>
          <p className="text-ink-2">
            {s.status === "requested" ? `${firstName(m.name)} potwierdzi termin w ciągu 24 h. Jeśli odrzuci — zwrócimy pieniądze automatycznie.` : "Mentor dostał powiadomienie."}
          </p>
        </div>
        <div className={cardClass}>
          <MentorSummary mentor={m}>{typeLabel(s)} · {s.durationMin} min</MentorSummary>
          <p className="my-3 font-serif text-[1.25rem]">{fmtDateLong(s.startsAt)} · {fmtTime(s.startsAt)}</p>
          <div className="flex flex-wrap gap-2">
            {["Google Calendar", "Outlook", "Pobierz .ics"].map((l) => (
              <button key={l} type="button" data-cal className={buttonVariants({ variant: "ghost", size: "s" })} onClick={addToCalendar}>{l}</button>
            ))}
          </div>
        </div>
        <div className={cardClass}>
          <h2 className={h3Class}>Jak się przygotować</h2>
          <ul className="m-0 grid list-none gap-2 p-0">
            {CHECKLIST.map((c) => <li key={c} className="relative pl-6 before:absolute before:left-1 before:font-bold before:text-ok before:content-['✓']">{c}</li>)}
          </ul>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className={buttonVariants()} href={`/sesje/${s.id}`}>Szczegóły sesji</Link>
          <Link className={buttonVariants({ variant: "ghost" })} href={toUrl(`#/wiadomosci/nowa?m=${m.id}`)}>Napisz do mentora</Link>
        </div>
      </div>
    </>
  );
}
