import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { EmailVerificationBanner } from './email-verification-banner';

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/EmailVerificationBanner',
  component: EmailVerificationBanner,
  args: { email: 'ola@example.com', onResend: fn() },
} satisfies Meta<typeof EmailVerificationBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithResend: Story = { name: 'Z „Wyślij link ponownie”' };
export const Informational: Story = {
  name: 'Tylko informacja',
  render: () => <EmailVerificationBanner email="ola@example.com" />,
};
