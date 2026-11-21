import type { Meta, StoryObj } from '@storybook/react-vite';
import { Inbox } from 'lucide-react';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { requestPawel, requests, TZ } from '../../.storybook/fixtures/kompas';
import { Button } from '../components/button';
import { EmptyState } from '../components/empty-state';
import { ErrorState } from '../components/error-state';
import { Skeleton } from '../components/skeleton';
import { TrialRequestCard } from './trial-request-card';

const first = requestPawel;
const onAccept = fn();
const onDecline = fn();

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/TrialRequestCard',
  component: TrialRequestCard,
  args: { request: first, timeZone: TZ, onAccept, onDecline, accepting: false },
  argTypes: { request: { control: false } },
  render: (args) => (
    <ul className="max-w-form">
      <TrialRequestCard {...args} />
    </ul>
  ),
} satisfies Meta<typeof TrialRequestCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Accepting: Story = { name: 'Wysyłanie akceptacji', args: { accepting: true } };

export const ManyRequests: Story = {
  name: 'Dużo danych',
  render: (args) => (
    <ul aria-label="Prośby o sesję próbną" className="max-w-form">
      {requests.map((request) => (
        <TrialRequestCard key={request.id} {...args} request={request} />
      ))}
    </ul>
  ),
};

export const Loading: Story = {
  name: 'Ładowanie',
  render: () => (
    <ul
      aria-busy="true"
      aria-label="Wczytujemy prośby"
      className="flex max-w-form flex-col gap-inline"
    >
      {[0, 1].map((row) => (
        <li
          key={row}
          aria-hidden="true"
          className="flex flex-col gap-tight border-b border-border-divider py-row-y"
        >
          <Skeleton className="h-lh w-1/2" />
          <Skeleton className="h-lh w-full" />
          <Skeleton className="h-control-sm w-1/3" />
        </li>
      ))}
    </ul>
  ),
};

export const Empty: Story = {
  name: 'Pusto',
  render: () => (
    <EmptyState
      titleAs="p"
      icon={<Inbox />}
      title="Brak nowych próśb"
      description="Gdy uczeń poprosi o sesję próbną, zobaczysz ją tutaj i dostaniesz e-mail."
    />
  ),
};

export const ErrorLoading: Story = {
  name: 'Błąd',
  render: () => (
    <ErrorState
      titleAs="p"
      title="Nie udało się wczytać próśb"
      description="Pozostałe sekcje panelu działają. Spróbuj wczytać tę jeszcze raz."
      action={<Button variant="outline">Ponów</Button>}
    />
  ),
};

export const LongContent: Story = {
  name: 'Długie teksty i 320 px',
  render: (args) => (
    <ViewportFrame width={320}>
      <ul>
        <TrialRequestCard
          {...args}
          request={{
            ...first,
            student: 'Małgorzata B.-W.',
            goal: 'Mam rozmowę techniczną za 2 tygodnie w scale-upie, chcę przećwiczyć zadanie live coding w React i dowiedzieć się, jak mówić o decyzjach architektonicznych, żeby rekruter zrozumiał, dlaczego wybrałam takie, a nie inne rozwiązanie w projekcie z poprzedniej pracy.',
          }}
        />
      </ul>
    </ViewportFrame>
  ),
};

const AcceptFlow = () => {
  const [accepting, setAccepting] = useState(false);
  return (
    <ul className="max-w-form">
      <TrialRequestCard
        request={first}
        timeZone={TZ}
        accepting={accepting}
        onAccept={() => {
          setAccepting(true);
          onAccept();
        }}
        onDecline={onDecline}
      />
    </ul>
  );
};

export const AcceptTest: Story = {
  name: 'Test: akceptacja blokuje drugie kliknięcie',
  render: () => <AcceptFlow />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const accept = canvas.getByRole('button', { name: 'Przyjmij' });
    await expect(accept).toHaveAccessibleDescription(/Paweł R\./);
    onAccept.mockClear();
    await userEvent.click(accept);
    await userEvent.click(accept);
    await expect(onAccept).toHaveBeenCalledOnce();
    await waitFor(() => expect(accept).toHaveAttribute('aria-busy', 'true'));
    await expect(canvas.getByRole('button', { name: 'Odrzuć…' })).toBeDisabled();
  },
};
