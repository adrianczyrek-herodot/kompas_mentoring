import type { Meta, StoryObj } from '@storybook/react-vite';
import { kasia } from '../../.storybook/fixtures/kompas';
import { MentorSummaryBar } from './mentor-summary-bar';

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/MentorSummaryBar',
  component: MentorSummaryBar,
  args: {
    mentor: kasia,
    timeZone: 'Europe/Warsaw',
    timeZoneLabel: 'Warszawa (GMT+2)',
  },
} satisfies Meta<typeof MentorSummaryBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: 'Mentor z podpisaną strefą' };
export const Unverified: Story = {
  name: 'Bez plakietki weryfikacji',
  args: { mentor: { ...kasia, verified: false } },
};
