import type { Meta, StoryObj } from '@storybook/react-vite';
import { TZ } from '../../.storybook/fixtures/kompas';
import { OrderSummary } from './order-summary';

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/OrderSummary',
  component: OrderSummary,
  args: {
    mentorName: 'Kasia Nowicka',
    type: 'trial',
    startsAt: '2026-10-22T09:00:00+02:00',
    endsAt: '2026-10-22T09:30:00+02:00',
    timeZone: TZ,
    durationMinutes: 30,
    price: 4900n,
  },
} satisfies Meta<typeof OrderSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Trial: Story = { name: 'Sesja próbna z ceną' };
export const PlanWithoutRate: Story = {
  name: 'Kolejna sesja bez stawki mentora',
  args: { type: 'plan', durationMinutes: 60, price: null },
};
