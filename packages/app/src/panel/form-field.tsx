"use client";

import { Label } from "@devmentor/ui/backend/label";
import { Textarea } from "@devmentor/ui/backend/textarea";
import { useState, type ComponentProps, type ReactNode } from "react";

/** Pole formularza panelu: etykieta, kontrolka, błąd (i opcjonalnie podpowiedź). */
export function FormField({ label, htmlFor, error, hint, children }: { label: ReactNode; htmlFor: string; error?: string | null; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {(error || hint) && (
        <div className="flex justify-between gap-2 text-xs">
          <span className="text-destructive" aria-live="polite">{error}</span>
          {hint && <span className="ml-auto text-muted-foreground">{hint}</span>}
        </div>
      )}
    </div>
  );
}

/** Błąd pola bez etykiety (grupy wyboru, checkboxy). */
export function FieldError({ children }: { children?: ReactNode }) {
  return children ? <p className="text-xs text-destructive" aria-live="polite">{children}</p> : null;
}

/** Pole wieloliniowe z licznikiem znaków `n/max`. */
export function CountedTextarea({ label, name, max, error, defaultValue, ...props }:
  Omit<ComponentProps<"textarea">, "name"> & { label: ReactNode; name: string; max: number; error?: string | null }) {
  const [count, setCount] = useState(String(defaultValue ?? "").length);
  const id = props.id ?? `f-${name}`;
  return (
    <FormField label={label} htmlFor={id} error={error} hint={`${count}/${max}`}>
      <Textarea {...props} id={id} name={name} defaultValue={defaultValue} aria-invalid={error ? true : undefined}
        onChange={(e) => { setCount(e.target.value.length); props.onChange?.(e); }} />
    </FormField>
  );
}
