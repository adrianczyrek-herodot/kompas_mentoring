"use client";

import { email, firstError, length, required, type Validator } from "@devmentor/core/validation";
import { Button, buttonVariants } from "@devmentor/ui/frontend/button";
import { Field, inputClass } from "@devmentor/ui/frontend/field";
import { Icon } from "@devmentor/ui/frontend/icon";
import { Notice } from "@devmentor/ui/frontend/notice";
import { toast } from "@devmentor/ui/frontend/toast";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { toUrl } from "@/demo/navigation";
import { applyDemoStudent, applyFreshStudent, notify, store } from "@/demo/store";
import { useForcedState } from "@/demo/use-view-state";

type Mode = "login" | "register";
type Errors = Partial<Record<string, ReactNode>>;

const RULES: Record<Mode, Record<string, Validator[]>> = {
  register: { name: [required(), length(2, 50)], email: [required(), email], password: [required(), length(10, 128)], terms: [required("Akceptacja regulaminu jest wymagana.")] },
  login: { email: [required(), email], password: [required()] },
};

const tabClass = (on: boolean) =>
  cn("-mb-px border-b-2 px-3.5 py-2.5 font-semibold whitespace-nowrap no-underline", on ? "border-brand text-brand" : "border-transparent text-ink-2");

/** P4 — logowanie i rejestracja (`/logowanie`, `/rejestracja`, `?jako=mentor`). */
export function AuthView({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const forced = useForcedState();
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const asMentor = params.get("jako") === "mentor";
  const qs = params.toString() ? `?${params}` : "";
  const submitLabel = mode === "register" ? "Załóż konto" : "Zaloguj się";

  const finish = (role: "student" | "mentor", fresh: boolean) => {
    if (fresh) applyFreshStudent(); else applyDemoStudent();
    store.loggedIn = true;
    store.role = role;
    const back = store.returnTo;
    store.returnTo = "";
    notify();
    toast("Zalogowano");
    router.push(toUrl(back || (role === "mentor" ? "#/mentor/onboarding/1" : "#/sesje")));
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const fd = new FormData(f);
    const next: Errors = {};
    for (const [name, rules] of Object.entries(RULES[mode])) {
      const err = firstError(fd.get(name) ? String(fd.get(name)) : "", rules);
      if (err) next[name] = err;
    }
    setErrors(next);
    const firstInvalid = Object.keys(next)[0];
    if (firstInvalid) { f.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus(); return; }
    const mail = String(fd.get("email")).trim();
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (mail === "zajety@kompas.pl") {
        setErrors({ email: mode === "register"
          ? <>To konto już istnieje. <Link className="font-semibold text-brand-2" href="/logowanie">Zaloguj się</Link></>
          : "Nieprawidłowy e-mail lub hasło." });
        return;
      }
      finish(mode === "register" ? (fd.get("as") as "student" | "mentor") : "student", mode === "register");
    }, 500);
  };

  const input = (name: string, label: string, props: { type?: string; placeholder?: string; autoComplete?: string; hint?: string }) => (
    <Field label={label} htmlFor={`f-${name}`} error={errors[name]} hint={props.hint}>
      <input id={`f-${name}`} name={name} type={props.type ?? "text"} placeholder={props.placeholder} autoComplete={props.autoComplete}
        aria-invalid={errors[name] ? true : undefined} className={inputClass} />
    </Field>
  );

  return (
    <div className="mx-auto mt-3 max-w-[640px] rounded-card border border-line bg-surface p-[18px] shadow-card">
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-line" role="tablist">
        <Link role="tab" className={tabClass(mode === "login")} href={`/logowanie${qs}`}>Logowanie</Link>
        <Link role="tab" className={tabClass(mode === "register")} href={`/rejestracja${qs}`}>Rejestracja</Link>
      </div>
      <div className="space-y-3">
        {store.returnTo.startsWith("#/rezerwacja") && (
          <Notice><Icon name="cal" /> Twój wybrany termin jest zachowany — po zalogowaniu wrócisz do płatności.</Notice>
        )}
        {forced === "error" && <Notice tone="err" role="alert">Za dużo nieudanych prób. Spróbuj ponownie za 5 minut.</Notice>}
        <Button variant="social" data-social onClick={() => finish("student", false)}>Kontynuuj z Google</Button>
        <Button variant="social" data-social onClick={() => finish("student", false)}>Kontynuuj z LinkedIn</Button>
      </div>
      <div className="my-4 flex items-center gap-2.5 text-[0.8rem] text-ink-3 before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line"><span>lub e-mailem</span></div>
      <form onSubmit={submit} noValidate className="space-y-3" key={mode}>
        {mode === "register" && input("name", "Imię", { placeholder: "np. Adrian" })}
        {input("email", "E-mail", { type: "email", placeholder: "ty@firma.pl", autoComplete: "email" })}
        {input("password", "Hasło", { type: "password", autoComplete: "current-password", hint: mode === "register" ? "Min. 10 znaków" : undefined })}
        {mode === "register" ? (
          <>
            <fieldset className="inline-flex flex-wrap gap-0.5 rounded-full border border-line bg-surface p-[3px]">
              <legend className="mb-1.5 w-full px-2.5 pt-1 pb-0.5 text-[0.8rem] font-semibold text-ink-2">Chcę</legend>
              {[["student", "się uczyć"], ["mentor", "mentorować"]].map(([v, l]) => (
                <label key={v} className="flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.9rem] has-checked:bg-brand has-checked:text-white has-focus-visible:outline-3 has-focus-visible:outline-accent">
                  <input type="radio" name="as" value={v} defaultChecked={asMentor ? v === "mentor" : v === "student"} className="pointer-events-none absolute opacity-0" /> {l}
                </label>
              ))}
            </fieldset>
            <label className="flex cursor-pointer items-start gap-2">
              <input type="checkbox" name="terms" aria-invalid={errors.terms ? true : undefined} className="mt-1 size-4 flex-none accent-brand" /> Akceptuję regulamin i politykę prywatności
            </label>
            {errors.terms && <p className="m-0 text-[0.82rem] text-err" aria-live="polite">{errors.terms}</p>}
            <label className="flex cursor-pointer items-start gap-2">
              <input type="checkbox" name="marketing" className="mt-1 size-4 flex-none accent-brand" /> Chcę dostawać wskazówki i oferty (opcjonalnie)
            </label>
          </>
        ) : (
          <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-[0.85rem] font-semibold text-brand-2 hover:underline" onClick={() => toast("Wysłaliśmy link do zmiany hasła (jeśli konto istnieje).")}>
            Nie pamiętasz hasła?
          </button>
        )}
        <button type="submit" className={buttonVariants({ block: true })} disabled={busy}>{busy ? "Chwileczkę…" : submitLabel}</button>
        <p className="text-[0.85rem] text-ink-2">Podpowiedź do mockupu: e-mail <code>zajety@kompas.pl</code> symuluje błąd.</p>
      </form>
    </div>
  );
}
