import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { sessionFriday, sessionToday, TZ } from '../../.storybook/fixtures/kompas';
import { Link } from '../components/link';
import { NextSessionCard } from './next-session-card';

const closedArgs = {
  session: sessionFriday,
  joinOpen: false,
  joinFrom: '2026-10-23T17:50:00+02:00',
};
const next = sessionToday;
const onJoin = fn();

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/NextSessionCard',
  component: NextSessionCard,
  args: {
    session: next,
    timeZone: TZ,
    joinOpen: true,
    joinFrom: '2026-10-20T13:55:00+02:00',
    onJoin,
    secondary: <Link href="/sesje/s1">Szczegóły sesji</Link>,
  },
  argTypes: { session: { control: false }, secondary: { control: false } },
  render: (args) => <NextSessionCard {...args} className="max-w-form" />,
} satisfies Meta<typeof NextSessionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const BeforeRoomOpens: Story = {
  name: 'Zablokowane: pokój jeszcze zamknięty',
  args: closedArgs,
};

export const Narrow: Story = {
  name: 'Długie teksty i 320 px',
  render: (args) => (
    <ViewportFrame width={320}>
      <NextSessionCard
        {...args}
        session={{
          ...next,
          goal: 'Review architektury komponentów w projekcie portfolio: podział na moduły, testy formularzy i to, jak opisać decyzje w README, żeby rekruter je zrozumiał.',
        }}
      />
    </ViewportFrame>
  ),
};

export const JoinTest: Story = {
  name: 'Test: „Dołącz” przy otwartym pokoju',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onJoin.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: 'Dołącz do sesji' }));
    await expect(onJoin).toHaveBeenCalledOnce();
  },
};

export const ClosedRoomTest: Story = {
  name: 'Test: zamknięty pokój — przycisk osiągalny, powód w opisie',
  args: closedArgs,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const closed = canvas.getByRole('button', { name: 'Dołącz do sesji' });
    await expect(closed).toHaveAttribute('aria-disabled', 'true');
    await expect(closed).toHaveAccessibleDescription(
      'Pokój otworzy się o 17:50, 10 minut przed startem.',
    );
    onJoin.mockClear();
    await userEvent.click(closed);
    await expect(onJoin).not.toHaveBeenCalled();
  },
};
