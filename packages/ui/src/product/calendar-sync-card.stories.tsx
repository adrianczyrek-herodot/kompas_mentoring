import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { CalendarSyncCard } from './calendar-sync-card';

const onConnect = fn();
const onDisconnect = fn();
const onReconnect = fn();

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/CalendarSyncCard',
  component: CalendarSyncCard,
  args: { status: 'disconnected', onConnect, onDisconnect, onReconnect },
  argTypes: {
    status: { control: 'inline-radio', options: ['disconnected', 'connected', 'error'] },
  },
} satisfies Meta<typeof CalendarSyncCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Disconnected: Story = { name: 'Rozłączony (start)' };

export const Connected: Story = {
  name: 'Połączony',
  args: { status: 'connected', lastSyncedAt: '2026-10-22T08:15:00+02:00' },
};

export const ErrorState: Story = {
  name: 'Er — błąd tokenu (fail-open)',
  args: {
    status: 'error',
    lastError: 'invalid_grant — odświeżenie tokenu nie powiodło się',
  },
};

export const Pending: Story = {
  name: 'Łączenie (pending)',
  args: { pending: true },
};

export const ConnectTest: Story = {
  name: 'Test: „Połącz”',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onConnect.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: 'Połącz' }));
    await expect(onConnect).toHaveBeenCalledTimes(1);
  },
};

export const ReconnectTest: Story = {
  name: 'Test: „Połącz ponownie” po błędzie',
  args: { status: 'error' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onReconnect.mockClear();
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Nie udało się odświeżyć kalendarza',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Połącz ponownie' }));
    await expect(onReconnect).toHaveBeenCalledTimes(1);
  },
};

export const DisconnectTest: Story = {
  name: 'Test: „Rozłącz”',
  args: { status: 'connected' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onDisconnect.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: 'Rozłącz' }));
    await expect(onDisconnect).toHaveBeenCalledTimes(1);
  },
};
