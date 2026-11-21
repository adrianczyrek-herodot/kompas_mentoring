import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { agenda, TZ } from '../../.storybook/fixtures/kompas';
import { Link } from '../components/link';
import { TodayAgenda } from './today-agenda';

const onJoin = fn();
const onRetry = fn();

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/TodayAgenda',
  component: TodayAgenda,
  args: {
    items: agenda,
    timeZone: TZ,
    status: 'ready',
    onJoin,
    onRetry,
    emptyAction: <Link href="/mentor/kalendarz">Otwórz kalendarz</Link>,
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['ready', 'loading', 'error'] },
    items: { control: false },
    emptyAction: { control: false },
  },
  render: (args) => <TodayAgenda {...args} className="max-w-form" />,
} satisfies Meta<typeof TodayAgenda>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Loading: Story = { name: 'Ładowanie', args: { status: 'loading' } };
export const Empty: Story = { name: 'Pusto', args: { items: [] } };
export const ErrorLoading: Story = { name: 'Błąd', args: { status: 'error' } };

export const ManyItems: Story = {
  name: 'Dużo danych',
  args: {
    items: [
      ...agenda,
      ...['18:30', '19:30', '20:30'].map((time, index) => ({
        id: `x${String(index)}`,
        startsAt: `2026-10-20T${time}:00+02:00`,
        durationMin: 30 as const,
        type: 'trial' as const,
        status: 'scheduled' as const,
        withName: ['Paweł R.', 'Iga T.', 'Monika K.'][index] ?? 'Paweł R.',
        goal: 'Sesja próbna — ustalenie celu',
        joinOpen: false,
      })),
    ],
  },
};

export const Narrow: Story = {
  name: 'Długie teksty i 320 px',
  render: (args) => (
    <ViewportFrame width={320}>
      <TodayAgenda {...args} />
    </ViewportFrame>
  ),
};

export const JoinTest: Story = {
  name: 'Test: „Dołącz” tylko przy otwartym pokoju',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const join = canvas.getAllByRole('button', { name: 'Dołącz do sesji' });
    await expect(join).toHaveLength(1);
    onJoin.mockClear();
    const joinButton = join[0];
    if (joinButton) await userEvent.click(joinButton);
    await expect(onJoin).toHaveBeenCalledWith(expect.objectContaining({ withName: 'Adrian C.' }));
  },
};

export const RetryTest: Story = {
  name: 'Test: błąd sekcji z ponowieniem',
  args: { status: 'error' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent('Nie udało się wczytać');
    onRetry.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: 'Ponów' }));
    await expect(onRetry).toHaveBeenCalledOnce();
  },
};
