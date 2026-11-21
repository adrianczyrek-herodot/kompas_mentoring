import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { type Filters, MentorSearch, noFilters } from '../../.storybook/examples/mentor-search';
import { fullscreen, ScreenShell } from '../../.storybook/examples/screen-shell';
import { mentors } from '../../.storybook/fixtures/kompas';
import { PageHeader } from '../product/page-header';

type Args = { status: 'ready' | 'loading' | 'error'; initialFilters: Filters };

function P2Screen({ status, initialFilters }: Args) {
  return (
    <ScreenShell role="student" current="search">
      <PageHeader
        title="Znajdź mentora"
        description="Porównaj mentorów i zarezerwuj tańszą sesję próbną 30 min, zanim wykupisz plan."
      />
      <MentorSearch mentors={mentors} status={status} initialFilters={initialFilters} />
    </ScreenShell>
  );
}

const meta = {
  title: 'Produkt/E2 Katalog i onboarding/Ekrany/P2 Wyszukiwarka mentorów',
  component: P2Screen,
  args: { status: 'ready', initialFilters: noFilters },
  argTypes: {
    status: { control: 'inline-radio', options: ['ready', 'loading', 'error'] },
    initialFilters: { control: false },
  },
  parameters: fullscreen,
} satisfies Meta<typeof P2Screen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Results: Story = { name: 'S — lista wyników' };
const careerUpTo200: Filters = { ...noFilters, category: 'Kariera w IT', price: [0, 200] };

export const Filtered: Story = {
  name: 'S — aktywne filtry',
  args: { initialFilters: careerUpTo200 },
};
export const Loading: Story = { name: 'L — ładowanie', args: { status: 'loading' } };
export const NoResults: Story = {
  name: 'E — brak mentorów dla filtrów',
  args: { initialFilters: { ...noFilters, category: 'Backend', price: [0, 200] } },
};
export const ErrorLoading: Story = { name: 'Er — błąd wczytania', args: { status: 'error' } };

export const ScreenTest: Story = {
  name: 'Test: h1, jeden main, usunięcie filtra',
  args: { initialFilters: careerUpTo200 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1, name: 'Znajdź mentora' })).toBeVisible();
    await expect(canvas.getAllByRole('main')).toHaveLength(1);
    await expect(canvas.getByText('3 mentorów')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '0–200 zł — usuń filtr' }));
    await expect(canvas.getByText('4 mentorów')).toBeVisible();
  },
};
