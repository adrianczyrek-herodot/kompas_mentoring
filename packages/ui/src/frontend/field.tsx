import type { ReactNode } from "react";

/** Klasy pola tekstowego (input, select, textarea). */
export const inputClass =
  "w-full min-h-[42px] rounded-field border border-line bg-surface px-3 py-2.5 focus:border-brand-2 focus:shadow-[0_0_0_3px_var(--color-brand-soft)] focus:outline-none aria-invalid:border-err aria-invalid:bg-[#fffafa]";

/** Etykieta + kontrolka + wiersz z błędem/podpowiedzią. Kontrolka musi mieć `id` równe `htmlFor`. */
export function Field({ label, htmlFor, error, hint, children }: {
  label: ReactNode; htmlFor: string; error?: ReactNode; hint?: string; children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-[5px]">
      <label htmlFor={htmlFor} className="text-[0.88rem] font-semibold">{label}</label>
      {children}
      <FieldMeta error={error} hint={hint} />
    </div>
  );
}

/** Wiersz pod polem: błąd (aria-live) i podpowiedź. */
export function FieldMeta({ error, hint }: { error?: ReactNode; hint?: string }) {
  return (
    <div className="flex min-h-[1.1em] justify-between gap-2 text-[0.8rem]">
      <span className="text-[0.82rem] text-err" aria-live="polite">{error}</span>
      {hint && <span className="ml-auto text-ink-3">{hint}</span>}
    </div>
  );
}
