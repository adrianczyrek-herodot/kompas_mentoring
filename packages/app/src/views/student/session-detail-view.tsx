"use client";

import { FREE_CANCEL_HOURS, canJoin, canReportProblem, cancellationPolicy, isUpcomingStatus, weekSlots, type Mentor, type Session } from "@devmentor/core/domain";
import { firstError, length, required } from "@devmentor/core/validation";
import { DEMO_NOW } from "@devmentor/db/fixtures";
import { Avatar } from "@devmentor/ui/frontend/avatar";
import { Badge } from "@devmentor/ui/frontend/badge";
import { buttonVariants } from "@devmentor/ui/frontend/button";
import { cardClass } from "@devmentor/ui/frontend/card";
import { TextareaField } from "@devmentor/ui/frontend/textarea-field";
import { Field, inputClass } from "@devmentor/ui/frontend/field";
import { Icon } from "@devmentor/ui/frontend/icon";
import { Modal } from "@devmentor/ui/frontend/modal";
import { Notice } from "@devmentor/ui/frontend/notice";
import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import { EmptyState, ErrorState } from "@devmentor/ui/frontend/state";
import { toast } from "@devmentor/ui/frontend/toast";
import { h2Class, h3Class, h4Class, smallMuted } from "@devmentor/ui/frontend/typography";
import { fmtDate, fmtDateLong, fmtTime } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { cancelSession, reportProblem, rescheduleSession, setActionItem } from "@/demo/actions";
import { toUrl } from "@/demo/navigation";
import { mentorById, sessionById } from "@/demo/store";
import { useDemoStore } from "@/demo/use-demo-store";
import { useSetViewState, useViewState } from "@/demo/use-view-state";
import { BackLink, STATUS_LABEL, STATUS_TONE, TodoItem, firstName, typeLabel } from "./common";

type Dialog = "cancel" | "reschedule" | "report" | null;

/** U5 — szczegóły sesji: przełożenie, anulowanie, notatka i zadania, zgłoszenie problemu. */
export function SessionDetailView({ id }: { id: string }) {
  useDemoStore();
  const state = useViewState();
  const setState = useSetViewState();
  const [dialog, setDialog] = useState<Dialog>(null);
  const s = sessionById(id);

  if (state === "loading") return <Skeleton rows={3} />;
  if (!s || state === "error") {
    return <div className="mx-auto max-w-[640px]"><ErrorState text="Ta sesja nie istnieje albo nie masz do niej dostępu." onRetry={() => setState("success")} /></div>;
  }
  const m = mentorById(s.mentorId)!;
  const upcoming = isUpcomingStatus(s);
  const { started, free, canReschedule } = cancellationPolicy(s, DEMO_NOW);
  const close = () => setDialog(null);

  return (
    <>
      <BackLink href="/sesje">Moje sesje</BackLink>
      <div className="mx-auto max-w-[640px] space-y-5">
        <section className={cn(cardClass, "space-y-3")}>
          <div className="flex flex-wrap items-center justify-between gap-2"><Badge tone={STATUS_TONE[s.status]}>{STATUS_LABEL[s.status]}</Badge><span className={smallMuted}>{typeLabel(s)}</span></div>
          <div className="flex items-center gap-2">
            <Avatar name={m.name} hue={m.hue} size={56} />
            <div><h1 className={h2Class}>{m.name}</h1><span className="text-ink-2">{fmtDateLong(s.startsAt)} · {fmtTime(s.startsAt)} · {s.durationMin} min</span></div>
          </div>
          <p><Icon name="target" /> <strong>Cel:</strong> {s.goal}</p>
          {upcoming && (
            <>
              <Notice tone={free ? "info" : "warn"}>
                {free ? `Możesz bezpłatnie przełożyć lub anulować sesję do ${FREE_CANCEL_HOURS} h przed startem.`
                  : started ? "Sesja już się rozpoczęła — przełożenie i anulowanie nie są możliwe."
                    : `Do sesji zostało mniej niż ${FREE_CANCEL_HOURS} h. Anulowanie teraz oznacza utratę sesji.`}
              </Notice>
              <div className="flex flex-wrap gap-2">
                {canJoin(s, DEMO_NOW) && <Link className={buttonVariants()} href={`/sesje/${s.id}/pokoj`}><Icon name="cam" /> Dołącz</Link>}
                <button type="button" data-reschedule className={buttonVariants({ variant: "ghost" })} disabled={!canReschedule} onClick={() => setDialog("reschedule")}>Przełóż</button>
                <button type="button" data-cancel className={buttonVariants({ variant: "dangerGhost" })} disabled={started} onClick={() => setDialog("cancel")}>Anuluj sesję</button>
                <Link className={buttonVariants({ variant: "ghost" })} href={toUrl(`#/wiadomosci/nowa?m=${m.id}`)}>Napisz</Link>
              </div>
            </>
          )}
          {s.status === "completed" && !s.reviewed && <Link className={buttonVariants()} href={`/sesje/${s.id}/ocena`}>Oceń sesję</Link>}
        </section>
        {s.note ? (
          <section className={cn(cardClass, "space-y-3")}>
            <h2 className={h3Class}>Notatka mentora</h2>
            <p>{s.note}</p>
            {s.actionItems?.length ? (
              <>
                <h3 className={h4Class}>Zadania</h3>
                <ul className="m-0 grid list-none gap-2 p-0">
                  {s.actionItems.map((a, i) => (
                    <TodoItem key={a.text} checked={a.done} onChange={(done) => { setActionItem(s, i, done); toast(done ? "Zadanie wykonane" : "Zadanie otwarte"); }}>{a.text}</TodoItem>
                  ))}
                </ul>
              </>
            ) : null}
          </section>
        ) : s.status === "completed" ? (
          <section className={cardClass}><EmptyState title="Brak notatki" text="Mentor zwykle dodaje notatkę do 24 h po sesji." /></section>
        ) : null}
        {s.status === "completed" && (
          <section className={cardClass}>
            <h2 className={h3Class}>Coś poszło nie tak?</h2>
            {canReportProblem(s, DEMO_NOW) ? (
              <>
                <p className={smallMuted}>Możesz zgłosić problem do 72 h po sesji.</p>
                <button type="button" data-report className={buttonVariants({ variant: "ghost" })} onClick={() => setDialog("report")}><Icon name="flag" /> Zgłoś problem</button>
              </>
            ) : <p className={smallMuted}>Termin zgłoszenia problemu (72 h po sesji) minął. W razie wątpliwości napisz do pomocy.</p>}
          </section>
        )}
      </div>
      {dialog === "cancel" && <CancelDialog s={s} m={m} free={free} onClose={close} />}
      {dialog === "reschedule" && <RescheduleDialog s={s} m={m} onClose={close} />}
      {dialog === "report" && <ReportDialog s={s} onClose={close} />}
    </>
  );
}

