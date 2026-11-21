import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { expect, within } from 'storybook/test';
import { ToastProvider, useToast } from '../components/toast';
import { HoldCountdown } from '../product/hold-countdown';
import { type DaySlots, type Slot, SlotGrid } from '../product/slot-grid';

const sampleDays: DaySlots[] = [
  {
    date: '2026-11-25',
    dayName: 'Wtorek, 25 lis',
    slots: [
      { id: 's1', time: '16:00', available: true },
      { id: 's2', time: '16:30', available: true },
      { id: 's3', time: '17:00', available: false },
    ],
  },
  {
    date: '2026-11-26',
    dayName: 'Środa, 26 lis',
    slots: [
      { id: 's4', time: '10:00', available: true },
      { id: 's5', time: '11:00', available: true },
    ],
  },
];

function HoldBookingDemo({
  initialSlotId = 's1',
  secondsLeft = 580,
  simulateConflict = false,
}: {
  initialSlotId?: string;
  secondsLeft?: number;
  simulateConflict?: boolean;
}) {
  const [selectedSlot, setSelectedSlot] = React.useState<string | undefined>(initialSlotId);
  const [timeLeft, setTimeLeft] = React.useState(secondsLeft);
  const manager = useToast();

  React.useEffect(() => {
    if (simulateConflict) {
      manager.add({
        title: 'Błąd 409: Termin został właśnie zajęty',
        description:
          'Inny uczeń dokończył rezerwację ułamki sekund wcześniej. Wybierz inną dostępną godzinę.',
      });
      setSelectedSlot(undefined);
    }
  }, [simulateConflict, manager]);

  return (
    <div className="max-w-content space-y-group p-panel">
      {selectedSlot ? (
        <HoldCountdown
          secondsLeft={timeLeft}
          onRenew={() => {
            setTimeLeft(600);
          }}
          onExpire={() => {
            setSelectedSlot(undefined);
          }}
        />
      ) : null}

      <SlotGrid
        days={sampleDays}
        selectedSlotId={selectedSlot}
        onSlotSelect={(slot: Slot) => {
          setSelectedSlot(slot.id);
          setTimeLeft(600);
        }}
      />
    </div>
  );
}

const meta = {
  title: 'Wzorce/Wybór terminu z blokadą',
  component: HoldBookingDemo,
  decorators: [
    (Story) => (
      <ToastProvider closeLabel="Zamknij" regionLabel="Powiadomienia">
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof HoldBookingDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HoldActive: Story = {
  name: '1. Aktywna blokada terminu (hold 10 min)',
  args: {
    initialSlotId: 's1',
    secondsLeft: 540,
  },
};

export const Conflict409: Story = {
  name: '2. Konflikt 409 (termin zajęty przez innego użytkownika)',
  args: {
    simulateConflict: true,
  },
};

export const HoldExpiredState: Story = {
  name: '3. Wygasła blokada terminu',
  args: {
    initialSlotId: 's1',
    secondsLeft: 0,
  },
};

export const HoldVisibleTest: Story = {
  name: 'Test: obecność odliczania blokady',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/Termin zarezerwowany na czas dokończenia zapisu/i),
    ).toBeVisible();
  },
};
