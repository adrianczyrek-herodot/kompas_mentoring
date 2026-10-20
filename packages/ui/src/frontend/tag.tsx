import type { ReactNode } from "react";
import { cn } from "../lib/utils";

/** Etykieta tematu/umiejętności. `soft` — wariant neutralny (np. tagi opinii). */
export function Tag({ children, soft = false }: { children: ReactNode; soft?: boolean }) {
  return (
    <span className={cn("rounded-md px-[9px] py-0.5 text-[0.78rem]", soft ? "bg-line-2 text-ink-2" : "bg-brand-soft text-brand")}>
      {children}
    </span>
  );
}

export function TagList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("my-2 flex flex-wrap gap-1.5", className)}>{children}</div>;
}
