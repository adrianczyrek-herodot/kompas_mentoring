import type { DaySlots } from '@kompas/ui';
import { Temporal } from 'temporal-polyfill';
import type { AvailabilitySlot } from './booking-api.ts';

/** Q10: U1 scrolls the weeks inside the 8-week booking horizon. */
const HORIZON_WEEKS = 8;

const format = (date: Temporal.PlainDate, options: Intl.DateTimeFormatOptions): string =>
  date.toLocaleString('pl-PL', options);

export interface BookingWeek {
  readonly monday: Temporal.PlainDate;
  readonly label: string;
  readonly days: DaySlots[];
}

/** All slots of one local date, as the SlotGrid days of the week starting at `monday`. */
const daysOf = (
  monday: Temporal.PlainDate,
  timeZone: string,
  slots: readonly AvailabilitySlot[],
): DaySlots[] =>
  Array.from({ length: 7 }, (_, index) => {
    const date = monday.add({ days: index });
    const key = date.toString();
    const daySlots = slots
      .filter((slot) => slot.localStart.slice(0, 10) === key)
      .map((slot) => ({ id: slot.startsAt, startsAt: slot.startsAt }));
    return {
      date: date.toZonedDateTime({ timeZone, plainTime: '12:00' }).toInstant().toString(),
      slots: daySlots,
    };
  });

/** Groups the horizon answer into the 8 weeks U1 pages through, empty weeks included. */
export const toWeeks = (
  slots: readonly AvailabilitySlot[],
  timeZone: string,
): BookingWeek[] => {
  const now = Temporal.Now.zonedDateTimeISO(timeZone);
  const monday = now
    .toPlainDate()
    .subtract({ days: (now.dayOfWeek + 6) % 7 });
  return Array.from({ length: HORIZON_WEEKS }, (_, index) => {
    const weekMonday = monday.add({ weeks: index });
    const weekSunday = weekMonday.add({ days: 6 });
    return {
      monday: weekMonday,
      label: `${format(weekMonday, { day: 'numeric', month: 'long' })} – ${format(weekSunday, { day: 'numeric', month: 'long' })}`,
      days: daysOf(weekMonday, timeZone, slots),
    };
  });
};

/** The horizon end shown under the week picker, e.g. „Terminy do 18 stycznia”. */
export const horizonEnd = (weeks: readonly BookingWeek[]): string => {
  const last = weeks.at(-1)?.monday.add({ days: 6 }) ?? Temporal.Now.plainDateISO();
  return format(last, { day: 'numeric', month: 'long' });
};

/** Index of the first week that has any slot, searching forward from `from`; `null` when none. */
export const nextWeekWithSlots = (
  weeks: readonly BookingWeek[],
  from: number,
): number | null => {
  for (const [index, week] of weeks.entries()) {
    if (index < from) continue;
    if (week.days.some((day) => day.slots.length > 0)) return index;
  }
  return null;
};

/** First start instant of a week — for the „Następny wolny termin” line (state E). */
export const firstSlotOf = (week: BookingWeek): string | null => {
  const slot = week.days.flatMap((day) => day.slots)[0];
  return slot?.startsAt ?? null;
};
