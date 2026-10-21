import { cn } from "../lib/utils";

/** Wskaźnik ładowania w kolorze tekstu (`large` — 36 px w kolorze marki). */
export function Spinner({ large = false, className }: { large?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block animate-spin rounded-full border-current border-r-transparent",
        large ? "size-9 border-3 text-brand" : "size-4 border-2",
        className,
      )}
    />
  );
}
