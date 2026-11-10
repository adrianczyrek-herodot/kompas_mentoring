"use client";

import { FREE_CANCEL_HOURS, nextFreeWeek, weekSlots } from "@devmentor/core/domain";
import { DEMO_NOW } from "@devmentor/db/fixtures";
import { Badge } from "@devmentor/ui/frontend/badge";
import { buttonVariants } from "@devmentor/ui/frontend/button";
import { cardClass } from "@devmentor/ui/frontend/card";
import { Icon } from "@devmentor/ui/frontend/icon";
import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import { EmptyState, ErrorState } from "@devmentor/ui/frontend/state";
import { toast } from "@devmentor/ui/frontend/toast";
import { h2Class, smallMuted } from "@devmentor/ui/frontend/typography";
import { dayShort, fmtDate, fmtTime, money } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { clearDraft, holdDraft, rememberReturnTo, selectSlot } from "@/demo/actions";
import { toUrl } from "@/demo/navigation";
import { mentorById } from "@/demo/store";
import { useDemoStore } from "@/demo/use-demo-store";
import { useSetViewState, useViewState } from "@/demo/use-view-state";
import { BackLink, MentorSummary, StepsBar } from "./common";

const slotClass = "cursor-pointer rounded-lg border border-brand-soft bg-brand-soft px-0.5 py-[9px] text-[0.82rem] font-semibold text-brand hover:not-disabled:border-brand disabled:cursor-not-allowed disabled:border-line-2 disabled:bg-transparent disabled:text-ink-3 disabled:line-through";

