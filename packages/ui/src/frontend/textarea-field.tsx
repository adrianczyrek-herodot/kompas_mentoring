"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { inputClass } from "./field";

/**
 * Pole wieloliniowe z etykietą, błędem i licznikiem znaków `n/max` w jednym wierszu pod polem
 * (licznik jest informacyjny — limit sprawdza walidacja).
 */
export function TextareaField({ label, name, max, error, className, defaultValue, onChange, ...props }:
  Omit<ComponentProps<"textarea">, "name"> & { label: ReactNode; name: string; max: number; error?: ReactNode }) {
  const [count, setCount] = useState(String(defaultValue ?? "").length);
  const id = props.id ?? `f-${name}`;
  return (
    <div className="flex min-w-0 flex-col gap-[5px]">
      <label htmlFor={id} className="text-[0.88rem] font-semibold">{label}</label>
      <textarea
        {...props}
        id={id}
        name={name}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        className={cn(inputClass, "resize-y", className)}
        onChange={(e) => { setCount(e.target.value.length); onChange?.(e); }}
      />
      <div className="flex min-h-[1.1em] justify-between gap-2 text-[0.8rem]">
        <span className="text-[0.82rem] text-err" aria-live="polite">{error}</span>
        <span className="ml-auto text-ink-3" data-count-for={name}>{count}/{max}</span>
      </div>
    </div>
  );
}
