import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { HoldCountdown } from './hold-countdown';

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/HoldCountdown',
  component: HoldCountdown,
  args: {
    secondsLeft: 580,
    onRenew: fn(),
    onExpire: fn(),
  },
} satisfies Meta<typeof HoldCountdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  name: 'Aktywna blokada (ponad 2 minuty)',
  args: {
    secondsLeft: 580, // 09:40
  },
};

export const Warning: Story = {
  name: 'Kończący się czas (< 2 minuty)',
  args: {
    secondsLeft: 85, // 01:25
  },
};

export const Expired: Story = {
  name: 'Wygasła blokada (0 s)',
  args: {
    secondsLeft: 0,
  },
};

export const ExpiredActionTest: Story = {
  name: 'Test: kliknięcie ponownego wyboru po wygaśnięciu',
  args: {
    secondsLeft: 0,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const renewButton = canvas.getByRole('button', { name: 'Wybierz termin ponownie' });
    await userEvent.click(renewButton);
    await expect(args.onRenew).toHaveBeenCalledTimes(1);
  },
};
