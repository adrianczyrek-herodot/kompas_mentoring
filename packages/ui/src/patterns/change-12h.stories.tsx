import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { apiScenarios } from '../../.storybook/examples/api';
import { SessionDetail } from '../../.storybook/examples/session-detail';
import { withToasts } from '../../.storybook/examples/with-toasts';
import { sessionFriday, sessionToday } from '../../.storybook/fixtures/kompas';

const framed = { docs: { story: { inline: false, height: '720px' } } };
const free = {
  session: sessionFriday,
  policy: 'free' as const,
  freeUntil: '2026-10-23T06:00:00+02:00',
  joinFrom: '2026-10-23T17:50:00+02:00',
};
const late = { session: sessionToday, policy: 'late' as const, joinOpen: true };
const started = {
  session: { ...sessionToday, status: 'in_progress' as const },
  policy: 'started' as const,
  joinOpen: true,
};

const meta = {
  title: 'Wzorce/Zmiana z regułą 12 h',
  component: SessionDetail,
  decorators: [withToasts],
  args: { status: 'ready', cancelApi: 'success', ...free },
  argTypes: {
    policy: { control: 'inline-radio', options: ['free', 'late', 'started'] },
    cancelApi: { control: 'inline-radio', options: apiScenarios, name: 'Odpowiedź API' },
    session: { control: false },
  },
  parameters: {
    layout: 'padded',
    ...framed,
    docs: {
      ...framed.docs,
      description: {
        component:
          'Przełożenie i anulowanie sesji (E3-S6, KONCEPCJA Z4). Reguła 12 h pełnym tekstem obok akcji (A04); ≥ 12 h — bez kosztów; < 12 h — przełożenie niemożliwe, anulowanie z ostrzeżeniem „sesja przepadnie”; po starcie — obie akcje zablokowane z powodem. Sukces dopiero po odpowiedzi serwera; przy błędzie dialog zostaje otwarty.',
      },
    },
  },
} satisfies Meta<typeof SessionDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Free: Story = { name: '≥ 12 h: zmiana bez kosztów' };
export const Late: Story = { name: '< 12 h: sesja przepadnie', args: late };
export const Started: Story = { name: 'Po starcie: zmiana zablokowana', args: started };

async function openCancel(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Anuluj sesję' }));
  return waitFor(() => screen.getByRole('alertdialog'));
}

export const CancelFreeTest: Story = {
  name: 'Test: anulowanie ≥ 12 h — sesja wraca do salda',
  play: async ({ canvasElement }) => {
    const dialog = await openCancel(canvasElement);
    await expect(dialog).toHaveAccessibleDescription(/Sesja wróci do salda/);
    // Safe action gets focus first (WAI-ARIA APG alertdialog).
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Zostaw sesję' })).toHaveFocus(),
    );
    await userEvent.click(within(dialog).getByRole('button', { name: 'Anuluj sesję' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await expect(within(canvasElement).getByText('Anulowana')).toBeVisible();
    await expect(await screen.findByText('Sesja wróciła do salda.')).toBeVisible();
  },
};

export const CancelLateTest: Story = {
  name: 'Test: anulowanie < 12 h — ostrzeżenie i czasownik w przycisku',
  args: late,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reschedule = canvas.getByRole('button', { name: 'Przełóż' });
    await expect(reschedule).toHaveAttribute('aria-disabled', 'true');
    await expect(reschedule).toHaveAccessibleDescription(/mniej niż 12 godzin/);
    const dialog = await openCancel(canvasElement);
    await expect(dialog).toHaveAccessibleDescription(/przepadnie i nie wróci do salda/);
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Anuluj i strać sesję' })).toBeVisible(),
    );
  },
};

export const StartedTest: Story = {
  name: 'Test: po starcie obie akcje zablokowane z powodem',
  args: started,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of ['Przełóż', 'Anuluj sesję']) {
      const button = canvas.getByRole('button', { name });
      await expect(button).toHaveAttribute('aria-disabled', 'true');
      await expect(button).toHaveAccessibleDescription(/Sesja już się zaczęła/);
    }
  },
};

export const ServerErrorTest: Story = {
  name: 'Test: błąd serwera — dialog zostaje, sesja nadal umówiona',
  args: { cancelApi: 'server-error' },
  play: async ({ canvasElement }) => {
    const dialog = await openCancel(canvasElement);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Anuluj sesję' }));
    await expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Sesja nie została anulowana',
    );
    await expect(within(canvasElement).getByText('Potwierdzona')).toBeVisible();
  },
};

export const OfflineTest: Story = {
  name: 'Test: brak sieci — komunikat w dialogu',
  args: { cancelApi: 'offline' },
  play: async ({ canvasElement }) => {
    const dialog = await openCancel(canvasElement);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Anuluj sesję' }));
    await expect(await within(dialog).findByRole('alert')).toHaveTextContent('Brak połączenia');
  },
};

export const PendingTest: Story = {
  name: 'Test: oczekiwanie — blokada podwójnego wysłania',
  args: { cancelApi: 'pending' },
  play: async ({ canvasElement }) => {
    const dialog = await openCancel(canvasElement);
    const confirm = within(dialog).getByRole('button', { name: 'Anuluj sesję' });
    await userEvent.click(confirm);
    await waitFor(() => expect(confirm).toHaveAttribute('aria-busy', 'true'));
    await expect(within(dialog).getByRole('button', { name: 'Zostaw sesję' })).toBeDisabled();
  },
};

export const RescheduleTest: Story = {
  name: 'Test: przełożenie — panel z terminami',
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Przełóż' }));
    const sheet = await waitFor(() => screen.getByRole('dialog', { name: 'Przełóż sesję' }));
    const confirm = within(sheet).getByRole('button', { name: 'Przełóż na wybrany termin' });
    await expect(confirm).toBeDisabled();
    const [slot] = within(sheet).getAllByRole('button', { name: '09:00' });
    if (!slot) throw new Error('Expected a 09:00 slot');
    await userEvent.click(slot);
    await expect(confirm).toBeEnabled();
  },
};
