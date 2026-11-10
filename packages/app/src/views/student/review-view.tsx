"use client";

import { Avatar } from "@devmentor/ui/frontend/avatar";
import { buttonVariants } from "@devmentor/ui/frontend/button";
import { cardClass } from "@devmentor/ui/frontend/card";
import { chipVariants } from "@devmentor/ui/frontend/chip";
import { Notice } from "@devmentor/ui/frontend/notice";
import { ErrorState } from "@devmentor/ui/frontend/state";
import { TextareaField } from "@devmentor/ui/frontend/textarea-field";
import { toast } from "@devmentor/ui/frontend/toast";
import { h2Class, smallMuted } from "@devmentor/ui/frontend/typography";
import { fmtDateLong } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { submitReview } from "@/demo/actions";
import { mentorById, sessionById } from "@/demo/store";
import { useDemoStore } from "@/demo/use-demo-store";
import { useForcedState } from "@/demo/use-view-state";
import { firstName, typeLabel } from "./common";

const TAGS = ["konkretny/a", "dobrze przygotowany/a", "cierpliwy/a", "praktyczne przykłady", "jasne zadania"];

/** Błędy formularza oceny (ocena wymagana; opinia publiczna ≥ 20 znaków albo pusta; przy 1–2 ★ wymagany komentarz). */
function reviewErrors(rating: number, pub: string, priv: string): Record<string, string> {
  const e: Record<string, string> = {};
  if (!rating) e.rating = "Wybierz ocenę od 1 do 5.";
  if (pub.trim() && pub.trim().length < 20) e.public = "Opinia publiczna: minimum 20 znaków lub zostaw puste.";
  else if (rating > 0 && rating <= 2 && !pub.trim() && !priv.trim()) e.public = "Przy ocenie 1–2 napisz, co poszło nie tak (publicznie lub tylko do mentora).";
  return e;
}

/** U7 — ocena sesji (po sesji próbnej z wyborem „co dalej”). */
export function ReviewView({ id }: { id: string }) {
  useDemoStore();
  const router = useRouter();
  const forced = useForcedState();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const s = sessionById(id);
  if (!s) return <ErrorState text="Nie znaleziono sesji." />;
  const m = mentorById(s.mentorId)!;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = reviewErrors(rating, String(fd.get("public") ?? ""), String(fd.get("private") ?? ""));
    setErrors(next);
    if (Object.keys(next).length) return;
    submitReview(s);
    toast("Dziękujemy za ocenę!");
    const choice = fd.get("next");
    if (choice === "continue") router.push(`/plany?m=${m.id}`);
    else if (choice === "swap") { toast("Następna sesja próbna jest na nasz koszt"); router.push("/mentorzy"); }
    else router.push("/postepy");
  };

  const lit = hover || rating;
  return (
    <div className="mx-auto max-w-[640px] space-y-5">
      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar name={m.name} hue={m.hue} size={72} />
        <h1 className={h2Class}>Jak minęła sesja z {firstName(m.name)}?</h1>
        <span className={smallMuted}>{fmtDateLong(s.startsAt)} · {typeLabel(s)}</span>
      </div>
      {forced === "error" && <Notice tone="err" role="alert">Nie udało się zapisać oceny. Twoje odpowiedzi są zachowane — spróbuj ponownie.</Notice>}
      <form onSubmit={submit} noValidate className={cn(cardClass, "space-y-3")}>
        <fieldset className="flex flex-wrap justify-center gap-1" onMouseLeave={() => setHover(0)}>
          <legend className="mb-1.5 w-full text-center font-semibold">Ocena</legend>
          {[1, 2, 3, 4, 5].map((r) => (
            <label key={r} title={String(r)} onMouseEnter={() => setHover(r)}
              className={cn("cursor-pointer text-[2.3rem] leading-none has-focus-visible:rounded has-focus-visible:outline-2 has-focus-visible:outline-accent", r <= lit ? "text-accent" : "text-line")}>
              <input type="radio" name="rating" value={r} checked={rating === r} onChange={() => setRating(r)} className="absolute opacity-0" />★
            </label>
          ))}
        </fieldset>
        {errors.rating && <p className="m-0 text-[0.82rem] text-err" aria-live="polite">{errors.rating}</p>}
        <fieldset>
          <legend className="mb-1.5 text-[0.85rem] font-semibold">Co wyróżniało tę sesję? (opcjonalnie)</legend>
          <div className="my-3 flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <label key={t} className={cn(chipVariants(), "has-checked:border-brand has-checked:bg-brand-soft has-checked:text-brand")}>
                <input type="checkbox" name="tag" value={t} className="m-0 accent-brand" /> {t}
              </label>
            ))}
          </div>
        </fieldset>
        <TextareaField label="Opinia publiczna (widoczna na profilu)" name="public" rows={3} max={1000} error={errors.public} placeholder="Co pomogło Ci najbardziej?" />
        <TextareaField label="Uwaga tylko dla mentora (opcjonalnie)" name="private" rows={2} max={500} />
        {s.type === "trial" && (
          <fieldset className="grid gap-2">
            <legend className="mb-1.5 font-semibold">Co dalej?</legend>
            {[["continue", `Kontynuuję z ${firstName(m.name)}`, "Wybierzesz plan sesji tygodniowo."], ["swap", "Chcę spróbować z innym mentorem", "Kolejna sesja próbna na nasz koszt."]].map(([v, title, sub], i) => (
              <label key={v} className="flex cursor-pointer items-start gap-3 rounded-field border border-line p-3 has-checked:border-brand has-checked:bg-brand-soft">
                <input type="radio" name="next" value={v} defaultChecked={i === 0} className="mt-1 accent-brand" />
                <span><strong>{title}</strong><br /><span className={smallMuted}>{sub}</span></span>
              </label>
            ))}
          </fieldset>
        )}
        <button type="submit" className={buttonVariants({ block: true })}>Wyślij ocenę</button>
      </form>
    </div>
  );
}
