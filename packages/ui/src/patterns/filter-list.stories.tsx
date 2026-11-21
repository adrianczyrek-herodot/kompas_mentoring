import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarX } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { type Filters, MentorSearch, noFilters } from '../../.storybook/examples/mentor-search';
import { longMentor, mentors } from '../../.storybook/fixtures/kompas';
import { Button } from '../components/button';
import { EmptyState } from '../components/empty-state';

const onRetry = fn();
const frontendVerified: Filters = { ...noFilters, category: 'Frontend', verifiedOnly: true };
const tooNarrow: Filters = { ...noFilters, category: 'Backend', price: [0, 200] };

const meta = {
  title: 'Wzorce/Lista z filtrami',
  component: MentorSearch,
  args: { mentors, status: 'ready', onRetry },
  argTypes: {
    status: { control: 'inline-radio', options: ['ready', 'loading', 'error'] },
    mentors: { control: false },
    initialFilters: { control: false },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Wyszukiwarka mentorów P2 (E2-S5). Licznik wyników, aktywne filtry widoczne i usuwalne jednym kliknięciem, osobny stan „brak wyników dla filtrów” (z „Wyczyść filtr X” dla filtra najbardziej zawężającego) i osobny „jeszcze nic tu nie ma” (z akcją utworzenia). Poniżej 768 px filtry w panelu dolnym.',
      },
    },
  },
} satisfies Meta<typeof MentorSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Results: Story = { name: 'Wyniki' };

export const WithActiveFilters: Story = {
  name: 'Aktywne filtry',
  args: { initialFilters: frontendVerified },
};

export const Loading: Story = { name: 'Ładowanie', args: { status: 'loading' } };

export const ErrorLoading: Story = { name: 'Błąd', args: { status: 'error' } };

export const NoResultsForFilters: Story = {
  name: 'Brak wyników dla filtrów',
  args: { initialFilters: tooNarrow },
};

export const NothingYet: Story = {
  name: 'Jeszcze nic tu nie ma (U4)',
  parameters: {
    docs: {
      description: {
        story:
          'Inny stan niż „brak wyników”: użytkownik nic jeszcze nie utworzył, więc filtry nie mają sensu — zamiast nich jedna akcja utworzenia (KONCEPCJA §U4 E).',
      },
    },
  },
  render: () => (
    <EmptyState
      titleAs="h2"
      icon={<CalendarX />}
      title="Nie masz jeszcze sesji"
      description="Znajdź mentora i zarezerwuj sesję próbną — 30 minut na poznanie się i ustalenie celu."
      action={<Button>Znajdź mentora</Button>}
    />
  ),
};

export const ManyResults: Story = {
  name: 'Dużo danych i długie teksty',
  args: {
    mentors: [...mentors, longMentor, ...mentors.map((m) => ({ ...m, id: `${m.id}-2` }))],
  },
};

export const Narrow: Story = {
  name: 'Wąski ekran 320 px',
  render: (args) => (
    <ViewportFrame width={320}>
      <MentorSearch {...args} initialFilters={frontendVerified} />
    </ViewportFrame>
  ),
};

export const RemoveFilterTest: Story = {
  name: 'Test: usunięcie filtra zmienia licznik',
  args: { initialFilters: frontendVerified },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('1 mentor')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Frontend — usuń filtr' }));
    await expect(canvas.getByText('5 mentorów')).toBeVisible();
    await expect(canvas.getAllByRole('article')).toHaveLength(5);
  },
};

export const ClearNarrowestTest: Story = {
  name: 'Test: „Wyczyść filtr X” przywraca wyniki',
  args: { initialFilters: tooNarrow },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { name: 'Brak mentorów dla tych filtrów' }),
    ).toBeVisible();
    await expect(canvas.getByText('0 mentorów')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Wyczyść filtr: Backend' }));
    await expect(canvas.getByText('4 mentorów')).toBeVisible();
  },
};

export const RetryTest: Story = {
  name: 'Test: błąd z ponowieniem',
  args: { status: 'error' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onRetry.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: 'Ponów' }));
    await expect(onRetry).toHaveBeenCalledOnce();
  },
};