/** U1 — wybór terminu (`?w=` tydzień, `?d=` długość sesji z salda). */
export function PickSlotView({ mentorId }: { mentorId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const state = useViewState();
  const setState = useSetViewState();
  const store = useDemoStore();
  // Terminy „zajęte” przez symulację 409 — tylko w tym widoku, jak w mockupie.
  const [taken, setTaken] = useState<string[]>([]);
  const m = mentorById(mentorId);
  if (!m) return <ErrorState text="Nie znaleziono mentora." onRetry={() => setState("success")} />;

  const w = Number(params.get("w") ?? 0);
  const fromBalance = store.loggedIn && (store.balances[m.id] ?? 0) > 0;
  const type = fromBalance ? "plan" : "trial";
  const duration = type === "trial" ? 30 : Number(params.get("d") ?? 60);
  const week = state === "empty" ? weekSlots(m, w, DEMO_NOW).map((d) => ({ ...d, slots: [] })) : weekSlots(m, w, DEMO_NOW);
  const hasFree = week.some((d) => d.slots.some((s) => !s.taken));
  const next = hasFree ? null : nextFreeWeek(m, w, DEMO_NOW);
  const sel = store.draft?.mentorId === m.id ? store.draft.startsAt : undefined;
  const href = (q: Record<string, number>) => `/rezerwacja/${m.id}?${new URLSearchParams(Object.entries(q).map(([k, v]) => [k, String(v)]))}`;

  const goOn = () => {
    if (!store.draft?.startsAt) return;
    holdDraft();
    const target = `#/rezerwacja/${m.id}/platnosc`;
    if (!store.loggedIn) {
      rememberReturnTo(target);
      toast("Zaloguj się, aby dokończyć rezerwację");
      router.push("/rejestracja");
    } else router.push(toUrl(target));
  };
  const simulate409 = () => {
    if (!sel) { toast("Najpierw wybierz termin", "err"); return; }
    setTaken((t) => [...t, sel]);
    clearDraft();
    toast("Ten termin został właśnie zajęty. Wybierz inny.", "err");
  };

  const grid = (
    <>
      <div className="mt-3.5 mb-2.5 flex items-center justify-between">
        <Link className={cn(buttonVariants({ variant: "ghost", size: "s" }), w <= 0 && "pointer-events-none opacity-45")} href={href({ w: Math.max(0, w - 1) })} aria-disabled={w <= 0} aria-label="Poprzedni tydzień"><Icon name="back" /></Link>
        <strong>{fmtDate(week[0]!.day)} – {fmtDate(week[6]!.day)}</strong>
        <Link className={buttonVariants({ variant: "ghost", size: "s" })} href={href({ w: w + 1 })} aria-label="Następny tydzień"><Icon name="arrow" /></Link>
      </div>
      {hasFree ? (
        <div className="mb-3 grid grid-cols-7 gap-1.5">
          {week.map((d, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <span className="flex flex-col text-center text-[0.72rem] text-ink-2 uppercase">{dayShort(i)}<b className="font-serif text-[1.05rem] text-ink">{d.day.getDate()}</b></span>
              {d.slots.length ? d.slots.map((s) => (
                <button key={s.iso} type="button" data-slot={s.iso} disabled={s.taken || taken.includes(s.iso)} aria-label={s.taken ? "zajęte" : undefined}
                  className={cn(slotClass, s.iso === sel && "border-brand bg-brand text-white")}
                  onClick={() => selectSlot({ mentorId: m.id, startsAt: s.iso, durationMin: duration, type })}>
                  {fmtTime(s.iso)}
                </button>
              )) : <span className="text-center text-ink-3">—</span>}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Brak wolnych terminów w tym tygodniu"
          text={next !== null ? "Najbliższe wolne terminy są w kolejnym tygodniu." : "Mentor nie ma wolnych terminów w najbliższych tygodniach."}
          action={next !== null
            ? <Link className={buttonVariants()} href={href({ w: next })}>Przejdź do najbliższego terminu</Link>
            : <Link className={buttonVariants()} href={toUrl(`#/wiadomosci/nowa?m=${m.id}`)}>Napisz do mentora</Link>}
        />
      )}
    </>
  );

  return (
    <>
      <BackLink href={`/mentorzy/${m.id}`}>{m.name}</BackLink>
      <StepsBar step={1} />
      <div className="grid gap-5 min-[900px]:grid-cols-[1fr_360px] min-[900px]:items-start">
        <section className={cardClass}>
          <h1 className={h2Class}>{type === "trial" ? "Wybierz termin sesji próbnej" : "Zarezerwuj sesję z salda"}</h1>
          <div className="flex flex-wrap items-center justify-between gap-2">
            {type === "trial" ? <Badge>30 min · sesja próbna</Badge> : (
              <div className="inline-flex flex-wrap gap-0.5 rounded-full border border-line bg-surface p-[3px]" role="radiogroup">
                {[30, 60].map((d) => (
                  <Link key={d} role="radio" aria-checked={d === duration} href={href({ w, d })}
                    className={cn("rounded-full px-3.5 py-1.5 text-[0.9rem] no-underline", d === duration && "bg-brand text-white")}>{d} min</Link>
                ))}
              </div>
            )}
            <label className={smallMuted}>Strefa czasowa{" "}
              <select className="ml-1 rounded-lg border border-line bg-surface px-1.5 py-1" aria-label="Strefa czasowa">
                <option>Europe/Warsaw (UTC+2)</option><option>Europe/London (UTC+1)</option><option>America/New_York (UTC−4)</option>
              </select>
            </label>
          </div>
          {state === "loading" ? <div className="mt-3"><Skeleton rows={5} kind="line" /></div>
            : state === "error" ? <ErrorState text="Nie udało się pobrać dostępności mentora." onRetry={() => setState("success")} />
              : grid}
          <p className={smallMuted}><Icon name="cal" /> Przełożenie lub anulowanie jest bezpłatne do {FREE_CANCEL_HOURS} h przed sesją. Rezerwacja możliwa najpóźniej 6 h przed terminem.</p>
        </section>
        <aside className={cn(cardClass, "flex flex-col gap-3.5 min-[900px]:sticky min-[900px]:top-[76px]")}>
          <MentorSummary mentor={m}>{m.headline.split("·")[0]}</MentorSummary>
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[0.92rem] [&_dd]:m-0 [&_dd]:text-right [&_dt]:text-ink-2">
            <dt>Termin</dt><dd data-sel-label>{sel ? `${fmtDate(sel)}, ${fmtTime(sel)}` : "—"}</dd>
            <dt>Czas</dt><dd>{duration} min</dd>
            <dt>Koszt</dt><dd>{type === "trial" ? money(m.trialPrice) : "1 sesja z salda"}</dd>
          </dl>
          <button type="button" data-continue className={buttonVariants({ block: true })} disabled={!sel} onClick={goOn}>Dalej</button>
          <button type="button" data-sim409 className="cursor-pointer border-0 bg-transparent p-0 text-[0.85rem] font-semibold text-brand-2 hover:underline" onClick={simulate409}>
            Mockup: symuluj zajęcie terminu (409)
          </button>
        </aside>
      </div>
    </>
  );
}
