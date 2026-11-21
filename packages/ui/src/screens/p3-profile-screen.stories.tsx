import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowLeft, Compass } from 'lucide-react';
import * as React from 'react';
import { Button } from '../components/button';
import { EmptyState } from '../components/empty-state';
import { ProfileHero, ProfileHeroSkeleton } from '../product/profile-hero';
import { type DaySlots, SlotGrid, SlotGridSkeleton } from '../product/slot-grid';

const sampleDays: DaySlots[] = [
  {
    date: '2026-11-25',
    dayName: 'Wtorek, 25 lis',
    slots: [
      { id: 's1', time: '16:00', available: true },
      { id: 's2', time: '17:00', available: true },
    ],
  },
  {
    date: '2026-11-26',
    dayName: 'Środa, 26 lis',
    slots: [
      { id: 's3', time: '14:00', available: true },
      { id: 's4', time: '15:30', available: true },
    ],
  },
];

function P3ProfileScreenView({
  state = 'ready',
}: {
  state?: 'ready' | 'loading' | 'no_availability';
}) {
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
            Wróć do katalogu
          </Button>
        </div>
      </header>

      {state === 'loading' ? (
        <div className="space-y-group">
          <ProfileHeroSkeleton />
          <div className="mx-auto max-w-content p-panel">
            <SlotGridSkeleton />
          </div>
        </div>
      ) : (
        <main className="flex-1 space-y-section">
          <ProfileHero
            name="Anna Kowalczyk"
            headline="Staff Frontend Engineer w FinTech · Praktyk Design Systems i Next.js"
            bio="Pomagam programistom wejść na poziom seniorski i staff: architektura aplikacji frontendowych, projektowanie design systemów na tokenach, przygotowanie do rekrutacji system design oraz porządkowanie procesów inżynieryjnych."
            initials="AK"
            tags={['React', 'Next.js', 'TypeScript', 'Design Systems', 'Architektura']}
            trialRate="95 zł"
            standardRate="190 zł"
          />

          <div className="mx-auto max-w-content p-panel space-y-group">
            <h2 className="text-section-title font-medium text-text-default">
              Dostępne terminy sesji próbnej
            </h2>

            {state === 'no_availability' ? (
              <EmptyState
                title="Brak wolnych terminów w najbliższym czasie"
                description="Ten mentor nie udostępnił jeszcze grafiku na kolejny tydzień. Dodaj go do obserwowanych, aby otrzymać powiadomienie o nowych terminach."
                action={<Button variant="outline">Obserwuj mentora</Button>}
              />
            ) : (
              <SlotGrid days={sampleDays} />
            )}
          </div>
        </main>
      )}
    </div>
  );
}

const meta = {
  title: 'Produkt/E2 Katalog i onboarding/Ekrany/P3 Profil mentora',
  component: P3ProfileScreenView,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof P3ProfileScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StateReady: Story = {
  name: 'Stan: Pełny profil i terminy (Ready)',
  args: {
    state: 'ready',
  },
};

export const StateLoading: Story = {
  name: 'Stan: Ładowanie profilu (Loading)',
  args: {
    state: 'loading',
  },
};

export const StateNoAvailability: Story = {
  name: 'Stan: Brak terminów (No Availability)',
  args: {
    state: 'no_availability',
  },
};
