import { ICON_PATHS } from "../lib/icons";
import { cn } from "../lib/utils";

/** Ikona liniowa 24×24 w kolorze tekstu. Nazwy: klucze `ICON_PATHS` (`search`, `cal`, `shield`…). */
export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      className={cn("inline-block size-[18px] flex-none align-[-3px]", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] ?? "" }}
    />
  );
}
