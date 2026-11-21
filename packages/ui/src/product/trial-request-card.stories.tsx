import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { TrialRequestCard } from './trial-request-card';

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/TrialRequestCard',
  component: TrialRequestCard,
  args: {
    studentName: 'Michał Wiśniewski',
    studentInitials: 'MW',
    goal: 'Chciałbym skonsultować przejście z Angulara na Next.js 16 w firmowym projekcie e-commerce oraz ułożyć plan nauki architektury modułowej.',
    requestedDateTime: 'Środa, 26 listopada 2026, 17:30',
    hoursLeftToRespond: 18,
    onAccept: fn(),
    onReject: fn(),
  },
} satisfies Meta<typeof TrialRequestCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const UrgentSLA: Story = {
  name: 'Pilne SLA (< 4 godziny)',
  args: {
    hoursLeftToRespond: 3,
  },
};

export const ActionsTest: Story = {
  name: 'Test: akcje akceptacji i odrzucenia',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const acceptButton = canvas.getByRole('button', { name: 'Zaakceptuj prośbę' });
    await userEvent.click(acceptButton);
    await expect(args.onAccept).toHaveBeenCalledTimes(1);

    const rejectButton = canvas.getByRole('button', { name: 'Odrzuć z powodem' });
    await userEvent.click(rejectButton);
    await expect(args.onReject).toHaveBeenCalledTimes(1);
  },
};
