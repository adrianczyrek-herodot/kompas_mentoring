// Example data for the M3 pattern screen (Storybook only, not exported from the package).
import type { AvailabilityRuleView, WeekExceptionView, WeekSessionView } from '../../src/index';

export const WEEK_START = '2026-10-19';

export const template: AvailabilityRuleView[] = [
  { weekday: 1, startLocal: '09:00', endLocal: '12:00' },
  { weekday: 2, startLocal: '17:00', endLocal: '20:00' },
  { weekday: 3, startLocal: '09:00', endLocal: '12:00' },
  { weekday: 4, startLocal: '18:00', endLocal: '20:00' },
  { weekday: 5, startLocal: '08:00', endLocal: '10:00' },
];

export const weekExceptions: WeekExceptionView[] = [
  {
    id: 'e1',
    startsAt: '2026-10-21T09:00:00+02:00',
    endsAt: '2026-10-21T17:00:00+02:00',
    kind: 'off',
    note: 'Sprawy rodzinne',
  },
  {
    id: 'e2',
    startsAt: '2026-10-24T10:00:00+02:00',
    endsAt: '2026-10-24T13:00:00+02:00',
    kind: 'extra',
    note: 'Dodatkowe konsultacje',
  },
];

export const sessions: WeekSessionView[] = [
  {
    id: 's1',
    title: 'Sesja z planu — Kasia Nowicka',
    startsAt: '2026-10-20T18:00:00+02:00',
    endsAt: '2026-10-20T19:00:00+02:00',
    status: 'scheduled',
  },
  {
    id: 's2',
    title: 'Sesja próbna — Paweł R.',
    startsAt: '2026-10-22T09:00:00+02:00',
    endsAt: '2026-10-22T09:30:00+02:00',
    status: 'requested',
    outsideAvailability: true,
  },
];
