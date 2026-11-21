import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { BookingSlotPicker, type HoldAnswer } from '../../.storybook/examples/booking';
import { fullscreen, ScreenShell } from '../../.storybook/examples/screen-shell';
import { withToasts } from '../../.storybook/examples/with-toasts';
import { emptyWeek, kasia, week } from '../../.storybook/fixtures/kompas';
import { PageHeader } from '../product/page-header';

type Args = {
  slotsStatus: 'ready' | 'loading' | 'error';
  holdAnswer: HoldAnswer;
  empty: boolean;
  sessionType: 'trial' | 'plan';
};

function U1Screen({ slotsStatus, holdAnswer, empty, sessionType }: Args) {
  return (
    <ScreenShell role="student" current="search">
      <PageHeader
        title="Wybierz termin"
        description="Godziny w Twojej strefie czasowej. Wybrany termin trzymamy dla Ciebie przez 10 minut."
      />
      <BookingSlotPicker
        mentor={kasia}
        sessionType={sessionType}
        slotsStatus={slotsStatus}
        holdAnswer={holdAnswer}
        days={empty ? emptyWeek : week}
        tick={false}
      />
    </ScreenShell>
  );
}

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/Ekrany/U1 Wybór terminu',
  component: U1Screen,
  decorators: [withToasts],
  args: { slotsStatus: 'ready', holdAnswer: 'success', empty: false, sessionType: 'trial' },
  argTypes: {
    slotsStatus: { control: 'inline-radio', options: ['ready', 'loading', 'error'] },
    holdAnswer: {
      control: 'inline-radio',
      options: ['success', 'conflict', 'pending', 'server-error', 'offline'],
    },
    sessionType: { control: 'inline-radio', options: ['trial', 'plan'] },
  },
  parameters: fullscreen,
} satisfies Meta<typeof U1Screen>;

export default meta;
type Story = StoryObj<typeof meta>;

async function pick(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const thursday = canvas.getByRole('group', { name: 'czw., 22 paź' });
  await userEvent.click(within(thursday).getByRole('button', { name: '18:00' }));
  return canvas;
}

export const Default: Story = { name: 'Start — nic nie wybrano' };
export const Plan: Story = { name: 'Sesja z planu (30 / 60 min)', args: { sessionType: 'plan' } };

export const Selected: Story = {
  name: 'S — termin wybrany, „Dalej” aktywne',
  play: async ({ canvasElement }) => {
    const canvas = await pick(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Dalej' })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};

export const Held: Story = {
  name: 'Blokada aktywna (10 min)',
  play: async ({ canvasElement }) => {
    const canvas = await pick(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Dalej' }));
    await expect(await canvas.findByRole('timer')).toHaveTextContent('10:00');
  },
};

export const Conflict: Story = {
  name: 'Er — konflikt 409 (toast)',
  args: { holdAnswer: 'conflict' },
  play: async ({ canvasElement }) => {
    const canvas = await pick(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Dalej' }));
    await waitFor(() => expect(screen.getByText('Ten termin został właśnie zajęty')).toBeVisible());
  },
};

export const Loading: Story = { name: 'L — ładowanie terminów', args: { slotsStatus: 'loading' } };
export const Empty: Story = { name: 'E — brak terminów w tygodniu', args: { empty: true } };
export const ErrorLoading: Story = { name: 'Er — błąd pobrania', args: { slotsStatus: 'error' } };