function CancelDialog({ s, m, free, onClose }: { s: Session; m: Mentor; free: boolean; onClose: () => void }) {
  const confirm = () => {
    cancelSession(s, DEMO_NOW);
    onClose();
    toast(free ? "Sesja anulowana, wróciła do salda" : "Sesja anulowana");
  };
  return (
    <Modal onClose={onClose} label="Anulować sesję?">
      <h2 className={h3Class}>Anulować sesję?</h2>
      <p>{free ? `Sesja wróci do salda u ${firstName(m.name)}${s.type === "trial" ? " — za sesję próbną zwrócimy pieniądze" : ""}.`
        : <><strong>Do sesji zostało mniej niż {FREE_CANCEL_HOURS} h.</strong> Sesja przepadnie i nie wróci do salda.</>}</p>
      <Field label="Powód (opcjonalnie, widzi mentor)" htmlFor="f-why">
        <select id="f-why" className={inputClass}><option>Zmiana planów</option><option>Choroba</option><option>Inny</option></select>
      </Field>
      <div className="flex justify-end gap-2">
        <button type="button" className={buttonVariants({ variant: "ghost" })} onClick={onClose}>Nie anuluj</button>
        <button type="button" data-confirm className={buttonVariants({ variant: "danger" })} onClick={confirm}>{free ? "Anuluj sesję" : "Anuluj mimo to"}</button>
      </div>
    </Modal>
  );
}

function RescheduleDialog({ s, m, onClose }: { s: Session; m: Mentor; onClose: () => void }) {
  const slots = [...weekSlots(m, 0, DEMO_NOW), ...weekSlots(m, 1, DEMO_NOW)].flatMap((d) => d.slots).filter((x) => !x.taken).slice(0, 12);
  const pick = (iso: string) => {
    rescheduleSession(s, iso);
    onClose();
    toast(`Przełożono na ${fmtDate(iso)}, ${fmtTime(iso)}. Mentor został powiadomiony.`);
  };
  return (
    <Modal onClose={onClose} label="Wybierz nowy termin">
      <h2 className={h3Class}>Wybierz nowy termin</h2>
      {slots.length ? (
        <div className="grid grid-cols-2 gap-2">
          {slots.map((x) => (
            <button key={x.iso} type="button" data-new={x.iso} onClick={() => pick(x.iso)}
              className="cursor-pointer rounded-lg border border-brand-soft bg-brand-soft px-0.5 py-[9px] text-[0.82rem] font-semibold text-brand hover:border-brand">
              {fmtDate(x.iso)} · {fmtTime(x.iso)}
            </button>
          ))}
        </div>
      ) : (
        <EmptyState title="Brak wolnych terminów w 14 dni" text="Napisz do mentora, żeby ustalić termin." action={<Link className={buttonVariants()} href={toUrl(`#/wiadomosci/nowa?m=${m.id}`)}>Napisz</Link>} />
      )}
    </Modal>
  );
}

function ReportDialog({ s, onClose }: { s: Session; onClose: () => void }) {
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = {
      reason: firstError(String(fd.get("reason") ?? ""), [required("Wybierz powód.")]),
      desc: firstError(String(fd.get("desc") ?? ""), [required(), length(30, 1000)]),
    };
    setErrors(next);
    if (next.reason || next.desc) return;
    reportProblem(s);
    onClose();
    toast("Zgłoszenie wysłane. Odpowiemy w ciągu 2 dni roboczych.");
  };
  return (
    <Modal onClose={onClose} label="Zgłoś problem z sesją">
      <h2 className={h3Class}>Zgłoś problem z sesją</h2>
      <form onSubmit={submit} noValidate className="space-y-3">
        <Field label="Powód" htmlFor="f-reason" error={errors.reason}>
          <select id="f-reason" name="reason" aria-invalid={errors.reason ? true : undefined} className={inputClass}>
            <option value="">Wybierz…</option>
            <option>Mentor się nie pojawił</option><option>Problemy techniczne</option><option>Sesja niezgodna z opisem</option><option>Niewłaściwe zachowanie</option>
          </select>
        </Field>
        <TextareaField label="Opisz, co się stało" name="desc" rows={4} max={1000} error={errors.desc} />
        <p className={smallMuted}>Druga strona ma 48 h na odpowiedź. Decyzję podejmie zespół Kompasu.</p>
        <div className="flex justify-end gap-2">
          <button type="button" className={buttonVariants({ variant: "ghost" })} onClick={onClose}>Anuluj</button>
          <button type="submit" className={buttonVariants()}>Wyślij zgłoszenie</button>
        </div>
      </form>
    </Modal>
  );
}
