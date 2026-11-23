// Pure helpers for the availability editor: local "HH:MM" ↔ 30-min slot index, coverage set
// ↔ merged rules, weekly total. No React, no I/O (easily unit-testable).

/** 30-minute slot index 0…47 within a day (00:00 … 23:30). */
const SLOTS_PER_DAY = 48;
const SLOT_MINUTES = 30;

/** Mentor's local weekday 1 = Monday … 7 = Sunday (ISO-8601). */
type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const WEEKDAYS: readonly Weekday[] = [1, 2, 3, 4, 5, 6, 7];

/** Stable slot indices 0…47 — a React key that is a value, not an array index. */
export const SLOT_INDICES: readonly number[] = Array.from(
  { length: SLOTS_PER_DAY },
  (_, index) => index,
);

const WEEKDAY_LABELS = [
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
  'Niedziela',
] as const;

/** Full Polish weekday name for headings and accessible names, e.g. „Wtorek”. */
export function weekdayLabel(weekday: number): string {
  return WEEKDAY_LABELS[weekday - 1] ?? '';
}

/** One weekly template rule; `endLocal > startLocal`, never crossing midnight (24:00 allowed). */
export interface AvailabilityRuleView {
  readonly weekday: Weekday;
  /** 'HH:MM', 24 h, mentor's local time. */
  readonly startLocal: string;
  /** 'HH:MM', 24 h, mentor's local time. */
  readonly endLocal: string;
}

/** A focused/covered cell: `weekday:slot` (e.g. `2:36` = Tuesday 18:00). */
export type CellKey = string;

export function cellKey(weekday: number, slot: number): CellKey {
  return `${weekday}:${slot}`;
}

/** Slot index → 'HH:MM' (`48` → '24:00', the exclusive end of the day). */
export function slotToTime(slot: number): string {
  const minutes = slot * SLOT_MINUTES;
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mm = String(minutes % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** Column header text: the hour on the hour, the full label on the half hour (visually hidden). */
export function columnLabel(slot: number): string {
  return slot % 2 === 0 ? slotToTime(slot).slice(0, 2) : slotToTime(slot);
}

/** 'HH:MM' → slot index; '24:00' → 48. Rounds down to the containing 30-min slot. */
function timeToSlot(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Math.floor((Number(hours) * 60 + Number(minutes)) / SLOT_MINUTES);
}

/** Rules → covered cells. A rule 18:00–20:00 becomes slots 36…39. */
export function rulesToCells(rules: readonly AvailabilityRuleView[]): Set<CellKey> {
  const cells = new Set<CellKey>();
  for (const rule of rules) {
    const start = timeToSlot(rule.startLocal);
    const end = timeToSlot(rule.endLocal);
    for (let slot = start; slot < end; slot += 1) {
      cells.add(cellKey(rule.weekday, slot));
    }
  }
  return cells;
}

/** Covered cells → merged rules: consecutive covered slots of one day become one range. */
export function cellsToRules(cells: ReadonlySet<CellKey>): AvailabilityRuleView[] {
  const rules: AvailabilityRuleView[] = [];
  for (const weekday of WEEKDAYS) {
    let runStart: number | null = null;
    for (let slot = 0; slot <= SLOTS_PER_DAY; slot += 1) {
      const covered = slot < SLOTS_PER_DAY && cells.has(cellKey(weekday, slot));
      if (covered && runStart === null) {
        runStart = slot;
      } else if (!covered && runStart !== null) {
        rules.push({ weekday, startLocal: slotToTime(runStart), endLocal: slotToTime(slot) });
        runStart = null;
      }
    }
  }
  return rules;
}

/** „4 h 30 min” / „2 h” / „30 min” / „0 min”. */
export function formatWeeklyTotal(cells: ReadonlySet<CellKey>): string {
  const minutes = cells.size * SLOT_MINUTES;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest} min`;
}

/** A cell the roving focus can land on. */
export interface FocusCell {
  readonly weekday: number;
  readonly slot: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Next focus for an arrow key (no wrapping): ←/→ move along 30-min slots, ↑/↓ between weekdays,
 * Home/End jump to the ends of the row. `null` for keys the grid does not handle.
 */
export function nextFocus(focus: FocusCell, key: string): FocusCell | null {
  const lastSlot = SLOTS_PER_DAY - 1;
  switch (key) {
    case 'ArrowLeft':
      return { weekday: focus.weekday, slot: clamp(focus.slot - 1, 0, lastSlot) };
    case 'ArrowRight':
      return { weekday: focus.weekday, slot: clamp(focus.slot + 1, 0, lastSlot) };
    case 'ArrowUp':
      return { weekday: clamp(focus.weekday - 1, 1, 7), slot: focus.slot };
    case 'ArrowDown':
      return { weekday: clamp(focus.weekday + 1, 1, 7), slot: focus.slot };
    case 'Home':
      return { weekday: focus.weekday, slot: 0 };
    case 'End':
      return { weekday: focus.weekday, slot: lastSlot };
    default:
      return null;
  }
}

/** New set with every cell between `from` and `to` covered (same day, inclusive); painted only. */
export function paintRange(
  cells: ReadonlySet<CellKey>,
  from: FocusCell,
  to: FocusCell,
): Set<CellKey> {
  const next = new Set(cells);
  next.add(cellKey(to.weekday, to.slot));
  if (from.weekday !== to.weekday) {
    next.add(cellKey(from.weekday, from.slot));
    return next;
  }
  const [low, high] = from.slot <= to.slot ? [from.slot, to.slot] : [to.slot, from.slot];
  for (let slot = low; slot <= high; slot += 1) {
    next.add(cellKey(from.weekday, slot));
  }
  return next;
}

/** New set with the cell's coverage flipped. */
export function toggleCell(cells: ReadonlySet<CellKey>, focus: FocusCell): Set<CellKey> {
  const next = new Set(cells);
  const key = cellKey(focus.weekday, focus.slot);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  return next;
}
