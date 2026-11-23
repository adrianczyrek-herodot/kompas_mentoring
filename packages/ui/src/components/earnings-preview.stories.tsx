import type { Meta, StoryObj } from '@storybook/react-vite';
import { EarningsPreview } from './earnings-preview';

const meta = {
  title: 'Produkt/E2 Katalog i onboarding/EarningsPreview',
  component: EarningsPreview,
  args: {
    rate60Amount: 15_000n,
    rate30Amount: 7_500n,
    hourLabel: 'Sesja 60 minut',
    halfHourLabel: 'Sesja 30 minut',
  },
  render: (args) => (
    <div className="max-w-form">
      <EarningsPreview {...args} />
    </div>
  ),
} satisfies Meta<typeof EarningsPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithoutNote: Story = {
  name: 'Bez informacji o prowizji',
  args: { note: '' },
};
