import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { StickyContinueButton } from './sticky-continue-button';

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/StickyContinueButton',
  component: StickyContinueButton,
  args: {
    children: 'Dalej',
    onClick: fn(),
    hint: <p className="text-body text-text-default">Wybrany termin trzymamy 10 minut.</p>,
  },
} satisfies Meta<typeof StickyContinueButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Enabled: Story = { name: 'Aktywny' };
export const Disabled: Story = {
  name: 'Zablokowany z powodem',
  args: { disabled: true, disabledReason: 'Wybierz termin, żeby przejść dalej.' },
};
