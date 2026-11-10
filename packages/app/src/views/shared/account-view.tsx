"use client";

import { email, firstError, length, required } from "@devmentor/core/validation";
import { Badge } from "@devmentor/ui/frontend/badge";
import { buttonVariants } from "@devmentor/ui/frontend/button";
import { cardClass } from "@devmentor/ui/frontend/card";
import { Field, inputClass } from "@devmentor/ui/frontend/field";
import { tableClass } from "@devmentor/ui/frontend/list";
import { Skeleton } from "@devmentor/ui/frontend/skeleton";
import { ErrorState } from "@devmentor/ui/frontend/state";
import { toast } from "@devmentor/ui/frontend/toast";
import { h1Class, h3Class } from "@devmentor/ui/frontend/typography";
import { cn } from "@devmentor/ui/lib/utils";
import { useState, type FormEvent } from "react";
import { useSetViewState, useViewState } from "@/demo/use-view-state";

const NOTIFICATION_PREFS = ["Przypomnienia o sesjach", "Wiadomości", "Zmiany w rezerwacjach", "Wskazówki i oferty"];

/** S3 — konto i ustawienia. */
export function AccountView() {
  const state = useViewState();
  const setState = useSetViewState();
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  if (state === "loading") return <Skeleton rows={3} />;
  if (state === "error") return <ErrorState text="Nie udało się wczytać ustawień konta." onRetry={() => setState("success")} />;

  const save = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = {
      name: firstError(String(fd.get("name") ?? ""), [required(), length(2, 50)]),
      email: firstError(String(fd.get("email") ?? ""), [required(), email]),
    };
    setErrors(next);
    if (!next.name && !next.email) toast("Zapisano");
  };
  const text = (name: string, label: string, value: string, type = "text") => (
    <Field label={label} htmlFor={`f-${name}`} error={errors[name]}>
      <input id={`f-${name}`} name={name} type={type} defaultValue={value} aria-invalid={errors[name] ? true : undefined} className={inputClass} />
    </Field>
  );
  const select = (id: string, label: string, options: string[]) => (
    <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
      <label htmlFor={id} className="text-[0.88rem] font-semibold">{label}</label>
      <select id={id} className={inputClass}>{options.map((o) => <option key={o}>{o}</option>)}</select>
    </div>
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h1 className={cn(h1Class, "m-0")}>Konto i ustawienia</h1></div>
      <div className="mx-auto max-w-[640px] space-y-5">
        <form onSubmit={save} noValidate className={cn(cardClass, "space-y-3")}>
          <h2 className={h3Class}>Profil</h2>
          {text("name", "Imię", "Adrian")}
          {text("email", "E-mail", "adrian@example.com", "email")}
          <div className="flex gap-2">{select("f-tz", "Strefa czasowa", ["Europe/Warsaw", "Europe/London"])}{select("f-cur", "Waluta", ["PLN", "EUR"])}</div>
          <button type="submit" className={buttonVariants()}>Zapisz</button>
        </form>
        <section className={cn(cardClass, "space-y-3")}>
          <h2 className={h3Class}>Metody płatności</h2>
          <div className="flex items-center justify-between"><span>Visa •••• 4242 · ważna do 10/26</span><Badge tone="err">wygasa</Badge></div>
          <button type="button" data-card className={buttonVariants({ variant: "ghost", size: "s" })} onClick={() => toast("Otwieramy bezpieczny formularz operatora płatności…")}>Dodaj kartę</button>
        </section>
        <section className={cn(cardClass, "space-y-3")}>
          <h2 className={h3Class}>Powiadomienia</h2>
          <table className={tableClass}>
            <thead><tr><th /><th>E-mail</th><th>Push</th></tr></thead>
            <tbody>
              {NOTIFICATION_PREFS.map((n, i) => (
                <tr key={n}>
                  <td>{n}</td>
                  <td><input type="checkbox" defaultChecked={i < 3} aria-label={`${n} e-mail`} /></td>
                  <td><input type="checkbox" defaultChecked={i < 2} aria-label={`${n} push`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className={cn(cardClass, "space-y-3")}>
          <h2 className={h3Class}>Prywatność</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" data-export className={buttonVariants({ variant: "ghost", size: "s" })} onClick={() => toast("Przygotujemy eksport i wyślemy link e-mailem (do 24 h)")}>Pobierz moje dane</button>
            <button type="button" data-del className={buttonVariants({ variant: "dangerGhost", size: "s" })} onClick={() => toast("Usunięcie wymaga potwierdzenia e-mailem. Aktywny plan zostanie anulowany.", "err")}>Usuń konto</button>
          </div>
        </section>
      </div>
    </>
  );
}
