"use client";

import { canJoin, splitSessions, type Session } from "@devmentor/core/domain";
import { DEMO_NOW } from "@devmentor/db/fixtures";
import { Avatar } from "@devmentor/ui/frontend/avatar";
import { Badge } from "@devmentor/ui/frontend/badge";
import { buttonVariants } from "@devmentor/ui/frontend/button";
import { cardClass } from "@devmentor/ui/frontend/card";
import { chipVariants } from "@devmentor/ui/frontend/chip";
import { Icon } from "@devmentor/ui/frontend/icon";
import { listClass, listItemClass } from "@devmentor/ui/frontend/list";
import { Skeleton, SkeletonBlock } from "@devmentor/ui/frontend/skeleton";
import { EmptyState, ErrorState } from "@devmentor/ui/frontend/state";
import { h1Class, smallMuted } from "@devmentor/ui/frontend/typography";
import { fmtDateLong, fmtTime } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { mentorById } from "@/demo/store";
import { useDemoStore } from "@/demo/use-demo-store";
import { useSetViewState, useViewState } from "@/demo/use-view-state";
import { DateTile, STATUS_LABEL, STATUS_TONE, typeLabel } from "./common";

const sessionsWord = (n: number) => (n === 1 ? "sesja" : n < 5 ? "sesje" : "sesji");
const tabClass = (on: boolean) => cn("-mb-px border-b-2 px-3.5 py-2.5 font-semibold whitespace-nowrap no-underline", on ? "border-brand text-brand" : "border-transparent text-ink-2");

function SessionRow({ s }: { s: Session }) {
  const m = mentorById(s.mentorId)!;
  const toReview = s.status === "completed" && !s.reviewed;
  return (
    <Link className={cn(listItemClass, "hover:bg-[#fbfaf6]")} href={`/sesje/${s.id}`}>
      <DateTile iso={s.startsAt} />
      <div className="min-w-0 flex-1"><strong>{m.name}</strong><br /><span className={smallMuted}>{fmtTime(s.startsAt)} · {s.durationMin} min · {typeLabel(s)}</span></div>
      {toReview ? <Badge tone="accent">Oceń</Badge> : <Badge tone={STATUS_TONE[s.status]}>{STATUS_LABEL[s.status]}</Badge>}
    </Link>
  );
}

/** U4 — moje sesje (`?tab=minione`). */
export function SessionsView() {
  const store = useDemoStore();
  const state = useViewState();
  const setState = useSetViewState();
  const tab = useSearchParams().get("tab") === "minione" ? "past" : "upcoming";
  const { upcoming, past } = splitSessions(state === "empty" ? [] : store.sessions, DEMO_NOW);
  const next = upcoming[0];
  const list = tab === "upcoming" ? upcoming.slice(next ? 1 : 0) : past;
  const balances = Object.entries(store.balances).filter(([, n]) => n > 0);
  const findMentor = <Link className={buttonVariants()} href="/mentorzy">Znajdź mentora</Link>;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className={cn(h1Class, "m-0")}>Moje sesje</h1>
        <Link className={buttonVariants({ size: "s" })} href="/mentorzy">Znajdź mentora</Link>
      </div>
      {state === "loading" && <><SkeletonBlock className="mb-4 h-40" /><Skeleton rows={3} kind="line" /></>}
      {state === "error" && <ErrorState text="Nie udało się wczytać sesji." onRetry={() => setState("success")} />}
      {state === "empty" && <EmptyState title="Nie masz jeszcze sesji" text="Zacznij od sesji próbnej — 30 minut, żeby poznać mentora i ustalić cel." action={findMentor} />}
      {state === "success" && (
        <>
          {balances.length > 0 && (
            <div className="my-3 flex flex-wrap gap-2">
              {balances.map(([id, n]) => <Link key={id} className={chipVariants()} href="/plany">{mentorById(id)!.name}: saldo {n} {sessionsWord(n)}</Link>)}
            </div>
          )}
          {next && tab === "upcoming" && <NextSession s={next} />}
          <div className="mb-4 flex gap-1 overflow-x-auto border-b border-line" role="tablist">
            <Link role="tab" className={tabClass(tab === "upcoming")} href="/sesje">Nadchodzące ({upcoming.length})</Link>
            <Link role="tab" className={tabClass(tab === "past")} href="/sesje?tab=minione">Minione ({past.length})</Link>
          </div>
          <div className={listClass}>
            {list.length ? list.map((s) => <SessionRow key={s.id} s={s} />)
              : <p className="m-0 p-6 text-center text-ink-2">{tab === "upcoming" ? "Brak kolejnych zaplanowanych sesji." : "Brak minionych sesji."}</p>}
          </div>
        </>
      )}
    </>
  );
}

function NextSession({ s }: { s: Session }) {
  const m = mentorById(s.mentorId)!;
  const hours = Math.max(0, Math.round((new Date(s.startsAt).getTime() - DEMO_NOW.getTime()) / 36e5));
  return (
    <section className={cn(cardClass, "mb-5 space-y-2.5 border-l-4 border-l-accent")}>
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-brand-2 uppercase">Najbliższa sesja</span>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar name={m.name} hue={m.hue} size={52} />
          <div><strong>{m.name}</strong><br /><span className={smallMuted}>{fmtDateLong(s.startsAt)} · {fmtTime(s.startsAt)} · {s.durationMin} min</span></div>
        </div>
        {canJoin(s, DEMO_NOW)
          ? <Link className={buttonVariants()} href={`/sesje/${s.id}/pokoj`}><Icon name="cam" /> Dołącz</Link>
          : <span className={smallMuted}>Dołączenie możliwe 10 min przed startem (za {hours} h)</span>}
      </div>
      <p className="text-[0.85rem]"><Icon name="target" /> {s.goal}</p>
      <div className="flex gap-2"><Link className="inline-flex text-[0.85rem] font-semibold text-brand-2 no-underline hover:underline" href={`/sesje/${s.id}`}>Przełóż lub anuluj</Link></div>
    </section>
  );
}
