import type { ReactNode } from "react";
import { cn } from "../lib/utils";

const tones = { info: "bg-brand-soft text-brand", warn: "bg-warn-soft text-warn", err: "bg-err-soft text-err" };

/** Komunikat w treści strony. */
export function Notice({ tone = "info", children, role }: { tone?: keyof typeof tones; children: ReactNode; role?: "alert" }) {
  return (
    <p className={cn("flex flex-wrap items-start gap-2 rounded-field px-3.5 py-2.5 text-[0.9rem]", tones[tone])} role={role}>
      {children}
    </p>
  );
}
