import type { Meta, StoryObj } from '@storybook/react-vite';
import { PolicyNotice } from './policy-notice';

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/PolicyNotice',
  component: PolicyNotice,
  args: {
    hoursRemaining: 36,
  },
} satisfies Meta<typeof PolicyNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MoreThan12Hours: Story = {
  name: 'Więcej niż 12 h (bezpłatna zmiana)',
  args: {
    hoursRemaining: 36,
  },
};

export const LessThan12Hours: Story = {
  name: 'Mniej niż 12 h (utrata kredytu)',
  args: {
    hoursRemaining: 6,
  },
};
