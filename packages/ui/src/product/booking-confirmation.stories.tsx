import type { Meta, StoryObj } from '@storybook/react-vite';
import { TZ } from '../../.storybook/fixtures/kompas';
import { BookingConfirmation } from './booking-confirmation';

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/BookingConfirmation',
  component: BookingConfirmation,
  args: {
    status: 'requested',
    startsAt: '2026-10-22T09:00:00+02:00',
    endsAt: '2026-10-22T09:30:00+02:00',
    timeZone: TZ,
    acceptDeadlineAt: '2026-10-21T09:00:00+02:00',
    icsHref: '#ics',
    detailsHref: '#sesja',
  },
} satisfies Meta<typeof BookingConfirmation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Requested: Story = { name: 'Próbna — prośba wysłana' };
export const Scheduled: Story = {
  name: 'Kolejna sesja — umówiona',
  args: { status: 'scheduled', acceptDeadlineAt: null },
};
