import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import { SessionCard, SessionCardSkeleton } from './session-card';

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/SessionCard',
  component: SessionCard,
  args: {
    participantName: 'Tomasz Zieliński',
    participantRole: 'Mentor',
    participantInitials: 'TZ',
    topic: 'Architektura mikrofrontendów i optymalizacja ładowania zasobów',
    dateTime: 'Czwartek, 27 listopada 2026, 17:00 – 18:00 (Europe/Warsaw)',
    status: 'confirmed',
    isRoomReady: false,
    onJoinRoom: fn(),
    onReschedule: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof SessionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Confirmed: Story = {};

export const RoomReady: Story = {
  name: 'Pokój gotowy do wejścia (< 15 min)',
  args: {
    isRoomReady: true,
  },
};

export const PendingApproval: Story = {
  name: 'Oczekuje na akceptację',
  args: {
    status: 'pending',
  },
};

export const Cancelled: Story = {
  name: 'Sesja odwołana',
  args: {
    status: 'cancelled',
  },
};

export const NarrowScreen: Story = {
  name: 'Ekran 320 px',
  render: (args) => (
    <ViewportFrame width={320}>
      <SessionCard {...args} isRoomReady />
    </ViewportFrame>
  ),
};

export const Loading: Story = {
  name: 'Stan ładowania (Skeleton)',
  render: () => <SessionCardSkeleton />,
};

export const ActionsTest: Story = {
  name: 'Test: kliknięcie akcji dołączenia i przełożenia',
  args: {
    isRoomReady: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const joinButton = canvas.getByRole('button', { name: /Dołącz do pokoju/i });
    await userEvent.click(joinButton);
    await expect(args.onJoinRoom).toHaveBeenCalledTimes(1);

    const rescheduleButton = canvas.getByRole('button', { name: 'Przełóż termin' });
    await userEvent.click(rescheduleButton);
    await expect(args.onReschedule).toHaveBeenCalledTimes(1);
  },
};
