import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { TodayAgenda, TodayAgendaSkeleton } from './today-agenda';

const sampleItems = [
  {
    id: 'a1',
    timeRange: '16:00 – 17:00',
    studentName: 'Krzysztof Kozłowski',
    topic: 'Konsultacja architektury mikroserwisów i kolejki RabbitMQ',
  },
  {
    id: 'a2',
    timeRange: '18:30 – 19:00',
    studentName: 'Zofia Kamińska',
    topic: 'Sesja próbna: omówienie portfolio i plan mentoringowy',
    isNow: true,
  },
];

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/TodayAgenda',
  component: TodayAgenda,
  args: {
    items: sampleItems,
    dateTitle: 'Dzisiaj, 25 listopada',
    onJoinRoom: fn(),
  },
} satisfies Meta<typeof TodayAgenda>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSessions: Story = {};

export const Empty: Story = {
  name: 'Brak sesji na dziś (stan pusty)',
  args: {
    items: [],
  },
};

export const Loading: Story = {
  name: 'Stan ładowania (Skeleton)',
  render: () => <TodayAgendaSkeleton />,
};

export const JoinRoomTest: Story = {
  name: 'Test: kliknięcie wejścia do pokoju',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button', { name: /Pokój sesji/i });
    await userEvent.click(buttons[0]);
    await expect(args.onJoinRoom).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }));
  },
};
