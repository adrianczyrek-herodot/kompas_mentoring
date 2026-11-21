import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { BookingSlotPicker } from '../../.storybook/examples/booking';
import { withToasts } from '../../.storybook/examples/with-toasts';
import { emptyWeek, kasia } from '../../.storybook/fixtures/kompas';

const meta = {
  title: 'Wzorce/Wybór terminu z blokadą',
  component: BookingSlotPicker,
  decorators: [withToasts],
  args: { mentor: kasia, sessionType: 'trial', holdAnswer: 'success', slotsStatus: 'ready' },
  argTypes: {
    sessionType: { control: 'inline-radio', options: ['trial', 'plan'] },
    holdAnswer: {
      control: 'inline-radio',
      options: ['success', 'conflict', 'pending', 'server-error', 'offline'],
      name: 'Odpowiedź API (blokada)',
    },
    slotsStatus: { control: 'inline-radio', options: ['ready', 'loading', 'error'] },
    mentor: { control: false },
    days: { control: false },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'U1 (E3-S4): wybór slotu w strefie ucznia → „Dalej” tworzy blokadę na 10 minut. Konflikt 409 → toast „Ten termin został właśnie zajęty” i odświeżona siatka; wygaśnięcie → powrót do wyboru z zachowanym mentorem. Odliczanie blokady to jedyne odliczanie w Kompasie (A02).',
      },
    },
  },
} satisfies Meta<typeof BookingSlotPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NothingSelected: Story = { name: 'Nic nie wybrano' };
export const PlanSession: Story = {
  name: 'Sesja z planu (30 / 60 min)',
  args: { sessionType: 'plan' },
};
export const Loading: Story = { name: 'Ładowanie terminów', args: { slotsStatus: 'loading' } };
export const ErrorLoading: Story = {
  name: 'Błąd wczytania terminów',
  args: { slotsStatus: 'error' },
};
export const NoSlots: Story = { name: 'Brak terminów w tygodniu', args: { days: emptyWeek } };

async function pickAndContinue(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const thursday = canvas.getByRole('group', { name: 'czw., 22 paź' });
  await userEvent.click(within(thursday).getByRole('button', { name: '18:00' }));
  await userEvent.click(canvas.getByRole('button', { name: 'Dalej' }));
  return canvas;
}

export const DisabledContinueTest: Story = {
  name: 'Test: „Dalej” zablokowane z powodem do wyboru terminu',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const next = canvas.getByRole('button', { name: 'Dalej' });
    await expect(next).toHaveAttribute('aria-disabled', 'true');
    await expect(next).toHaveAccessibleDescription('Wybierz termin, żeby przejść dalej.');
  },
};

export const HoldActive: Story = {
  name: 'Blokada aktywna',
  args: { tick: false },
  play: async ({ canvasElement }) => {
    const canvas = await pickAndContinue(canvasElement);
    await expect(await canvas.findByRole('timer')).toHaveTextContent('10:00');
    await expect(canvas.getByRole('button', { name: 'Przejdź do płatności' })).toBeVisible();
  },
};

export const HoldLastMinutes: Story = {
  name: 'Blokada: ostatnie 2 minuty',
  args: { tick: false, initialSecondsLeft: 95 },
  play: async ({ canvasElement }) => {
    const canvas = await pickAndContinue(canvasElement);
    await expect(await canvas.findByRole('timer')).toHaveTextContent('01:35');
  },
};

export const HoldExpired: Story = {
  name: 'Blokada wygasła',
  args: { initialSecondsLeft: 1 },
  play: async ({ canvasElement }) => {
    const canvas = await pickAndContinue(canvasElement);
    await waitFor(
      () => expect(canvas.getByRole('alert')).toHaveTextContent('Blokada terminu wygasła'),
      {
        timeout: 4000,
      },
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Wybierz termin ponownie' }));
    await expect(canvas.getByRole('button', { name: 'Dalej' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};

export const Conflict: Story = {
  name: 'Konflikt 409: termin zajęty',
  args: { holdAnswer: 'conflict' },
  play: async ({ canvasElement }) => {
    const canvas = await pickAndContinue(canvasElement);
    await waitFor(() => expect(screen.getByText('Ten termin został właśnie zajęty')).toBeVisible());
    const thursday = canvas.getByRole('group', { name: 'czw., 22 paź' });
    await expect(within(thursday).queryByRole('button', { name: '18:00' })).toBeNull();
  },
};

export const Pending: Story = {
  name: 'Tworzenie blokady (oczekiwanie)',
  args: { holdAnswer: 'pending' },
  play: async ({ canvasElement }) => {
    const canvas = await pickAndContinue(canvasElement);
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Dalej' })).toHaveAttribute('aria-busy', 'true'),
    );
  },
};

export const ServerError: Story = {
  name: 'Błąd serwera',
  args: { holdAnswer: 'server-error' },
  play: async ({ canvasElement }) => {
    const canvas = await pickAndContinue(canvasElement);
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Termin nie został zarezerwowany',
    );
    const thursday = canvas.getByRole('group', { name: 'czw., 22 paź' });
    await expect(within(thursday).getByRole('button', { name: '18:00' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};

export const Offline: Story = {
  name: 'Brak sieci',
  args: { holdAnswer: 'offline' },
  play: async ({ canvasElement }) => {
    const canvas = await pickAndContinue(canvasElement);
    await expect(await canvas.findByRole('alert')).toHaveTextContent('Brak połączenia');
  },
};
