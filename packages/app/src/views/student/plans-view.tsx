"use client";

import { PLAN_OPTIONS, planPrice, transferSessions, type Mentor } from "@devmentor/core/domain";
import { MENTORS } from "@devmentor/db/fixtures";
import { Avatar } from "@devmentor/ui/frontend/avatar";
import { Badge } from "@devmentor/ui/frontend/badge";
import { buttonVariants } from "@devmentor/ui/frontend/button";
import { cardClass } from "@devmentor/ui/frontend/card";
import { Field, inputClass } from "@devmentor/ui/frontend/field";
import { Icon } from "@devmentor/ui/frontend/icon";
import { tableClass } from "@devmentor/ui/frontend/list";
import { Modal } from "@devmentor/ui/frontend/modal";
import { Notice } from "@devmentor/ui/frontend/notice";
import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import { Spinner } from "@devmentor/ui/frontend/spinner";
import { EmptyState } from "@devmentor/ui/frontend/state";
import { toast } from "@devmentor/ui/frontend/toast";
import { h1Class, h2Class, h3Class, smallMuted } from "@devmentor/ui/frontend/typography";
import { fmtDateLong, money } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { buyPlan, cancelPlan, togglePlanPause, transferBalance } from "@/demo/actions";
import { mentorById } from "@/demo/store";
import { useDemoStore } from "@/demo/use-demo-store";
import { useViewState } from "@/demo/use-view-state";
import { BackLink, firstName } from "./common";

const linkButton = "cursor-pointer border-0 bg-transparent p-0 text-[0.85rem] font-semibold text-brand-2 hover:underline";
const PAYMENTS = [["6 paź", "Plan 1×60 min · Kasia Nowicka", 720], ["9 paź", "Sesja próbna · Kasia Nowicka", 52], ["18 paź", "Sesja próbna · Ewa Sadowska", 52]] as const;

/** U8 — plany i saldo; `?m=` — wybór planu u mentora. */
export function PlansView() {
  const pickFor = useSearchParams().get("m");
  const pm = pickFor ? mentorById(pickFor) : undefined;
  return pm ? <PlanPicker mentor={pm} /> : <PlansOverview />;
}

