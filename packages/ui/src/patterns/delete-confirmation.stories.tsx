import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarOff, CircleX } from 'lucide-react';
import { useState } from 'react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { type ApiScenario, apiScenarios, fakeRequest } from '../../.storybook/examples/api';
import { withToasts } from '../../.storybook/examples/with-toasts';
import { Alert, AlertDescription, AlertTitle } from '../components/alert';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/alert-dialog';
import { Button } from '../components/button';
import { EmptyState } from '../components/empty-state';
import { useToast } from '../components/toast';

/** Availability exceptions in M3 (E3-S2 „wyjątki”); example rows, not from the mockups. */
const initialExceptions = [
  { id: 'e1', label: 'pt., 24 paź · cały dzień', note: 'Konferencja' },
  { id: 'e2', label: 'sob., 1 lis · cały dzień', note: 'Wszystkich Świętych' },
];

function ExceptionList({ api, startOpen = false }: { api: ApiScenario; startOpen?: boolean }) {
  const toast = useToast();
  const [items, setItems] = useState(initialExceptions);
  const [target, setTarget] = useState<(typeof initialExceptions)[number] | null>(
    startOpen ? (initialExceptions[0] ?? null) : null,
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    if (!target || pending) return;
    setPending(true);
    setError(null);
    const answer = await fakeRequest(api);
    setPending(false);
    if (answer.ok) {
      setItems((list) => list.filter((item) => item.id !== target.id));
      toast.add({
        title: 'Usunięto wyjątek',
        description: `${target.label} — znów dostępny do rezerwacji.`,
      });
      setTarget(null);
    } else {
      setError(
        answer.kind === 'offline'
          ? 'Brak połączenia z internetem. Wyjątek nadal obowiązuje — spróbuj ponownie.'
          : 'Nie udało się usunąć. Wyjątek nadal obowiązuje — spróbuj ponownie za chwilę.',
      );
    }
  };

  return (
    <section aria-labelledby="exceptions-h" className="flex max-w-form flex-col gap-inline">
      <h2 id="exceptions-h" className="text-section-title font-semibold">
        Wyjątki w dostępności
      </h2>
      {items.length === 0 ? (
        <EmptyState
          titleAs="p"
          icon={<CalendarOff />}
          title="Brak wyjątków"
          description="Dodaj wyjątek, gdy w danym dniu nie możesz prowadzić sesji."
        />
      ) : (
        <ul>
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-group border-b border-border-divider py-row-y"
            >
              <div className="flex flex-col">
                <span className="text-body-dense font-medium">{item.label}</span>
                <span className="text-meta text-text-muted">{item.note}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTarget(item);
                }}
              >
                Usuń<span className="sr-only"> wyjątek {item.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
      <AlertDialog
        open={target !== null}
        onOpenChange={(open) => {
          if (!open && !pending) {
            setTarget(null);
            setError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć wyjątek „{target?.label}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Te godziny wrócą do Twojej dostępności i uczniowie będą mogli je zarezerwować.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error ? (
            <Alert variant="danger" role="alert">
              <CircleX aria-hidden="true" />
              <AlertTitle>Wyjątek nie został usunięty</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogFooter>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => {
                setTarget(null);
              }}
            >
              Zostaw wyjątek
            </Button>
            <Button variant="destructive" loading={pending} onClick={() => void remove()}>
              Usuń wyjątek
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

const framed = { docs: { story: { inline: false, height: '420px' } } };

const meta = {
  title: 'Wzorce/Potwierdzenie usunięcia',
  component: ExceptionList,
  decorators: [withToasts],
  args: { api: 'success', startOpen: false },
  argTypes: { api: { control: 'inline-radio', options: apiScenarios, name: 'Odpowiedź API' } },
  parameters: {
    ...framed,
    docs: {
      ...framed.docs,
      description: {
        component:
          'Usunięcie wyjątku w dostępności (M3, E3-S2). Nazwa obiektu w pytaniu, skutek w opisie, rezygnacja pierwsza i z fokusem, przycisk usuwania opisany czasownikiem i obiektem („Usuń wyjątek”), nie „OK”. Sukces po odpowiedzi serwera; przy błędzie dialog zostaje.',
      },
    },
  },
} satisfies Meta<typeof ExceptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = { name: 'Lista (dialog zamknięty)' };
export const Open: Story = { name: 'Dialog otwarty', args: { startOpen: true } };

async function openFirst(canvasElement: HTMLElement) {
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Usuń wyjątek pt., 24 paź · cały dzień' }),
  );
  return waitFor(() => screen.getByRole('alertdialog'));
}

export const ConfirmTest: Story = {
  name: 'Test: nazwa w pytaniu, fokus na rezygnacji, usunięcie',
  play: async ({ canvasElement }) => {
    const dialog = await openFirst(canvasElement);
    await expect(dialog).toHaveAccessibleName('Usunąć wyjątek „pt., 24 paź · cały dzień”?');
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Zostaw wyjątek' })).toHaveFocus(),
    );
    await userEvent.click(within(dialog).getByRole('button', { name: 'Usuń wyjątek' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await expect(await screen.findByText('Usunięto wyjątek')).toBeVisible();
    await expect(within(canvasElement).getAllByRole('listitem')).toHaveLength(1);
  },
};

export const EscapeTest: Story = {
  name: 'Test: Escape rezygnuje bez usuwania',
  play: async ({ canvasElement }) => {
    await openFirst(canvasElement);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await expect(within(canvasElement).getAllByRole('listitem')).toHaveLength(2);
  },
};

export const PendingTest: Story = {
  name: 'Usuwanie (oczekiwanie)',
  args: { api: 'pending' },
  play: async ({ canvasElement }) => {
    const dialog = await openFirst(canvasElement);
    const confirm = within(dialog).getByRole('button', { name: 'Usuń wyjątek' });
    await userEvent.click(confirm);
    await waitFor(() => expect(confirm).toHaveAttribute('aria-busy', 'true'));
    await expect(within(dialog).getByRole('button', { name: 'Zostaw wyjątek' })).toBeDisabled();
  },
};

export const ServerErrorTest: Story = {
  name: 'Błąd serwera',
  args: { api: 'server-error' },
  play: async ({ canvasElement }) => {
    const dialog = await openFirst(canvasElement);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Usuń wyjątek' }));
    await expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Wyjątek nie został usunięty',
    );
  },
};

export const OfflineTest: Story = {
  name: 'Brak sieci',
  args: { api: 'offline' },
  play: async ({ canvasElement }) => {
    const dialog = await openFirst(canvasElement);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Usuń wyjątek' }));
    await expect(await within(dialog).findByRole('alert')).toHaveTextContent('Brak połączenia');
  },
};
