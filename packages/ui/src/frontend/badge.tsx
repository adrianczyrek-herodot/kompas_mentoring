import type { ReactNode } from "react";
import { cn } from "../lib/utils";

const tones = {
  neutral: "bg-line-2 text-ink-2",
  brand: "bg-brand-soft text-brand",
  accent: "bg-accent-soft text-[#9a4b10]",
  warn: "bg-warn-soft text-warn",
  err: "bg-err-soft text-err",
};

export type BadgeTone = keyof typeof tones;

/** Plakietka statusu. */
export function Badge({ tone = "neutral", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-[9px] py-0.5 text-[0.74rem] font-semibold whitespace-nowrap", tones[tone], className)}>
      {children}
    </span>
  );
}
