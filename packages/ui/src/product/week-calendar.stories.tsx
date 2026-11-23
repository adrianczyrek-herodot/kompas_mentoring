import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { TZ } from '../../.storybook/fixtures/kompas';
import type { AvailabilityRuleView } from './availability-editor.logic';
import { WeekCalendar, type WeekExceptionView, type WeekSessionView } from './week-calendar';

const onPreviousWeek = fn();
const onNextWeek = fn();

const weekStart = '2026-10-19';

const rules: AvailabilityRuleView[] = [
  { weekday: 1, startLocal: '09:00', endLocal: '12:00' },
  { weekday: 2, startLocal: '17:00', endLocal: '20:00' },
  { weekday: 3, startLocal: '09:00', endLocal: '12:00' },
  { weekday: 4, startLocal: '18:00', endLocal: '20:00' },
  { weekday: 5, startLocal: '08:00', endLocal: '10:00' },
];

const exceptions: WeekExceptionView[] = [
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

const sessions: WeekSessionView[] = [
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
  {
    id: 's3',
    title: 'Sesja z planu — Julia M.',
    startsAt: '2026-10-23T18:00:00+02:00',
    endsAt: '2026-10-23T19:00:00+02:00',
    status: 'scheduled',
  },
];

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/WeekCalendar',
  component: WeekCalendar,
  args: {
    weekStart,
    timeZone: TZ,
    rules,
    exceptions,
    sessions,
    onPreviousWeek,
    onNextWeek,
  },
  argTypes: {
    weekStart: { control: false },
    timeZone: { control: false },
    rules: { control: false },
    exceptions: { control: false },
    sessions: { control: false },
  },
} satisfies Meta<typeof WeekCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Typical: Story = {
  name: 'S — tydzień z sesjami i wyjątkami',
  args: { canGoPrevious: false },
};

export const EmptyAvailability: Story = {
  name: 'E — pusta dostępność',
  args: { rules: [], exceptions: [], sessions: [] },
};

export const WithoutExceptions: Story = {
  name: 'Bez wyjątków',
  args: { exceptions: [] },
};

export const ReadOnly: Story = {
  name: 'Tylko podgląd (bez nawigacji)',
  args: { readOnly: true },
};

export const Narrow: Story = {
  name: 'Wąski ekran 320 px',
  render: (args) => (
    <ViewportFrame width={320}>
      <WeekCalendar {...args} />
    </ViewportFrame>
  ),
};

export const NavigationTest: Story = {
  name: 'Test: nawigacja tygodni i blokada na krańcu',
  args: { canGoPrevious: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onNextWeek.mockClear();
    await expect(canvas.queryByRole('button', { name: 'Poprzedni tydzień' })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Następny tydzień' }));
    await expect(onNextWeek).toHaveBeenCalledTimes(1);
  },
};

export const OutsideAvailabilityTest: Story = {
  name: 'Test: sesja poza dostępnością (Q11)',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Poza dostępnością — przełóż lub odwołaj')).toBeVisible();
    await expect(canvas.getByText('Urlop / blokada')).toBeVisible();
    await expect(canvas.getByText('Dodatkowe godziny')).toBeVisible();
  },
};
