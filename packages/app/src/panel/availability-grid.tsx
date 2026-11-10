"use client";

import { dayShort } from "@devmentor/ui/lib/format";
import { cn } from "@devmentor/ui/lib/utils";
import { useEffect, useRef } from "react";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7–21
const DAYS = [0, 1, 2, 3, 4, 5, 6];

/**
 * Tygodniowa siatka dostępności: kliknięcie przełącza godzinę, przeciągnięcie „maluje” stan pierwszej komórki
 * (klawiatura: Enter/spacja). `booked` — komórki z sesjami (tylko do odczytu), `dayLabel` — etykieta kolumny.
 */
export function AvailabilityGrid({ selected, onChange, booked = {}, dayLabel = (d) => dayShort(d) }: {
  selected: Set<string>;
  onChange: (key: string, on: boolean) => void;
  booked?: Record<string, string>;
  dayLabel?: (day: number) => string;
}) {
  // Stan malowania (włącz/wyłącz) od wciśnięcia do puszczenia przycisku myszy.
  const painting = useRef<boolean | null>(null);
  useEffect(() => {
    const stop = () => { painting.current = null; };
    window.addEventListener("pointerup", stop);
    return () => window.removeEventListener("pointerup", stop);
  }, []);
  const paint = (key: string) => { if (painting.current !== null && selected.has(key) !== painting.current) onChange(key, painting.current); };

  return (
    <div className="grid gap-[3px] overflow-x-auto select-none touch-none" role="grid" aria-label="Dostępność tygodniowa">
      <div className="grid grid-cols-[44px_repeat(7,minmax(34px,1fr))] gap-[3px]">
        <span />
        {DAYS.map((d) => <span key={d} className="text-center text-xs font-semibold text-muted-foreground uppercase">{dayLabel(d)}</span>)}
      </div>
      {HOURS.map((h) => (
        <div key={h} className="grid grid-cols-[44px_repeat(7,minmax(34px,1fr))] gap-[3px]">
          <span className="self-center pr-1 text-right text-xs text-muted-foreground">{h}:00</span>
          {DAYS.map((d) => {
            const key = `${d}-${h}`;
            if (booked[key]) {
              return <span key={key} title={booked[key]} className="grid h-[26px] place-items-center overflow-hidden rounded-[5px] bg-primary text-[0.65rem] text-primary-foreground">{booked[key].split(" ")[0]}</span>;
            }
            const on = selected.has(key);
            return (
              <button
                key={key}
                type="button"
                data-cell={key}
                aria-pressed={on}
                aria-label={`${dayShort(d)} ${h}:00`}
                className={cn("h-[26px] cursor-pointer rounded-[5px] border", on ? "border-primary/40 bg-primary/15" : "bg-muted/40")}
                onPointerDown={(e) => { e.preventDefault(); painting.current = !on; onChange(key, !on); }}
                onPointerEnter={() => paint(key)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange(key, !on); } }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
