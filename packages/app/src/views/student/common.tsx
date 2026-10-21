"use client";

import type { Mentor, Session, SessionStatus } from "@devmentor/core/domain";
import { Avatar } from "@devmentor/ui/frontend/avatar";
import type { BadgeTone } from "@devmentor/ui/frontend/badge";
import { Icon } from "@devmentor/ui/frontend/icon";
import { smallMuted } from "@devmentor/ui/frontend/typography";
import { fmtDate } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

export const STATUS_LABEL: Record<SessionStatus, string> = {
  scheduled: "Zaplanowana", completed: "Odbyta", cancelled: "Anulowana", no_show: "Nieobecność", disputed: "Zgłoszony problem", requested: "Oczekuje na mentora",
};

export const STATUS_TONE: Record<SessionStatus, BadgeTone> = {
  scheduled: "brand", completed: "neutral", cancelled: "err", no_show: "err", disputed: "err", requested: "warn",
};

export const typeLabel = (s: Session): string => (s.type === "trial" ? "Sesja próbna" : "Sesja z planu");

export const firstName = (name: string): string => name.split(" ")[0] ?? name;

/** Pasek kroków rezerwacji: 1 Termin · 2 Płatność · 3 Gotowe. */
export function StepsBar({ step, payLabel = "Płatność" }: { step: 1 | 2 | 3; payLabel?: string }) {
  const steps = ["1 Termin", `2 ${payLabel}`, "3 Gotowe"];
  return (
    <div className="mb-4 flex gap-1.5 text-[0.82rem] text-ink-3">
      {steps.map((label, i) => (
        <span key={label} className={cn("flex-1 border-t-3 border-line pt-2", i + 1 === step && "border-brand font-semibold text-brand", i + 1 < step && "border-brand-2 text-ink-2")}>
          {label}
        </span>
      ))}
    </div>
  );
}

/** Awatar mentora z nazwą i podpisem. */
export function MentorSummary({ mentor, size = 48, children }: { mentor: Pick<Mentor, "name" | "hue">; size?: number; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar name={mentor.name} hue={mentor.hue} size={size} />
      <div><strong>{mentor.name}</strong><br /><span className={smallMuted}>{children}</span></div>
    </div>
  );
}

/** Link „wstecz” nad treścią ekranu. */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="mb-3.5 inline-flex items-center gap-1.5 text-[0.9rem] text-ink-2 no-underline">
      <Icon name="back" /> {children}
    </Link>
  );
}

/** Kafelek daty sesji (dzień miesiąca + skrót dnia tygodnia). */
export function DateTile({ iso }: { iso: string }) {
  return (
    <div className="flex w-[52px] flex-none flex-col rounded-[10px] bg-brand-soft py-1.5 text-center leading-[1.1] text-brand">
      <b className="font-serif text-[1.15rem]">{new Date(iso).getDate()}</b>
      <span className="text-[0.7rem] uppercase">{fmtDate(iso).split(",")[0]}</span>
    </div>
  );
}

/** Lista „z ptaszkiem” (zadania, kamienie milowe): przekreślenie po zaznaczeniu. */
export function TodoItem({ checked, onChange, children, aside }: { checked: boolean; onChange: (done: boolean) => void; children: ReactNode; aside?: ReactNode }) {
  return (
    <li>
      <label className={cn("flex cursor-pointer items-start gap-2", checked && "text-ink-3 line-through")}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-4 flex-none accent-brand" /> {children}
      </label>
      {aside}
    </li>
  );
}
