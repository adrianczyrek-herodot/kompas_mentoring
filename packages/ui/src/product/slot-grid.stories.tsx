import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import {
  emptyWeek,
  NEXT_FREE,
  TZ,
  TZ_LABEL,
  WEEK_LABEL,
  week,
} from '../../.storybook/fixtures/kompas';
import { type Slot, SlotGrid, type SlotGridProps } from './slot-grid';

const onSelect = fn();

function Interactive(props: Partial<SlotGridProps>) {
  const [selected, setSelected] = useState<string | undefined>(props.selectedSlotId);
  return (
    <SlotGrid
      days={week}
      timeZone={TZ}
      timeZoneLabel={TZ_LABEL}
      weekLabel={WEEK_LABEL}
      canGoPrev={false}
      {...props}
      selectedSlotId={selected}
      onSelect={(slot: Slot) => {
        setSelected(slot.id);
        onSelect(slot.id);
      }}
    />
  );
}

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/SlotGrid',
  component: SlotGrid,
  args: {
    days: week,
    timeZone: TZ,
    timeZoneLabel: TZ_LABEL,
    weekLabel: WEEK_LABEL,
    status: 'ready',
    canGoPrev: false,
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['ready', 'loading', 'error'] },
    days: { control: false },
  },
} satisfies Meta<typeof SlotGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Selected: Story = {
  name: 'Wybrany termin',
  render: () => <Interactive selectedSlotId="2026-10-22-18" />,
};

export const Loading: Story = { name: 'Ładowanie', args: { status: 'loading' } };

export const ErrorLoading: Story = { name: 'Błąd', args: { status: 'error' } };

export const EmptyWithNext: Story = {
  name: 'Pusto — jest następny wolny termin',
  args: { days: emptyWeek, nextAvailable: NEXT_FREE },
};

export const EmptyNoSlots: Story = {
  name: 'Pusto — brak terminów w 14 dni',
  args: { days: emptyWeek },
};

export const ManySlots: Story = {
  name: 'Dużo danych (pełny tydzień)',
  args: {
    days: week.map((day) => ({
      ...day,
      slots: [8, 9, 10, 11, 12, 13, 16, 17, 18, 19, 20].map((hour) => {
        const date = day.date.slice(0, 10);
        const hh = String(hour).padStart(2, '0');
        return { id: `${date}-${hh}`, startsAt: `${date}T${hh}:00:00+02:00` };
      }),
    })),
  },
};

export const OtherTimeZone: Story = {
  name: 'Inna strefa ucznia (Londyn)',
  parameters: {
    docs: {
      description: {
        story:
          'Te same sloty pokazane w strefie ucznia (reguła 10 briefu): 18:00 w Warszawie to 17:00 w Londynie.',
      },
    },
  },
  args: { timeZone: 'Europe/London', timeZoneLabel: 'Londyn (GMT+1)' },
};

export const Narrow: Story = {
  name: 'Wąski ekran 320 px',
  render: () => (
    <ViewportFrame width={320}>
      <Interactive />
    </ViewportFrame>
  ),
};

export const SelectTest: Story = {
  name: 'Test: wybór terminu klawiaturą, aria-pressed',
  render: () => <Interactive />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'Poprzedni tydzień' })).toBeNull();
    const thursday = canvas.getByRole('group', { name: 'czw., 22 paź' });
    const slot = within(thursday).getByRole('button', { name: '18:00' });
    await expect(slot).toHaveAttribute('aria-pressed', 'false');
    slot.focus();
    onSelect.mockClear();
    await userEvent.keyboard(' ');
    await expect(slot).toHaveAttribute('aria-pressed', 'true');
    await expect(onSelect).toHaveBeenCalledWith('2026-10-22-18');
    const other = within(thursday).getByRole('button', { name: '19:00' });
    await userEvent.click(other);
    await expect(slot).toHaveAttribute('aria-pressed', 'false');
    await expect(other).toHaveAttribute('aria-pressed', 'true');
  },
};
