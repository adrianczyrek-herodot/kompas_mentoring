import type { Meta, StoryObj } from '@storybook/react-vite';
import { Compass } from 'lucide-react';
import * as React from 'react';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { TodayAgenda } from '../product/today-agenda';
import { TrialRequestCard } from '../product/trial-request-card';

const sampleAgenda = [
  {
    id: 'a1',
    timeRange: '16:00 – 17:00',
    studentName: 'Krzysztof Kozłowski',
    topic: 'Konsultacja architektury mikroserwisów i kolejki RabbitMQ',
  },
  {
    id: 'a2',
    timeRange: '18:30 – 19:00',
    studentName: 'Zofia Kamińska',
    topic: 'Sesja próbna: omówienie portfolio i plan mentoringowy',
    isNow: true,
  },
];

function M2DashboardScreenView({ state = 'active' }: { state?: 'active' | 'empty_today' }) {
  return (
    <div className="min-h-screen bg-surface-page flex flex-col">
      <header className="border-b border-border-divider bg-surface-panel px-panel py-tight">
        <div className="mx-auto flex max-w-content items-center justify-between">
          <div className="flex items-center gap-inline">
            <Compass className="size-icon-md text-action-primary" />
            <span className="text-body font-medium text-text-default">Kompas</span>
            <Badge variant="neutral">Panel mentora</Badge>
          </div>
          <nav className="hidden sm:flex items-center gap-group text-body-dense font-medium text-text-muted">
            <a href="#pulpit" className="text-text-default">
              Pulpit
            </a>
            <a href="#kalendarz">Kalendarz i dostępność</a>
            <a href="#uczniowie">Moi uczniowie</a>
            <a href="#wyplaty">Wypłaty</a>
          </nav>
          <Button variant="outline" size="sm">
            Widok ucznia
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-content flex-1 p-panel space-y-section">
        <div className="space-y-tight">
          <h1 className="text-page-title font-medium text-text-default">Dzień dobry, Piotrze</h1>
          <p className="text-body text-text-muted">
            Oto podsumowanie Twoich dzisiejszych sesji i oczekujących zgłoszeń uczniów.
          </p>
        </div>

        {/* Sekcja dzisiejszych sesji */}
        <section className="space-y-tight">
          <h2 className="text-section-title font-medium text-text-default">Dzisiejsze spotkania</h2>
          <TodayAgenda items={state === 'empty_today' ? [] : sampleAgenda} />
        </section>

        {/* Nowe prośby o sesje próbne */}
        <section className="space-y-tight">
          <div className="flex items-center justify-between">
            <h2 className="text-section-title font-medium text-text-default">
              Oczekujące prośby o sesje próbne (1)
            </h2>
          </div>
          <TrialRequestCard
            studentName="Michał Wiśniewski"
            studentInitials="MW"
            goal="Chciałbym skonsultować przejście z Angulara na Next.js 16 w firmowym projekcie e-commerce oraz ułożyć plan nauki architektury modułowej."
            requestedDateTime="Środa, 26 listopada 2026, 17:30"
            hoursLeftToRespond={18}
          />
        </section>
      </main>
    </div>
  );
}

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/Ekrany/M2 Panel mentora',
  component: M2DashboardScreenView,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof M2DashboardScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StateActive: Story = {
  name: 'Stan: Zaplanowane sesje i prośby (Active)',
  args: {
    state: 'active',
  },
};

export const StateEmptyToday: Story = {
  name: 'Stan: Brak sesji na dziś (Empty Today)',
  args: {
    state: 'empty_today',
  },
};
