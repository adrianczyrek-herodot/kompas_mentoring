import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { fullscreen, ScreenShell } from '../../.storybook/examples/screen-shell';
import { SessionDetail, type SessionDetailProps } from '../../.storybook/examples/session-detail';
import { withToasts } from '../../.storybook/examples/with-toasts';
import { pastSessions, sessionFriday, sessionToday } from '../../.storybook/fixtures/kompas';
import { Link } from '../components/link';

function U5Screen(props: SessionDetailProps) {
  return (
    <ScreenShell role="student" current="sessions">
      <div>
        <Link href="/sesje">Wróć do moich sesji</Link>
      </div>
      <SessionDetail {...props} />
    </ScreenShell>
  );
}

const free = {
  session: sessionFriday,
  policy: 'free' as const,
  freeUntil: '2026-10-23T06:00:00+02:00',
  joinFrom: '2026-10-23T17:50:00+02:00',
};

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/Ekrany/U5 Szczegóły sesji',
  component: U5Screen,
  decorators: [withToasts],
  args: { status: 'ready', ...free },
  argTypes: {
    status: { control: 'inline-radio', options: ['ready', 'loading', 'not-found', 'error'] },
    policy: { control: 'inline-radio', options: ['free', 'late', 'started'] },
    session: { control: false },
  },
  parameters: fullscreen,
} satisfies Meta<typeof U5Screen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scheduled: Story = { name: 'S — scheduled, ≥ 12 h' };
export const Late: Story = {
  name: 'S — scheduled, < 12 h, pokój otwarty',
  args: { session: sessionToday, policy: 'late', joinOpen: true },
};
export const InProgress: Story = {
  name: 'S — in_progress (zmiana zablokowana)',
  args: { session: { ...sessionToday, status: 'in_progress' }, policy: 'started', joinOpen: true },
};
export const Completed: Story = {
  name: 'S — completed',
  args: { session: pastSessions[0] ?? sessionFriday },
};
export const Cancelled: Story = {
  name: 'S — cancelled',
  args: { session: pastSessions[2] ?? sessionFriday },
};
export const Loading: Story = { name: 'L — ładowanie', args: { status: 'loading' } };
export const NotFound: Story = { name: 'Er — 404/403', args: { status: 'not-found' } };
export const ErrorLoading: Story = { name: 'Er — błąd wczytania', args: { status: 'error' } };

export const ScreenTest: Story = {
  name: 'Test: jedno h1, powrót do listy',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    await expect(canvas.getByRole('link', { name: 'Wróć do moich sesji' })).toHaveAttribute(
      'href',
      '/sesje',
    );
  },
};
