import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarX } from 'lucide-react';
import { expect, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { pastSessions, sessions, sessionTrial, TZ } from '../../.storybook/fixtures/kompas';
import { Button } from '../components/button';
import { EmptyState } from '../components/empty-state';
import { ErrorState } from '../components/error-state';
import { SessionListItem, SessionListItemSkeleton } from './session-list-item';

const first = sessionTrial;

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/SessionListItem',
  component: SessionListItem,
  args: { session: first, timeZone: TZ, href: `/sesje/${first.id}` },
  argTypes: { session: { control: false }, action: { control: false } },
  render: (args) => (
    <ul className="max-w-content">
      <SessionListItem {...args} />
    </ul>
  ),
} satisfies Meta<typeof SessionListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ManyItems: Story = {
  name: 'Dużo danych (nadchodzące i minione)',
  render: () => (
    <ul aria-label="Sesje" className="max-w-content">
      {[...sessions, ...pastSessions].map((session) => (
        <SessionListItem
          key={session.id}
          session={session}
          timeZone={TZ}
          href={`/sesje/${session.id}`}
        />
      ))}
    </ul>
  ),
};

export const Statuses: Story = {
  name: 'Wszystkie statusy',
  render: () => (
    <ul className="max-w-content">
      {(
        [
          'requested',
          'scheduled',
          'in_progress',
          'completed',
          'cancelled',
          'no_show',
          'disputed',
        ] as const
      ).map((status) => (
        <SessionListItem
          key={status}
          session={{ ...first, id: status, status }}
          timeZone={TZ}
          href={`/sesje/${first.id}`}
        />
      ))}
    </ul>
  ),
};

export const Loading: Story = {
  name: 'Ładowanie',
  render: () => (
    <ul aria-busy="true" aria-label="Wczytujemy sesje" className="max-w-content">
      <SessionListItemSkeleton />
      <SessionListItemSkeleton />
      <SessionListItemSkeleton />
    </ul>
  ),
};

export const Empty: Story = {
  name: 'Pusto',
  parameters: {
    docs: {
      description: { story: 'KONCEPCJA §U4 E: „Nie masz jeszcze sesji” + CTA do wyszukiwarki.' },
    },
  },
  render: () => (
    <EmptyState
      titleAs="p"
      icon={<CalendarX />}
      title="Nie masz jeszcze sesji"
      description="Znajdź mentora i zarezerwuj sesję próbną — 30 minut na poznanie się i ustalenie celu."
      action={<Button>Znajdź mentora</Button>}
    />
  ),
};

export const ErrorLoading: Story = {
  name: 'Błąd',
  render: () => (
    <ErrorState
      titleAs="p"
      title="Nie udało się wczytać sesji"
      description="Sprawdź połączenie i spróbuj ponownie."
      action={<Button variant="outline">Ponów</Button>}
    />
  ),
};

export const LongContent: Story = {
  name: 'Długie teksty i 320 px',
  render: () => (
    <ViewportFrame width={320}>
      <ul>
        <SessionListItem
          session={{
            ...first,
            withName: 'Małgorzata Brzęczyszczykiewicz-Wróblewska',
            goal: 'Mam rozmowę techniczną za 2 tygodnie w scale-upie, chcę przećwiczyć zadanie live coding w React, a potem omówić, jak opowiadać o projektach z poprzedniej pracy bez zdradzania tajemnic firmy.',
          }}
          timeZone={TZ}
          href="/sesje/s3"
        />
      </ul>
    </ViewportFrame>
  ),
};

export const ContentTest: Story = {
  name: 'Test: link do szczegółów, status słowem',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Ewa Sadowska' })).toHaveAttribute(
      'href',
      '/sesje/s3',
    );
    await expect(canvas.getByText('Potwierdzona')).toBeVisible();
    await expect(canvas.getByText('śr., 21 paź')).toBeVisible();
  },
};
