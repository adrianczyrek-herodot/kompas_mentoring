import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowLeft, Compass, Video } from 'lucide-react';
import * as React from 'react';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Card, CardContent } from '../components/card';
import { PolicyNotice } from '../product/policy-notice';

function U5SessionDetailScreenView({
  state = 'ahead_12h',
}: {
  state?: 'ahead_12h' | 'imminent_less_12h' | 'live_room';
}) {
  const isImminent = state === 'imminent_less_12h';
  const isLive = state === 'live_room';

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
            Wróć do listy sesji
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-content flex-1 p-panel space-y-group">
        <div className="flex flex-col gap-group border-b border-border-divider pb-group sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-tight">
            <div className="flex items-center gap-inline">
              <span className="text-meta text-text-muted">Rezerwacja sesji #B-1082</span>
              <Badge variant={isLive ? 'warning' : 'success'}>
                {isLive ? 'Trwa teraz' : 'Potwierdzona'}
              </Badge>
            </div>
            <h1 className="text-page-title font-medium text-text-default">
              Architektura mikrofrontendów i design systemy
            </h1>
            <p className="text-body-dense text-text-muted tabular-nums">
              Czwartek, 27 listopada 2026, 17:00 – 18:00 (Europe/Warsaw)
            </p>
          </div>

          <div className="flex items-center gap-inline">
            {isLive ? (
              <Button className="gap-tight">
                <Video className="size-icon-sm" />
                Dołącz do pokoju wideo
              </Button>
            ) : (
              <>
                <Button variant="outline">Przełóż termin</Button>
                <Button variant="ghost" className="text-text-danger hover:text-text-danger">
                  Odwołaj sesję
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Zasada 12 godzin */}
        <PolicyNotice hoursRemaining={isImminent ? 6 : 48} />

        <div className="grid grid-cols-1 gap-group sm:grid-cols-3">
          <Card className="p-panel border-border-divider bg-surface-panel sm:col-span-2">
            <CardContent className="space-y-tight p-0">
              <h3 className="text-section-title font-medium text-text-default">Agenda spotkania</h3>
              <p className="text-body text-text-default">
                1. Analiza obecnego monolitu i wąskich gardeł wdrożeniowych.
                <br />
                2. Podział na pakiety core, ui, contracts i apps.
                <br />
                3. Wdrożenie tokenów i Storybooka jako źródła prawdy.
              </p>
            </CardContent>
          </Card>

          <Card className="p-panel border-border-divider bg-surface-panel">
            <CardContent className="space-y-tight p-0 text-meta">
              <h3 className="text-label font-medium text-text-default mb-tight">Uczestnicy</h3>
              <p>
                Mentor: <strong className="font-medium text-text-default">Tomasz Zieliński</strong>
              </p>
              <p>
                Uczeń: <strong className="font-medium text-text-default">Jan Kowalski</strong>
              </p>
              <div className="border-t border-border-divider my-tight pt-tight">
                <span className="text-text-muted">Kredyt sesji:</span>
                <p className="text-body font-medium text-text-default tabular-nums">
                  1 sesja pobrana z planu
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/Ekrany/U5 Szczegóły sesji',
  component: U5SessionDetailScreenView,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof U5SessionDetailScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StateConfirmedAhead: Story = {
  name: 'Stan: Ponad 12 h do sesji (Ahead)',
  args: {
    state: 'ahead_12h',
  },
};

export const StateImminent: Story = {
  name: 'Stan: Mniej niż 12 h do sesji (Imminent)',
  args: {
    state: 'imminent_less_12h',
  },
};

export const StateLiveRoom: Story = {
  name: 'Stan: Pokój wideo aktywny (Live)',
  args: {
    state: 'live_room',
  },
};
