import { cn } from "../lib/utils";

const shimmer = "animate-shimmer bg-[linear-gradient(90deg,var(--color-line-2),#f7f4ee,var(--color-line-2))] bg-size-[200%_100%]";

/** Pojedynczy blok szkieletu (stan „loading”). */
export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn(shimmer, "rounded-card", className)} />;
}

/** Lista bloków szkieletu: karty (130 px) albo wiersze (44 px). */
export function Skeleton({ rows = 3, kind = "card" }: { rows?: number; kind?: "card" | "line" }) {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Wczytywanie">
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonBlock key={i} className={kind === "card" ? "h-[130px]" : "h-11 rounded-[10px]"} />
      ))}
    </div>
  );
}
