import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { type DaySlots, type Slot, SlotGrid, SlotGridSkeleton } from './slot-grid';

const sampleDays: DaySlots[] = [
  {
    date: '2026-11-25',
    dayName: 'Wtorek, 25 lis',
    slots: [
      { id: 's1', time: '16:00', available: true },
      { id: 's2', time: '16:30', available: true },
      { id: 's3', time: '17:00', available: false },
      { id: 's4', time: '17:30', available: true },
    ],
  },
  {
    date: '2026-11-26',
    dayName: 'Środa, 26 lis',
    slots: [
      { id: 's5', time: '10:00', available: true },
      { id: 's6', time: '11:00', available: false },
      { id: 's7', time: '14:00', available: true },
      { id: 's8', time: '15:00', available: true },
    ],
  },
  {
    date: '2026-11-27',
    dayName: 'Czwartek, 27 lis',
    slots: [
      { id: 's9', time: '17:00', available: true },
      { id: 's10', time: '18:00', available: true },
      { id: 's11', time: '19:00', available: false },
      { id: 's12', time: '19:30', available: false },
    ],
  },
];

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/SlotGrid',
  component: SlotGrid,
  args: {
    days: sampleDays,
    selectedSlotId: 's1',
    timezone: 'Europe/Warsaw',
    onSlotSelect: fn(),
  },
} satisfies Meta<typeof SlotGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function InteractiveDemo() {
  const [selected, setSelected] = useState<string>('s2');
  return (
    <SlotGrid
      days={sampleDays}
      selectedSlotId={selected}
      onSlotSelect={(slot: Slot) => {
        setSelected(slot.id);
      }}
    />
  );
}

export const Interactive: Story = {
  name: 'Wybór slotu z zapamiętaniem',
  render: () => <InteractiveDemo />,
};

export const NarrowScreen: Story = {
  name: 'Ekran 320 px',
  render: () => (
    <ViewportFrame width={320}>
      <SlotGrid days={sampleDays} selectedSlotId="s1" />
    </ViewportFrame>
  ),
};

export const Loading: Story = {
  name: 'Stan ładowania (Skeleton)',
  render: () => <SlotGridSkeleton />,
};

export const SelectSlotTest: Story = {
  name: 'Test: wybór slotu i ignorowanie zablokowanego',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const availableSlot = canvas.getByRole('button', { name: '16:30' });
    await userEvent.click(availableSlot);
    await expect(args.onSlotSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 's2', time: '16:30' }),
      expect.objectContaining({ date: '2026-11-25' }),
    );

    const disabledSlot = canvas.getByRole('button', { name: '17:00' });
    await expect(disabledSlot).toBeDisabled();
  },
};
