"use client";

import { similarMentors, weekSlots } from "@devmentor/core/domain";
import { DEMO_NOW, MENTORS } from "@devmentor/db/fixtures";
import { Avatar } from "@devmentor/ui/frontend/avatar";
import { buttonVariants } from "@devmentor/ui/frontend/button";
import { Icon } from "@devmentor/ui/frontend/icon";
import { Skeleton, SkeletonBlock } from "@devmentor/ui/frontend/skeleton";
import { EmptyState, ErrorState } from "@devmentor/ui/frontend/state";
import { Tag, TagList } from "@devmentor/ui/frontend/tag";
import { dayShort, fmtDate, fmtTime, money } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { toUrl } from "@/demo/navigation";
import { mentorById } from "@/demo/store";
import { useSetViewState, useViewState } from "@/demo/use-view-state";
import { MentorMiniCard, VerifiedMark, cardClass } from "./mentor-cards";

const h2Class = "mb-[0.4em] font-serif text-[1.4rem] font-semibold";
// Rozkład ocen w mockupie jest stały (wartości poglądowe).
const RATING_BREAKDOWN: [number, number][] = [[5, 86], [4, 11], [3, 3], [2, 0], [1, 0]];

/** P3 — profil mentora. */
export function ProfileView({ id }: { id: string }) {
  const state = useViewState();
  const setState = useSetViewState();
  const m = mentorById(id);

  if (!m || state === "error") {
    return (
      <div className="mx-auto max-w-[640px]">
        <ErrorState text="Ten profil jest niedostępny — mógł zostać zawieszony lub usunięty." onRetry={() => setState("success")} />
        <h2 className={h2Class}>Podobni mentorzy</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{MENTORS.slice(0, 4).map((x) => <MentorMiniCard key={x.id} mentor={x} />)}</div>
      </div>
    );
  }
  if (state === "loading") return <><SkeletonBlock className="mb-4 h-40" /><Skeleton rows={2} /></>;

  const noReviews = state === "empty" || m.reviews.length === 0;
  const week = weekSlots(m, 0, DEMO_NOW);
  const anySlot = week.some((d) => d.slots.length);
  const similar = similarMentors(MENTORS, m);
  const bookHref = toUrl(`#/rezerwacja/${m.id}`);

  return (
    <>
      <Link href="/mentorzy" className="mb-3.5 inline-flex items-center gap-1.5 text-[0.9rem] text-ink-2 no-underline"><Icon name="back" /> Wróć do wyników</Link>
      <div className="grid gap-5 min-[900px]:grid-cols-[1fr_340px] min-[900px]:items-start">
        <div className="space-y-5">
          <section className={cn(cardClass, "flex flex-wrap items-center gap-[18px]")}>
            <Avatar name={m.name} hue={m.hue} size={96} />
            <div>
              <h1 className="m-0 flex items-center gap-2 font-serif text-[1.85rem] font-semibold">{m.name} {m.verified && <VerifiedMark />}</h1>
              <p className="text-[1.08rem] text-ink-2">{m.headline}</p>
              <p className="text-[0.85rem] text-ink-2">{m.country} · {m.languages.join(", ")} · {m.yearsExp} lat doświadczenia · {m.companies.join(", ")}</p>
            </div>
          </section>
          <div className="grid aspect-video content-center place-items-center gap-2 rounded-card bg-[radial-gradient(circle_at_30%_30%,#2a6b5e,#0f2e29)] text-center text-[#e7f0ec]" role="img" aria-label="Wideo powitalne">
            <Icon name="play" className="size-[46px] rounded-full bg-white/15 p-3" /><span>Wideo powitalne · 1:42</span>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-4">
            {[[m.rating ? m.rating.toFixed(1) : "—", "ocena"], [String(m.sessions), "sesji"], [m.returningPct ? `${m.returningPct}%` : "—", "wraca po próbnej"], [`${m.responseHours} h`, "czas odpowiedzi"]]
              .map(([v, l]) => <div key={l} className="flex flex-col bg-surface p-3.5"><strong className="font-serif text-[1.4rem]">{v}</strong><span className="text-[0.8rem] text-ink-2">{l}</span></div>)}
          </div>
          <section>
            <h2 className={h2Class}>O mnie</h2>
            <p>{m.bio}</p>
            <TagList>{m.tags.map((t) => <Tag key={t}>{t}</Tag>)}</TagList>
          </section>
          <section>
            <div className="mb-2.5 flex items-baseline justify-between gap-3">
              <h2 className={h2Class}>Dostępność w tym tygodniu</h2><span className="text-[0.85rem] text-ink-2">Twoja strefa: Europe/Warsaw</span>
            </div>
            {anySlot ? (
              <div className="grid grid-cols-7 gap-1.5">
                {week.map((d, i) => (
                  <div key={i} className="flex flex-col items-stretch gap-1 text-center">
                    <span className="text-[0.74rem] font-semibold text-ink-2 uppercase">{dayShort(i)} {d.day.getDate()}</span>
                    {d.slots.length
                      ? d.slots.map((s) => <span key={s.iso} className={cn("rounded-md py-1 text-[0.78rem]", s.taken ? "bg-line-2 text-ink-3 line-through" : "bg-brand-soft text-brand")}>{fmtTime(s.iso)}</span>)
                      : <span className="text-[0.85rem] text-ink-2">—</span>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Brak wolnych terminów w tym tygodniu" text="Napisz do mentora, żeby ustalić termin, albo sprawdź kolejny tydzień przy rezerwacji." />
            )}
          </section>
          <section>
            <h2 className={h2Class}>Opinie{m.reviewsCount ? ` (${m.reviewsCount})` : ""}</h2>
            {noReviews ? (
              <EmptyState title="Nowy mentor" text="Ten mentor nie ma jeszcze opinii. Zweryfikowaliśmy jego doświadczenie i tożsamość." />
            ) : (
              <>
                <div className="mb-3.5 grid max-w-[320px] gap-1">
                  {RATING_BREAKDOWN.map(([r, pct]) => (
                    <div key={r} className="flex items-center gap-2 text-[0.85rem]">
                      <span>{r}★</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-[3px] bg-line-2"><span className="block h-full bg-accent" style={{ width: `${pct}%` }} /></span>
                      <span className="text-ink-2">{pct}%</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {m.reviews.map((r) => (
                    <article key={`${r.author}-${r.date}`} className="border-b border-line-2 pb-3">
                      <div className="flex items-center justify-between"><strong>{r.author}</strong><span className="text-[0.85rem] text-ink-2">{fmtDate(r.date)}</span></div>
                      <div className="tracking-[2px] text-accent">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                      <p>{r.text}</p>
                      <TagList>{r.tags.map((t) => <Tag key={t} soft>{t}</Tag>)}</TagList>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
          {similar.length > 0 && (
            <section>
              <h2 className={h2Class}>Podobni mentorzy</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{similar.map((x) => <MentorMiniCard key={x.id} mentor={x} />)}</div>
            </section>
          )}
        </div>
        <aside className={cn(cardClass, "flex flex-col gap-2.5 min-[900px]:sticky min-[900px]:top-[76px]")}>
          <div><strong className="font-serif text-[1.35rem]">{money(m.rate60)}</strong><span className="text-ink-2"> / 60 min</span></div>
          <p className="text-[0.85rem] text-ink-2">Sesja próbna 30 min: <strong>{m.trialPrice ? money(m.trialPrice) : "bezpłatna"}</strong></p>
          {m.acceptingNew
            ? <Link className={buttonVariants({ block: true })} href={bookHref}>Zarezerwuj sesję próbną</Link>
            : <button type="button" className={buttonVariants({ block: true })} disabled>Nie przyjmuje nowych uczniów</button>}
          <Link className={buttonVariants({ variant: "ghost", block: true })} href={toUrl(`#/wiadomosci/nowa?m=${m.id}`)}>Napisz wiadomość</Link>
          <p className="mt-1 mb-0 flex gap-2 text-[0.82rem] text-ink-2"><Icon name="shield" className="text-ok" /> Jeśli sesja próbna nie spełni oczekiwań, zmienisz mentora za darmo albo odzyskasz pieniądze.</p>
        </aside>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-26 flex items-center justify-between border-t border-line bg-surface px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] md:hidden">
        <div><strong>{money(m.rate60)}</strong><span className="text-[0.85rem] text-ink-2"> / 60 min</span></div>
        {m.acceptingNew
          ? <Link className={buttonVariants()} href={bookHref}>Sesja próbna</Link>
          : <span className="inline-flex items-center rounded-full bg-line-2 px-[9px] py-0.5 text-[0.74rem] font-semibold text-ink-2">Nie przyjmuje nowych</span>}
      </div>
    </>
  );
}
