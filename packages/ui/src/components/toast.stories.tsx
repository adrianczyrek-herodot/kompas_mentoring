import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { Button } from './button';
import { ToastProvider, useToast } from './toast';

const framed = { docs: { story: { inline: false, height: '320px' } } };

function Trigger({
  label,
  toast,
}: {
  label: string;
  toast: { title: string; description?: string; type?: string; timeout?: number };
}) {
  const manager = useToast();
  return (
    <Button variant="outline" onClick={() => manager.add(toast)}>
      {label}
    </Button>
  );
}

function AutoToast({ toast }: { toast: { title: string; description?: string; type?: string } }) {
  const manager = useToast();
  return (
    <Button
      variant="outline"
      ref={(node) => {
        if (node && !node.dataset['shown']) {
          node.dataset['shown'] = '1';
          manager.add({ ...toast, timeout: 0 });
        }
      }}
    >
      Pokaż ponownie
    </Button>
  );
}

const meta = {
  title: 'Komponenty bazowe/Komunikaty/Toast',
  render: () => (
    <ToastProvider closeLabel="Zamknij powiadomienie" regionLabel="Powiadomienia">
      <Trigger
        label="Zapisz dostępność"
        toast={{
          title: 'Zapisano',
          description: 'Dostępność na ten tydzień jest aktualna.',
          type: 'success',
        }}
      />
    </ToastProvider>
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Odmiany: sukces i informacja',
  parameters: framed,
  render: () => (
    <ToastProvider closeLabel="Zamknij powiadomienie" regionLabel="Powiadomienia">
      <div className="flex flex-wrap gap-inline">
        <AutoToast
          toast={{
            title: 'Zapisano',
            description: 'Dostępność na ten tydzień jest aktualna.',
            type: 'success',
          }}
        />
        <AutoToast
          toast={{
            title: 'Ten termin został właśnie zajęty',
            description: 'Wybierz inną godzinę — siatka jest już odświeżona.',
          }}
        />
      </div>
    </ToastProvider>
  ),
};

export const States: Story = {
  name: 'Macierz stanów: widoczny toast',
  parameters: {
    ...framed,
    docs: {
      ...framed.docs,
      description: {
        story:
          'Pojawia się na dole (na telefonie na całą szerokość), znika po 6 s albo po zamknięciu; najechanie lub fokus wstrzymuje odliczanie.',
      },
    },
  },
  render: () => (
    <ToastProvider closeLabel="Zamknij powiadomienie" regionLabel="Powiadomienia">
      <AutoToast
        toast={{
          title: 'Sesja przełożona',
          description: 'Nowy termin: czwartek, 27 listopada, 18:00.',
          type: 'success',
        }}
      />
    </ToastProvider>
  ),
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  parameters: framed,
  globals: { viewport: { value: 'mobile320', isRotated: false } },
  render: () => (
    <ToastProvider closeLabel="Zamknij powiadomienie" regionLabel="Powiadomienia">
      <AutoToast
        toast={{
          title: 'Przyjęliśmy prośbę o eksport danych',
          description:
            'Link do pobrania wyślemy na adres katarzyna.wisniewska@example.com, zwykle w ciągu doby.',
          type: 'success',
        }}
      />
    </ToastProvider>
  ),
};

export const ShowAnnounceClose: Story = {
  name: 'Test: pojawienie się, ogłoszenie i zamknięcie',
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Zapisz dostępność' }));
    const region = await screen.findByRole('region', { name: 'Powiadomienia' });
    await expect(region).toHaveAttribute('aria-live', 'polite');
    await waitFor(() => expect(within(region).getByText('Zapisano')).toBeVisible());
    // Base UI hides the close button from screen readers (Escape closes a focused toast).
    const close = region.querySelector<HTMLButtonElement>('[aria-label="Zamknij powiadomienie"]');
    await expect(close).not.toBeNull();
    if (close) await userEvent.click(close);
    await waitFor(() => expect(screen.queryByText('Zapisano')).not.toBeInTheDocument());
  },
};
