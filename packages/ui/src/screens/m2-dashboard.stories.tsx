import type { Meta, StoryObj } from '@storybook/react-vite';
import { Inbox } from 'lucide-react';
import { useState } from 'react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { fakeRequest } from '../../.storybook/examples/api';
import { DeclineDialog } from '../../.storybook/examples/decline-dialog';
import { fullscreen, ScreenShell } from '../../.storybook/examples/screen-shell';
import { withToasts } from '../../.storybook/examples/with-toasts';
import { agenda, requests, TZ } from '../../.storybook/fixtures/kompas';
import { Button } from '../components/button';
import { EmptyState } from '../components/empty-state';
import { ErrorState } from '../components/error-state';
import { Link } from '../components/link';
import { Skeleton } from '../components/skeleton';
import { useToast } from '../components/toast';
import { PageHeader } from '../product/page-header';
import { TodayAgenda } from '../product/today-agenda';
import { type TrialRequest, TrialRequestCard } from '../product/trial-request-card';

type Section = 'ready' | 'loading' | 'error' | 'empty';
type Args = { agendaState: Section; requestsState: Section };

function Requests({ state }: { state: Section }) {
  const toast = useToast();
  const [items, setItems] = useState(requests);
  const [declining, setDeclining] = useState<TrialRequest | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);
  const list = state === 'empty' ? [] : items;

  return (
    <section aria-labelledby="requests-h" className="flex flex-col gap-inline">
      <h2 id="requests-h" className="text-section-title font-semibold">
        Prośby o sesję próbną
      </h2>
      {state === 'loading' ? (
        <div aria-busy="true" className="flex flex-col gap-inline">
          <p className="sr-only">Wczytujemy prośby…</p>
          <Skeleton className="h-lh w-2/3" />
          <Skeleton className="h-lh w-full" />
        </div>
      ) : state === 'error' ? (
        <ErrorState
          titleAs="p"
          className="py-group"
          title="Nie udało się wczytać próśb"
          description="Pozostałe sekcje panelu działają. Spróbuj wczytać tę jeszcze raz."
          action={<Button variant="outline">Ponów</Button>}
        />
      ) : list.length === 0 ? (
        <EmptyState
          titleAs="p"
          className="py-group"
          icon={<Inbox />}
          title="Brak nowych próśb"
          description="Gdy uczeń poprosi o sesję próbną, zobaczysz ją tutaj i dostaniesz e-mail."
        />
      ) : (
        <ul>
          {list.map((request) => (
            <TrialRequestCard
              key={request.id}
              request={request}
              timeZone={TZ}
              accepting={accepting === request.id}
              onAccept={() => {
                setAccepting(request.id);
                void fakeRequest('success').then(() => {
                  setAccepting(null);
                  setItems((current) => current.filter((r) => r.id !== request.id));
                  toast.add({
                    title: 'Prośba przyjęta',
                    description: 'Sesja próbna jest umówiona.',
                  });
                });
              }}
              onDecline={() => {
                setDeclining(request);
              }}
            />
          ))}
        </ul>
      )}
      {declining ? (
        <DeclineDialog
          request={declining}
          open
          onOpenChange={(open) => {
            if (!open) setDeclining(null);
          }}
          onSubmit={async () => {
            const answer = await fakeRequest('success');
            if (answer.ok) {
              setItems((current) => current.filter((r) => r.id !== declining.id));
              toast.add({
                title: 'Prośba odrzucona',
                description: 'Uczeń dostał powód w e-mailu.',
              });
            }
            return answer;
          }}
        />
      ) : null}
    </section>
  );
}

function M2Screen({ agendaState, requestsState }: Args) {
  return (
    <ScreenShell navRole="mentor" current="dashboard">
      <PageHeader title="Panel" description="Co wymaga Twojej uwagi dzisiaj." />
      <div className="flex flex-col gap-section md:flex-row">
        <TodayAgenda
          className="md:flex-1"
          status={agendaState === 'empty' ? 'ready' : agendaState}
          items={agendaState === 'empty' ? [] : agenda}
          timeZone={TZ}
          emptyAction={<Link href="/mentor/kalendarz">Otwórz kalendarz</Link>}
        />
        <div className="md:flex-1">
          <Requests state={requestsState} />
        </div>
      </div>
    </ScreenShell>
  );
}

const sectionStates = ['ready', 'loading', 'error', 'empty'];

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/Ekrany/M2 Panel mentora',
  component: M2Screen,
  decorators: [withToasts],
  args: { agendaState: 'ready', requestsState: 'ready' },
  argTypes: {
    agendaState: { control: 'inline-radio', options: sectionStates },
    requestsState: { control: 'inline-radio', options: sectionStates },
  },
  parameters: fullscreen,
} satisfies Meta<typeof M2Screen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Typical: Story = { name: 'S — typowy dzień' };
export const NoSessions: Story = { name: 'E — brak sesji dzisiaj', args: { agendaState: 'empty' } };
export const NoRequests: Story = { name: 'E — brak próśb', args: { requestsState: 'empty' } };
export const Loading: Story = {
  name: 'L — ładowanie',
  args: { agendaState: 'loading', requestsState: 'loading' },
};
export const SectionError: Story = {
  name: 'Er — błąd jednej sekcji',
  args: { agendaState: 'error' },
};

export const DeclineTest: Story = {
  name: 'Test: odrzucenie prośby z powodem',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [first] = canvas.getAllByRole('button', { name: 'Odrzuć…' });
    if (!first) throw new Error('Expected a decline button');
    await userEvent.click(first);
    const dialog = await waitFor(() =>
      screen.getByRole('dialog', { name: 'Odrzucić prośbę: Paweł R.?' }),
    );
    await userEvent.click(within(dialog).getByRole('radio', { name: 'Termin mi nie pasuje' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Odrzuć prośbę' }));
    await expect(canvas.getByText(/^Paweł R\./)).toBeVisible();
    await waitFor(() => expect(canvas.queryByText(/^Paweł R\./)).toBeNull());
    await expect(canvas.getByText(/^Iga T\./)).toBeVisible();
  },
};