function PlanPicker({ mentor: pm }: { mentor: Mentor }) {
  const router = useRouter();
  const [dur, setDur] = useState(60);
  const [per, setPer] = useState(PLAN_OPTIONS[0]!);
  const [busy, setBusy] = useState(false);
  const pay = () => {
    setBusy(true);
    setTimeout(() => {
      buyPlan(pm.id, per, dur);
      toast(`Plan aktywny. Dodano ${per * 4} sesji do salda.`);
      router.push(`/rezerwacja/${pm.id}`);
    }, 900);
  };
  return (
    <>
      <BackLink href="/sesje">Moje sesje</BackLink>
      <div className="mx-auto max-w-[640px] space-y-5">
        <div className="flex items-center gap-2">
          <Avatar name={pm.name} hue={pm.hue} size={56} />
          <div><h1 className={h2Class}>Wybierz plan z {firstName(pm.name)}</h1><span className={smallMuted}>Rozliczenie co 4 tygodnie · zmiana lub anulowanie w dowolnym momencie</span></div>
        </div>
        <form className={cn(cardClass, "space-y-3")} onSubmit={(e) => { e.preventDefault(); pay(); }}>
          <div className="inline-flex flex-wrap gap-0.5 rounded-full border border-line bg-surface p-[3px]" role="radiogroup" aria-label="Długość sesji">
            {[60, 30].map((d) => (
              <label key={d} className="flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.9rem] has-checked:bg-brand has-checked:text-white">
                <input type="radio" name="dur" value={d} checked={dur === d} onChange={() => setDur(d)} className="pointer-events-none absolute opacity-0" /> {d} min
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {PLAN_OPTIONS.map((n) => (
              <label key={n} className="flex cursor-pointer items-start gap-3 rounded-field border border-line p-3 has-checked:border-brand has-checked:bg-brand-soft">
                <input type="radio" name="per" value={n} checked={per === n} onChange={() => setPer(n)} className="mt-1 accent-brand" />
                <span>
                  <strong>{n}×</strong> w tygodniu<br />
                  <span className={smallMuted} data-price={n}>{money(planPrice(pm.rate60, n, dur))} / 4 tyg.</span>
                  {n === 2 && <Badge tone="accent" className="mt-1.5">najczęściej wybierany</Badge>}
                </span>
              </label>
            ))}
          </div>
          <p className={smallMuted}>Opłacone sesje trafiają do salda. Nie wykorzystałeś sesji? Zostają w saldzie, a plan możesz zmniejszyć od kolejnego okresu.</p>
          <button type="submit" data-plan-pay className={buttonVariants({ block: true })} disabled={busy}>
            {busy ? <><Spinner /> Przetwarzamy…</> : `Opłać plan · ${money(planPrice(pm.rate60, per, dur))}`}
          </button>
        </form>
      </div>
    </>
  );
}

type Dialog = { kind: "cancel" } | { kind: "transfer"; fromId: string } | null;

function PlansOverview() {
  const store = useDemoStore();
  const state = useViewState();
  const [dialog, setDialog] = useState<Dialog>(null);
  const sub = state === "empty" ? null : store.subscription;
  const sm = sub ? mentorById(sub.mentorId)! : null;
  const close = () => setDialog(null);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h1 className={cn(h1Class, "m-0")}>Plany i saldo</h1></div>
      {state === "error" && (
        <div className="mb-4">
          <Notice tone="err" role="alert">
            <Icon name="alert" /> Nie udało się odnowić planu — karta wygasła. Zaktualizuj metodę płatności do 27 października, inaczej plan zostanie wstrzymany. Twoje saldo pozostaje.{" "}
            <Link className="font-semibold text-brand-2" href="/konto">Zaktualizuj</Link>
          </Notice>
        </div>
      )}
      {state === "loading" ? <Skeleton rows={3} /> : (
        <div className="space-y-5">
          {sub && sm ? (
            <section className={cn(cardClass, "space-y-3")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar name={sm.name} hue={sm.hue} size={48} />
                  <div><strong>{sm.name}</strong><br /><span className={smallMuted}>{sub.perWeek}× {sub.durationMin} min tygodniowo · {money(planPrice(sm.rate60, sub.perWeek, sub.durationMin))} / 4 tyg.</span></div>
                </div>
                <Badge tone={sub.status === "active" ? "brand" : "err"}>{sub.status === "active" ? "Aktywny" : "Wstrzymany"}</Badge>
              </div>
              <p className="text-[0.85rem]">{sub.status === "active" ? <>Następne odnowienie: <strong>{fmtDateLong(sub.renewsOn)}</strong></> : "Plan wstrzymany — nie pobieramy opłat, saldo zostaje."}</p>
              <div className="flex flex-wrap gap-2">
                <Link className={buttonVariants({ variant: "ghost", size: "s" })} href={`/plany?m=${sm.id}`}>Zmień plan</Link>
                <button type="button" data-pause className={buttonVariants({ variant: "ghost", size: "s" })}
                  onClick={() => { togglePlanPause(); toast(store.subscription?.status === "paused" ? "Plan wstrzymany" : "Plan wznowiony"); }}>
                  {sub.status === "active" ? "Wstrzymaj" : "Wznów"}
                </button>
                <button type="button" data-cancel-sub className={buttonVariants({ variant: "dangerGhost", size: "s" })} onClick={() => setDialog({ kind: "cancel" })}>Anuluj plan</button>
              </div>
            </section>
          ) : (
            <EmptyState title="Nie masz aktywnego planu" text="Plan dobierzesz po sesji próbnej z wybranym mentorem." action={<Link className={buttonVariants()} href="/mentorzy">Znajdź mentora</Link>} />
          )}
          <section className={cardClass}>
            <h2 className={h3Class}>Saldo sesji</h2>
            <table className={tableClass}>
              <thead><tr><th>Mentor</th><th>Sesje</th><th /></tr></thead>
              <tbody>
                {Object.entries(store.balances).map(([id, n]) => (
                  <tr key={id}>
                    <td>{mentorById(id)!.name}</td><td>{n}</td>
                    <td className="text-right">{n > 0 && <button type="button" data-transfer={id} className={linkButton} onClick={() => setDialog({ kind: "transfer", fromId: id })}>Przenieś do innego mentora</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className={cardClass}>
            <h2 className={h3Class}>Historia płatności</h2>
            <table className={tableClass}>
              <thead><tr><th>Data</th><th>Opis</th><th className="text-right">Kwota</th><th /></tr></thead>
              <tbody>
                {PAYMENTS.map(([date, desc, amount]) => (
                  <tr key={desc + date}>
                    <td>{date}</td><td>{desc}</td><td className="text-right">{money(amount)}</td>
                    <td className="text-right"><button type="button" data-inv className={linkButton} onClick={() => toast("Pobieranie faktury PDF…")}>Faktura</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
      {dialog?.kind === "cancel" && store.subscription && (
        <Modal onClose={close} label="Anulować plan?">
          <h2 className={h3Class}>Anulować plan?</h2>
          <p>Plan nie odnowi się {fmtDateLong(store.subscription.renewsOn)}. Sesje w saldzie ({store.balances[store.subscription.mentorId]}) możesz wykorzystać do końca okresu.</p>
          <div className="flex justify-end gap-2">
            <button type="button" className={buttonVariants({ variant: "ghost" })} onClick={close}>Zostaw plan</button>
            <button type="button" data-ok className={buttonVariants({ variant: "danger" })} onClick={() => { cancelPlan(); close(); toast("Plan anulowany"); }}>Anuluj plan</button>
          </div>
        </Modal>
      )}
      {dialog?.kind === "transfer" && <TransferDialog fromId={dialog.fromId} onClose={close} />}
    </>
  );
}

function TransferDialog({ fromId, onClose }: { fromId: string; onClose: () => void }) {
  const store = useDemoStore();
  const from = mentorById(fromId)!;
  const n = store.balances[from.id] ?? 0;
  const others = MENTORS.filter((x) => x.id !== from.id && x.acceptingNew);
  const [toId, setToId] = useState(others[0]?.id ?? "");
  const to = mentorById(toId);
  return (
    <Modal onClose={onClose} label="Przenieś saldo">
      <h2 className={h3Class}>Przenieś saldo</h2>
      <p className={smallMuted}>Wartość sesji przeliczamy według stawki nowego mentora.</p>
      <Field label="Do mentora" htmlFor="f-to">
        <select id="f-to" value={toId} onChange={(e) => setToId(e.target.value)} className={inputClass}>
          {others.map((o) => <option key={o.id} value={o.id}>{o.name} · {money(o.rate60)}/h</option>)}
        </select>
      </Field>
      {to && <Notice>{n} {n === 1 ? "sesja" : "sesje"} u {from.name} ({money(from.rate60)}/h) → {transferSessions(n, from.rate60, to.rate60)} u {to.name} ({money(to.rate60)}/h)</Notice>}
      <div className="flex justify-end gap-2">
        <button type="button" className={buttonVariants({ variant: "ghost" })} onClick={onClose}>Anuluj</button>
        <button type="button" data-ok className={buttonVariants()} onClick={() => { transferBalance(from.id, toId); onClose(); toast("Saldo przeniesione"); }}>Przenieś</button>
      </div>
    </Modal>
  );
}
