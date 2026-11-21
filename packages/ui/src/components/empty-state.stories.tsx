import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarPlus, SearchX } from 'lucide-react';
import { expect, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { Button } from './button';
import { EmptyState } from './empty-state';

type Args = { title: string; description: string };

const meta = {
  title: 'Komponenty bazowe/Komunikaty/EmptyState',
  args: {
    title: 'Brak sesji dzisiaj',
    description: 'Uzupełnij dostępność na przyszły tydzień, żeby uczniowie mogli Cię zarezerwować.',
  },
  render: ({ title, description }) => (
    <EmptyState
      icon={<CalendarPlus aria-hidden="true" />}
      title={title}
      description={description}
      action={<Button>Dodaj dostępność</Button>}
    />
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Odmiany: „jeszcze nic tu nie ma” i „brak wyników dla filtrów”',
  render: () => (
    <div className="flex max-w-form flex-col gap-section">
      <EmptyState
        titleAs="h3"
        icon={<CalendarPlus aria-hidden="true" />}
        title="Nie masz jeszcze żadnej sesji"
        description="Znajdź mentora i umów pierwszą sesję próbną — 30 minut na poznanie się."
        action={<Button>Znajdź mentora</Button>}
      />
      <EmptyState
        titleAs="h3"
        icon={<SearchX aria-hidden="true" />}
        title="Brak mentorów dla tych filtrów"
        description="Najbardziej zawęża wynik filtr ceny do 100 zł."
        action={<Button variant="outline">Wyczyść filtr ceny</Button>}
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
          'EmptyState sam jest stanem „pusto” ekranu (E). Odmiany: z akcją i bez akcji (gdy użytkownik nie może nic zrobić, np. brak powiadomień).',
      },
    },
  },
  render: () => (
    <EmptyState
      titleAs="h3"
      title="Brak powiadomień"
      description="Napiszemy tu, gdy coś będzie wymagało Twojej uwagi."
    />
  ),
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <EmptyState
        titleAs="h3"
        icon={<SearchX aria-hidden="true" />}
        title="Brak mentorów dla tematu „Negocjacje wynagrodzenia w startupie”"
        description="Spróbuj szerszego tematu, np. „Negocjacje”, albo wyłącz filtr „tylko zweryfikowani”."
        action={
          <Button variant="outline" className="w-full">
            Wyczyść filtry
          </Button>
        }
      />
    </ViewportFrame>
  ),
};

export const HeadingAndAction: Story = {
  name: 'Test: tytuł jest nagłówkiem, jest następny krok',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Brak sesji dzisiaj' }),
    ).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Dodaj dostępność' })).toBeEnabled();
  },
};
