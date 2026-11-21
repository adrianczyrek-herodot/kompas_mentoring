import type { Meta, StoryObj } from '@storybook/react-vite';
import { RotateCw } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { Button } from './button';
import { ErrorState } from './error-state';

type Args = { title: string; description: string };

const meta = {
  title: 'Komponenty bazowe/Komunikaty/ErrorState',
  args: {
    title: 'Nie udało się wczytać listy',
    description: 'Sprawdź połączenie z internetem i spróbuj ponownie.',
  },
  render: ({ title, description }) => (
    <ErrorState
      title={title}
      description={description}
      action={
        <Button variant="outline">
          <RotateCw aria-hidden="true" />
          Ponów
        </Button>
      }
    />
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Odmiany: cały ekran i sekcja panelu',
  render: () => (
    <div className="flex max-w-form flex-col gap-section">
      <ErrorState
        titleAs="h3"
        title="Profil niedostępny"
        description="Ten profil mógł zostać zawieszony. Zobacz podobnych mentorów."
        action={<Button variant="outline">Zobacz podobnych mentorów</Button>}
      />
      <ErrorState
        titleAs="h3"
        className="py-group"
        title="Nie udało się wczytać próśb o sesję"
        description="Pozostałe sekcje panelu działają."
        action={<Button size="sm" variant="outline">Ponów</Button>}
      />
    </div>
  ),
};

export const States: Story = {
  name: 'Macierz stanów',
  parameters: {
    docs: {
      description: {
        story:
          'ErrorState sam jest stanem „błąd” (Er). Po „Ponów” sekcja przechodzi w ładowanie (Skeleton), potem w treść albo znowu w błąd.',
      },
    },
  },
  render: () => (
    <ErrorState
      titleAs="h3"
      title="Nie udało się wczytać kalendarza"
      description="Spróbuj ponownie za chwilę."
    />
  ),
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <ErrorState
        titleAs="h3"
        title="Nie udało się połączyć z Kalendarzem Google dla adresu katarzyna.wisniewska@example.com"
        description="Połącz kalendarz ponownie. Do tego czasu terminy z Google nie blokują Twojej dostępności."
        action={<Button variant="outline" className="w-full">Połącz ponownie</Button>}
      />
    </ViewportFrame>
  ),
};

function RetryDemo() {
  const [state, setState] = useState<'error' | 'ready'>('error');
  return state === 'error' ? (
    <ErrorState
      title="Nie udało się wczytać listy"
      action={
        <Button variant="outline" onClick={() => setState('ready')}>
          Ponów
        </Button>
      }
    />
  ) : (
    <p className="text-body">Lista mentorów wczytana.</p>
  );
}

export const RetryRecovers: Story = {
  name: 'Test: błąd ogłaszany, „Ponów” przywraca treść',
  render: () => <RetryDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent('Nie udało się wczytać listy');
    await userEvent.click(canvas.getByRole('button', { name: 'Ponów' }));
    await waitFor(() => expect(canvas.getByText('Lista mentorów wczytana.')).toBeVisible());
  },
};
