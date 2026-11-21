import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowLeft, Compass } from 'lucide-react';
import * as React from 'react';
import { Button } from '../components/button';
import { Card, CardContent } from '../components/card';
import { ToastProvider, useToast } from '../components/toast';
import { HoldCountdown } from '../product/hold-countdown';
import { type DaySlots, SlotGrid } from '../product/slot-grid';

const sampleDays: DaySlots[] = [
  {
    date: '2026-11-25',
    dayName: 'Wtorek, 25 lis',
    slots: [
      { id: 's1', time: '16:00', available: true },
      { id: 's2', time: '16:30', available: true },
    ],
  },
  {
    date: '2026-11-26',
    dayName: 'Środa, 26 lis',
    slots: [
      { id: 's3', time: '10:00', available: true },
      { id: 's4', time: '14:00', available: true },
    ],
  },
];

function U1BookingScreenView({
  state = 'selecting',
}: {
  state?: 'selecting' | 'held' | 'conflict_409';
}) {
  const manager = useToast();
  const [selectedSlot, setSelectedSlot] = React.useState<string | undefined>(
    state === 'held' ? 's1' : undefined,
  );

  React.useEffect(() => {
    if (state === 'conflict_409') {
      manager.add({
        title: 'Błąd 409: Ten termin został przed chwilą zajęty',
        description: 'Inny uczeń dokończył rezerwację. Wybierz inną dostępną godzinę.',
      });
    }
  }, [state, manager]);

  return (
    <div className="min-h-screen bg-surface-page flex flex-col">
      <header className="border-b border-border-divider bg-surface-panel px-panel py-tight">
        <div className="mx-auto flex max-w-content items-center justify-between">
          <div className="flex items-center gap-inline">
            <Compass className="size-icon-md text-action-primary" />
            <span className="text-body font-medium text-text-default">Kompas</span>
          </div>
          <Button variant="ghost" size="sm" className="gap-tight">
            <ArrowLeft className="size-icon-sm" />
            Wróć do profilu mentora
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-content flex-1 p-panel space-y-group">
        <div className="space-y-tight">
          <h1 className="text-page-title font-medium text-text-default">
            Zarezerwuj sesję próbną (30 min)
          </h1>
          <p className="text-body text-text-muted">
            Mentor: <strong className="font-medium text-text-default">Anna Kowalczyk</strong> ·
            Stawka: 95 zł
          </p>
        </div>

        {selectedSlot ? <HoldCountdown secondsLeft={state === 'held' ? 540 : 600} /> : null}

        <div className="grid grid-cols-1 gap-group sm:grid-cols-3">
          <div className="sm:col-span-2">
            <SlotGrid
              days={sampleDays}
              selectedSlotId={selectedSlot}
              onSlotSelect={(slot) => {
                setSelectedSlot(slot.id);
              }}
            />
          </div>

          <div>
            <Card className="p-panel border-border-divider bg-surface-panel space-y-group">
              <CardContent className="p-0 space-y-group">
                <h3 className="text-section-title font-medium text-text-default">
                  Podsumowanie rezerwacji
                </h3>
                <div className="space-y-tight text-meta text-text-muted">
                  <p>
                    Sesja:{' '}
                    <strong className="font-medium text-text-default">30 min sesja próbna</strong>
                  </p>
                  <p>
                    Termin:{' '}
                    <strong className="font-medium text-text-default tabular-nums">
                      {selectedSlot ? 'Wtorek, 25 lis, 16:00' : 'Wybierz termin obok'}
                    </strong>
                  </p>
                  <div className="border-t border-border-divider pt-tight">
                    <span>Do zapłaty z portfela:</span>
                    <p className="text-page-title font-medium text-text-default tabular-nums">
                      95,00 zł
                    </p>
                  </div>
                </div>
                <Button className="w-full" disabled={!selectedSlot}>
                  Potwierdź rezerwację
                </Button>
                <p className="text-center text-meta text-text-subtle">
                  Środki zostaną zablokowane na Twoim koncie student_credit.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/Ekrany/U1 Wybór terminu',
  component: U1BookingScreenView,
  decorators: [
    (Story) => (
      <ToastProvider closeLabel="Zamknij" regionLabel="Powiadomienia">
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof U1BookingScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StateSelectingSlot: Story = {
  name: 'Stan: Wybór terminu (Selecting)',
  args: {
    state: 'selecting',
  },
};

export const StateHeldSlot: Story = {
  name: 'Stan: Termin zablokowany (Held)',
  args: {
    state: 'held',
  },
};

export const StateConflict409: Story = {
  name: 'Stan: Konflikt 409 (Termin zajęty)',
  args: {
    state: 'conflict_409',
  },
};
