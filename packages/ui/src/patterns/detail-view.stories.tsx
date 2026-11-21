import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { SessionDetail } from '../../.storybook/examples/session-detail';
import { withToasts } from '../../.storybook/examples/with-toasts';
import { pastSessions, sessionFriday, sessionToday } from '../../.storybook/fixtures/kompas';

const onRetry = fn();
const completed = pastSessions[0] ?? sessionFriday;

const meta = {
  title: 'Wzorce/Widok szczegółów',
  component: SessionDetail,
  decorators: [withToasts],
  args: {
    status: 'ready',
    session: sessionFriday,
    policy: 'free',
    freeUntil: '2026-10-23T06:00:00+02:00',
    joinOpen: false,
    joinFrom: '2026-10-23T17:50:00+02:00',
    onRetry,
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['ready', 'loading', 'not-found', 'error'] },
    policy: { control: 'inline-radio', options: ['free', 'late', 'started'] },
    session: { control: false },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Szczegóły sesji U5 (E3-S5). Najważniejsze informacje (kto, kiedy w strefie ucznia, cel) i główna akcja („Dołącz”) bez przewijania; jeden komunikat dla „nie istnieje” i „brak dostępu”, żeby nie zdradzać, czy cudza sesja istnieje.',
      },
    },
  },
} satisfies Meta<typeof SessionDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = { name: 'Załadowany' };

export const RoomOpen: Story = {
  name: 'Pokój otwarty (główna akcja aktywna)',
  args: { session: sessionToday, policy: 'late', joinOpen: true },
};

export const Completed: Story = { name: 'Sesja zakończona', args: { session: completed } };

export const Loading: Story = { name: 'Ładowanie', args: { status: 'loading' } };

export const NotFound: Story = {
  name: 'Nie istnieje albo brak dostępu',
  args: { status: 'not-found' },
};

export const ErrorLoading: Story = { name: 'Błąd', args: { status: 'error' } };

export const Narrow: Story = {
  name: 'Długie teksty i 320 px',
  render: (args) => (
    <ViewportFrame width={320}>
      <SessionDetail
        {...args}
        session={{
          ...sessionFriday,
          withName: 'Małgorzata Brzęczyszczykiewicz-Wróblewska',
          goal: 'Testy jednostkowe hooków: jak testować useCheckoutForm bez mockowania połowy aplikacji i kiedy lepiej napisać test integracyjny.',
        }}
      />
    </ViewportFrame>
  ),
};

export const AboveTheFoldTest: Story = {
  name: 'Test: h1, termin i główna akcja na górze',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', { level: 1, name: 'Sesja — Kasia Nowicka' });
    const join = canvas.getByRole('button', { name: 'Dołącz do sesji' });
    await expect(heading).toBeVisible();
    await expect(canvas.getByText('pt., 23 paź, 18:00')).toBeVisible();
    await expect(join.getBoundingClientRect().bottom).toBeLessThan(window.innerHeight);
    await expect(join).toHaveAccessibleDescription(/Pokój otworzy się 10 minut przed startem/);
  },
};

export const NotFoundTest: Story = {
  name: 'Test: brak dostępu prowadzi do listy',
  args: { status: 'not-found' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Nie znaleźliśmy tej sesji' }),
    ).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Przejdź do moich sesji' })).toHaveAttribute(
      'href',
      '/sesje',
    );
  },
};

export const RetryTest: Story = {
  name: 'Test: błąd z ponowieniem',
  args: { status: 'error' },
  play: async ({ canvasElement }) => {
    onRetry.mockClear();
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Ponów' }));
    await expect(onRetry).toHaveBeenCalledOnce();
  },
};
