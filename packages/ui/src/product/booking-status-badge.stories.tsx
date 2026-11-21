import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { StateMatrix } from '../../.storybook/blocks/component-docs';
import { type BookingStatus, BookingStatusBadge } from './booking-status-badge';

const statuses: { status: BookingStatus; when: string }[] = [
  { status: 'requested', when: 'Sesja próbna czeka na decyzję mentora (do 24 h, E3-S7)' },
  { status: 'scheduled', when: 'Umówiona, przed startem' },
  { status: 'in_progress', when: 'Trwa (pokój otwarty)' },
  { status: 'completed', when: 'Odbyła się' },
  { status: 'cancelled', when: 'Anulowana przez ucznia lub mentora' },
  { status: 'no_show', when: 'Jedna ze stron się nie pojawiła' },
  { status: 'disputed', when: 'Zgłoszono problem, czeka na zespół zaufania' },
];

const meta = {
  title: 'Produkt/Wspólne/BookingStatusBadge',
  component: BookingStatusBadge,
  args: { status: 'scheduled' },
  argTypes: { status: { control: 'select', options: statuses.map((s) => s.status) } },
} satisfies Meta<typeof BookingStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllStatuses: Story = {
  name: 'Wszystkie statusy (KONCEPCJA §U5)',
  render: () => (
    <StateMatrix
      columns={['Znacznik', 'Kiedy']}
      rows={statuses.map(({ status, when }) => ({
        label: status,
        cells: [<BookingStatusBadge key="b" status={status} />, when],
      }))}
    />
  ),
};

export const IconAndWordTest: Story = {
  name: 'Test: status ma słowo i ikonę ukrytą dla czytnika',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Potwierdzona');
    await expect(badge.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  },
};
