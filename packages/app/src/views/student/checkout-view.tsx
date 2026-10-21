"use client";

import { promoDiscount, trialCharge } from "@devmentor/core/domain";
import { cardCvc, cardExpiry, cardNumber, firstError, length, required, type Validator } from "@devmentor/core/validation";
import { buttonVariants } from "@devmentor/ui/frontend/button";
import { cardClass } from "@devmentor/ui/frontend/card";
import { TextareaField } from "@devmentor/ui/frontend/textarea-field";
import { FieldMeta, inputClass } from "@devmentor/ui/frontend/field";
import { Icon } from "@devmentor/ui/frontend/icon";
import { Notice } from "@devmentor/ui/frontend/notice";
import { Spinner } from "@devmentor/ui/frontend/spinner";
import { EmptyState, ErrorState } from "@devmentor/ui/frontend/state";
import { toast } from "@devmentor/ui/frontend/toast";
import { h2Class, smallMuted } from "@devmentor/ui/frontend/typography";
import { fmtDate, fmtDateLong, fmtTime, money } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { confirmBooking, expireHold, holdDraft } from "@/demo/actions";
import { mentorById } from "@/demo/store";
import { useDemoStore } from "@/demo/use-demo-store";
import { useForcedState } from "@/demo/use-view-state";
import { BackLink, MentorSummary, StepsBar } from "./common";

const METHODS = [["card", "Karta płatnicza"], ["blik", "BLIK"], ["p24", "Przelewy24"]] as const;
const linkButton = "cursor-pointer border-0 bg-transparent p-0 text-[0.85rem] font-semibold text-brand-2 hover:underline";

/** Pozostały czas blokady terminu (mm:ss), odświeżany co sekundę. */
function useCountdown(until: number | undefined): { label: string; expired: boolean } {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, (until ?? 0) - now);
  const label = `${String(Math.floor(left / 6e4)).padStart(2, "0")}:${String(Math.floor((left % 6e4) / 1000)).padStart(2, "0")}`;
  return { label, expired: left === 0 };
}

