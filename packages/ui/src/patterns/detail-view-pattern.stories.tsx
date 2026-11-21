import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowLeft, Calendar, ShieldAlert } from 'lucide-react';
import * as React from 'react';
import { expect, within } from 'storybook/test';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Card, CardContent } from '../components/card';
import { EmptyState } from '../components/empty-state';
import { Skeleton } from '../components/skeleton';

function DetailViewDemo({ mode = 'found' }: { mode?: 'found' | 'not_found' | 'loading' }) {
  if (mode === 'loading') {
    return (
      <div className="max-w-content space-y-group p-panel" aria-busy="true">
        <Skeleton className="h-6 w-32 rounded-control" />
        <div className="flex flex-col gap-group sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-tight">
            <Skeleton className="h-8 w-64 rounded-control" />
            <Skeleton className="h-4 w-48 rounded-control" />
          </div>
          <Skeleton className="h-10 w-44 rounded-control" />
        </div>
        <Skeleton className="h-48 w-full rounded-panel" />
      </div>
    );
  }

  if (mode === 'not_found') {
    return (
      <div className="max-w-content p-panel">
        <EmptyState
          icon={<ShieldAlert className="size-icon-lg text-text-muted" />}
          title="Sesja nie istnieje albo nie masz do niej dostępu"
          description="Podany adres spotkania jest nieprawidłowy, sesja została usunięta lub nie jesteś jej uczestnikiem."
          action={
            <Button variant="outline" className="gap-tight">
              <ArrowLeft className="size-icon-sm" />
              Wróć do listy moich sesji
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-content space-y-section p-panel">
      {/* Above the fold: najważniejsza informacja i główna akcja bez przewijania */}
      <div className="flex flex-col gap-group border-b border-border-divider pb-group sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-tight">
          <div className="flex items-center gap-inline">
            <span className="text-meta text-text-muted">Szczegóły sesji #B-1082</span>
            <Badge variant="success">Potwierdzona</Badge>
          </div>
          <h1 className="text-page-title font-medium text-text-default">
            Konsultacja architektury mikrofrontendów
          </h1>
          <p className="flex items-center gap-tight text-meta text-text-muted tabular-nums">
            <Calendar className="size-icon-sm" />
            Czwartek, 27 listopada 2026, 17:00 – 18:00 (Europe/Warsaw)
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-inline">
          <Button variant="outline">Przełóż termin</Button>
          <Button>Dołącz do pokoju wideo</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-group sm:grid-cols-3">
        <Card className="p-panel border-border-divider bg-surface-panel sm:col-span-2">
          <CardContent className="space-y-group p-0">
            <h2 className="text-section-title font-medium text-text-default">
              Cel i notatki do spotkania
            </h2>
            <p className="text-body text-text-default">
              Omówienie migracji monolitu Next.js do modułowej architektury z niezależnymi
              pakietami, współdzielonym design systemem i izolacją domenową.
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
              <span className="text-text-muted">Płatność z portfela:</span>
              <p className="text-body font-medium text-text-default tabular-nums">180,00 zł</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const meta = {
  title: 'Wzorce/Widok szczegółów',
  component: DetailViewDemo,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof DetailViewDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: '1. Główne informacje i akcja bez przewijania',
  args: {
    mode: 'found',
  },
};

export const NotFoundOrAccessDenied: Story = {
  name: '2. Nie istnieje albo brak dostępu',
  args: {
    mode: 'not_found',
  },
};

export const LoadingState: Story = {
  name: '3. Stan ładowania (Skeleton)',
  args: {
    mode: 'loading',
  },
};

export const NavigationTest: Story = {
  name: 'Test: obecność głównej akcji above the fold',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const joinBtn = canvas.getByRole('button', { name: 'Dołącz do pokoju wideo' });
    await expect(joinBtn).toBeVisible();
  },
};
