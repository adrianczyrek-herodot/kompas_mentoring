"use client";

import { firstError, length, required } from "@devmentor/core/validation";
import { DEMO_NOW } from "@devmentor/db/fixtures";
import { buttonVariants } from "@devmentor/ui/frontend/button";
import { cardClass } from "@devmentor/ui/frontend/card";
import { Field, inputClass } from "@devmentor/ui/frontend/field";
import { Icon } from "@devmentor/ui/frontend/icon";
import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import { EmptyState, ErrorState } from "@devmentor/ui/frontend/state";
import { toast } from "@devmentor/ui/frontend/toast";
import { h1Class, h3Class, smallMuted } from "@devmentor/ui/frontend/typography";
import { fmtDate, fmtDateLong } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { setActionItem, setMilestone } from "@/demo/actions";
import { mentorById } from "@/demo/store";
import { useDemoStore } from "@/demo/use-demo-store";
import { useSetViewState, useViewState } from "@/demo/use-view-state";
import { TodoItem } from "./common";

/** U9 — postępy: cel z kamieniami milowymi, zadania od mentorów, notatki z sesji. */
export function ProgressView() {
  const store = useDemoStore();
  const state = useViewState();
  const setState = useSetViewState();
  const g = store.goal;
  const done = store.sessions.filter((s) => s.note);
  const items = done.flatMap((s) => (s.actionItems ?? []).map((a, i) => ({ s, a, i })));
  const pct = Math.round((g.milestones.filter((x) => x.done).length / g.milestones.length) * 100);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h1 className={cn(h1Class, "m-0")}>Postępy</h1></div>
      {state === "loading" && <Skeleton rows={3} />}
      {state === "error" && <ErrorState text="Nie udało się wczytać postępów." onRetry={() => setState("success")} />}
      {state === "empty" && <GoalForm />}
      {state === "success" && (
        <>
          <section className={cardClass}>
            <span className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-brand-2 uppercase"><Icon name="target" /> Mój cel</span>
            <h2 className="mb-[0.4em] font-serif text-2xl font-semibold leading-tight">{g.text}</h2>
            <p className={smallMuted}>Termin: {fmtDateLong(g.target)}</p>
            <div className="my-2.5 h-2 overflow-hidden rounded bg-line-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <span className="block h-full rounded bg-[linear-gradient(90deg,var(--color-brand-2),var(--color-accent))]" style={{ width: `${pct}%` }} />
            </div>
            <ul className="m-0 grid list-none gap-2 p-0">
              {g.milestones.map((x, i) => <TodoItem key={x.text} checked={x.done} onChange={(v) => setMilestone(i, v)}>{x.text}</TodoItem>)}
            </ul>
          </section>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <section className={cardClass}>
              <h2 className={h3Class}>Zadania od mentorów</h2>
              {items.length ? (
                <ul className="m-0 grid list-none gap-2 p-0">
                  {items.map(({ s, a, i }) => (
                    <TodoItem key={`${s.id}-${i}`} checked={a.done} onChange={(v) => setActionItem(s, i, v)} aside={<span className={smallMuted}> · {fmtDate(s.startsAt)}</span>}>{a.text}</TodoItem>
                  ))}
                </ul>
              ) : <p className="text-ink-2">Brak zadań.</p>}
            </section>
            <section className={cardClass}>
              <h2 className={h3Class}>Notatki z sesji</h2>
              <ol className="m-0 grid list-none gap-3.5 border-l-2 border-line p-0">
                {[...done].sort((a, b) => b.startsAt.localeCompare(a.startsAt)).map((s) => (
                  <li key={s.id} className="relative pl-3.5 before:absolute before:top-1.5 before:-left-1.5 before:size-2.5 before:rounded-full before:bg-brand-2">
                    <Link href={`/sesje/${s.id}`} className="no-underline"><strong>{fmtDate(s.startsAt)}</strong> · {mentorById(s.mentorId)!.name}</Link>
                    <p className="text-[0.85rem]">{s.note}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </>
      )}
    </>
  );
}

function GoalForm() {
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const target = String(fd.get("target") ?? "");
    const next = {
      goal: firstError(String(fd.get("goal") ?? ""), [required(), length(10, 200)]),
      target: firstError(target, [required("Podaj termin."), (v) => (new Date(v) > DEMO_NOW ? null : "Termin musi być w przyszłości.")]),
    };
    setErrors(next);
    if (!next.goal && !next.target) toast("Cel zapisany");
  };
  return (
    <section className={cn(cardClass, "space-y-3")}>
      <EmptyState title="Ustal swój cel" text="Cel pomaga mentorowi zaplanować sesje. Zwykle ustalacie go razem na sesji próbnej." />
      <form onSubmit={submit} noValidate className="space-y-3">
        <Field label="Mój cel" htmlFor="f-goal" error={errors.goal}>
          <input id="f-goal" name="goal" placeholder="np. Pierwsza praca jako frontend developer" aria-invalid={errors.goal ? true : undefined} className={inputClass} />
        </Field>
        <Field label="Termin" htmlFor="f-target" error={errors.target}>
          <input id="f-target" name="target" type="date" aria-invalid={errors.target ? true : undefined} className={inputClass} />
        </Field>
        <button type="submit" className={buttonVariants()}>Zapisz cel</button>
      </form>
    </section>
  );
}