/** U2 — płatność za sesję próbną albo potwierdzenie rezerwacji z salda. */
export function CheckoutView({ mentorId }: { mentorId: string }) {
  const router = useRouter();
  const forced = useForcedState();
  const store = useDemoStore();
  const m = mentorById(mentorId);
  const d = store.draft;
  const ready = Boolean(m && d?.startsAt && d.mentorId === m.id);
  const [discount, setDiscount] = useState(0);
  const [method, setMethod] = useState<string>("card");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  // Po zapisie szkic znika ze stanu — do czasu przejścia na potwierdzenie pokazujemy stan „przetwarzanie”.
  const [bookedId, setBookedId] = useState<string | null>(null);
  const countdown = useCountdown(d?.holdExpires);

  // Wejście bez blokady (np. z mapy ekranów) — blokujemy termin na 10 minut.
  useEffect(() => { if (ready && !d?.holdExpires) holdDraft(); }, [ready, d?.holdExpires]);

  if (!m) return <ErrorState text="Nie znaleziono mentora." />;
  if (bookedId) return <div className="grid place-items-center py-16"><Spinner large /></div>;
  if (!ready || !d?.startsAt) {
    return (
      <div className="mx-auto max-w-[640px]">
        <EmptyState title="Nie wybrano terminu" text="Wróć do kalendarza mentora i wybierz termin." action={<Link className={buttonVariants()} href={`/rezerwacja/${m.id}`}>Wybierz termin</Link>} />
      </div>
    );
  }
  if (d.holdExpires && countdown.expired) {
    return (
      <div className="mx-auto max-w-[640px]">
        <EmptyState title="Blokada terminu wygasła" text={`Termin ${fmtDate(d.startsAt)}, ${fmtTime(d.startsAt)} mógł zostać zajęty. Wybierz go ponownie.`}
          action={<Link className={buttonVariants()} href={`/rezerwacja/${m.id}`}>Wróć do kalendarza</Link>} />
      </div>
    );
  }

  const isTrial = d.type === "trial";
  const charge = trialCharge(isTrial ? m.trialPrice : 0, discount);
  const payLabel = isTrial ? `Zapłać ${money(charge.total)}` : "Zarezerwuj";

  const applyPromo = (code: string) => {
    const off = promoDiscount(code, charge.price);
    if (off === null) { setErrors((e) => ({ ...e, promo: "Ten kod jest nieprawidłowy lub wygasł." })); return; }
    setDiscount(off);
    setErrors((e) => ({ ...e, promo: "" }));
    toast("Kod zastosowany: −10%");
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const rules: Record<string, Validator[]> = { goal: isTrial ? [required("Opisz krótko cel sesji."), length(20, 500)] : [length(0, 500)] };
    if (isTrial && method === "card") Object.assign(rules, { card: [cardNumber], exp: [cardExpiry], cvc: [cardCvc] });
    const next: Record<string, string> = {};
    for (const [name, list] of Object.entries(rules)) {
      const err = firstError(String(fd.get(name) ?? ""), list);
      if (err) next[name] = err;
    }
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) { e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(); return; }
    setBusy(true);
    const decline = fd.get("simDecline") === "on";
    const goal = String(fd.get("goal") ?? "");
    setTimeout(() => {
      if (decline) {
        setBusy(false);
        toast("Płatność odrzucona: bank odmówił autoryzacji. Spróbuj inną metodą.", "err");
        return;
      }
      const id = confirmBooking(m, goal);
      setBookedId(id);
      router.push(`/potwierdzenie/${id}`);
    }, 1100);
  };

  const cardField = (name: string, label: string, props: { placeholder: string; inputMode?: "numeric"; autoComplete?: string }) => (
    <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
      <label htmlFor={`f-${name}`} className="text-[0.88rem] font-semibold">{label}</label>
      <input id={`f-${name}`} name={name} {...props} aria-invalid={errors[name] ? true : undefined} className={inputClass} />
      <FieldMeta error={errors[name]} />
    </div>
  );

  return (
    <>
      <BackLink href={`/rezerwacja/${m.id}`}>Zmień termin</BackLink>
      <StepsBar step={2} payLabel={isTrial ? "Płatność" : "Potwierdzenie"} />
      {forced === "error" && <div className="mb-4"><Notice tone="err" role="alert">Płatność odrzucona przez bank: niewystarczające środki. Termin jest nadal zablokowany — spróbuj inną metodą.</Notice></div>}
      <form onSubmit={submit} noValidate className="grid gap-5 min-[900px]:grid-cols-[1fr_360px] min-[900px]:items-start">
        <section className={cn(cardClass, "space-y-3")}>
          <h1 className={h2Class}>{isTrial ? "Opłać sesję próbną" : "Potwierdź rezerwację z salda"}</h1>
          <TextareaField label={isTrial ? "Z czym przychodzisz? (mentor zobaczy to przed sesją)" : "Temat sesji (opcjonalnie)"} name="goal" rows={4} max={500} error={errors.goal}
            placeholder="np. Uczę się Reacta od pół roku, chcę wiedzieć, czy mój projekt nadaje się do portfolio i co poprawić." />
          {isTrial && (
            <>
              <fieldset className="grid gap-2">
                <legend className="mb-1.5 font-semibold">Metoda płatności</legend>
                {METHODS.map(([v, l]) => (
                  <label key={v} className="flex cursor-pointer items-center gap-2.5 rounded-field border border-line p-3 has-checked:border-brand has-checked:bg-brand-soft">
                    <input type="radio" name="method" value={v} checked={method === v} onChange={() => setMethod(v)} className="accent-brand" /> <span>{l}</span>
                  </label>
                ))}
              </fieldset>
              {method === "card" && (
                <div className="space-y-2.5 rounded-field border border-dashed border-line p-3" data-pay-embed>
                  {cardField("card", "Numer karty", { placeholder: "4242 4242 4242 4242", inputMode: "numeric", autoComplete: "cc-number" })}
                  <div className="flex gap-2">
                    {cardField("exp", "Ważna do", { placeholder: "MM/RR" })}
                    {cardField("cvc", "CVC", { placeholder: "123", inputMode: "numeric" })}
                  </div>
                  <p className={smallMuted}>Pola karty osadza operator płatności — nie przechowujemy danych karty.</p>
                </div>
              )}
              <div className="flex items-end gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
                  <label htmlFor="f-promo" className="text-[0.88rem] font-semibold">Kod rabatowy</label>
                  <input id="f-promo" name="promo" placeholder="np. KOMPAS10" className={inputClass} />
                  <FieldMeta error={errors.promo} />
                </div>
                <button type="button" data-promo className={buttonVariants({ variant: "ghost" })}
                  onClick={(e) => applyPromo((e.currentTarget.form?.elements.namedItem("promo") as HTMLInputElement).value)}>Zastosuj</button>
              </div>
              <label className="flex cursor-pointer items-start gap-2 text-[0.85rem]">
                <input type="checkbox" name="simDecline" className="mt-1 size-4 flex-none accent-brand" /> Mockup: symuluj odrzuconą płatność
              </label>
            </>
          )}
        </section>
        <aside className={cn(cardClass, "flex flex-col gap-3.5 min-[900px]:sticky min-[900px]:top-[76px]")}>
          <div className="flex items-center gap-1.5 rounded-field bg-warn-soft px-3 py-2 text-[0.85rem] text-warn" data-hold>
            <Icon name="cal" /> Termin zarezerwowany dla Ciebie przez <b data-countdown>{d.holdExpires ? countdown.label : "10:00"}</b>
          </div>
          <MentorSummary mentor={m}>{isTrial ? "Sesja próbna" : "Sesja z planu"} · {d.durationMin} min</MentorSummary>
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[0.92rem] [&_dd]:m-0 [&_dd]:text-right [&_dt]:text-ink-2">
            <dt>Termin</dt><dd>{fmtDateLong(d.startsAt)}, {fmtTime(d.startsAt)}</dd>
            {isTrial ? (
              <>
                <dt>Sesja</dt><dd>{money(charge.price)}</dd>
                <dt>Opłata serwisowa</dt><dd>{money(charge.fee)}</dd>
                {charge.discount > 0 && <><dt>Rabat</dt><dd data-disc>−{money(charge.discount)}</dd></>}
                <dt className="border-t border-line pt-2 font-bold">Razem</dt><dd className="border-t border-line pt-2 font-bold" data-total>{money(charge.total)}</dd>
              </>
            ) : <><dt>Saldo po rezerwacji</dt><dd>{(store.balances[m.id] ?? 0) - 1} sesji</dd></>}
          </dl>
          <button type="submit" className={buttonVariants({ block: true })} disabled={busy}>
            {busy ? <><Spinner /> Przetwarzamy płatność…</> : payLabel}
          </button>
          <p className="m-0 flex gap-2 text-[0.82rem] text-ink-2"><Icon name="shield" className="text-ok" /> Gwarancja sesji próbnej: zamiana mentora albo zwrot.</p>
          <button type="button" data-expire className={linkButton} onClick={expireHold}>Mockup: symuluj wygaśnięcie blokady</button>
        </aside>
      </form>
    </>
  );
}
