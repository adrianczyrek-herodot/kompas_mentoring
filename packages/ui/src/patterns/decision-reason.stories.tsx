import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { type ApiScenario, apiScenarios, fakeRequest } from '../../.storybook/examples/api';
import { DeclineDialog } from '../../.storybook/examples/decline-dialog';
import { withToasts } from '../../.storybook/examples/with-toasts';
import { requestPawel, TZ } from '../../.storybook/fixtures/kompas';
import { useToast } from '../components/toast';
import { TrialRequestCard } from '../product/trial-request-card';

const onDecision = fn();

function RequestWithDecision({
  api,
  startOpen = false,
}: {
  api: ApiScenario;
  startOpen?: boolean;
}) {
  const toast = useToast();
  const [open, setOpen] = useState(startOpen);
  const [declined, setDeclined] = useState(false);
  return (
    <section aria-label="Prośby o sesję próbną" className="max-w-form">
      {declined ? (
        <p className="py-row-y text-body-dense text-text-muted">Brak nowych próśb.</p>
      ) : (
        <ul>
          <TrialRequestCard
            request={requestPawel}
            timeZone={TZ}
            onDecline={() => {
              setOpen(true);
            }}
          />
        </ul>
      )}
      <DeclineDialog
        request={requestPawel}
        open={open}
        onOpenChange={setOpen}
        onSubmit={async (reason, note) => {
          onDecision(reason, note);
          const answer = await fakeRequest(api);
          if (answer.ok) {
            setDeclined(true);
            toast.add({ title: 'Prośba odrzucona', description: 'Uczeń dostał powód w e-mailu.' });
          }
          return answer;
        }}
      />
    </section>
  );
}

const framed = { docs: { story: { inline: false, height: '640px' } } };

const meta = {
  title: 'Wzorce/Decyzja z powodem',
  component: RequestWithDecision,
  decorators: [withToasts],
  args: { api: 'success', startOpen: false },
  argTypes: { api: { control: 'inline-radio', options: apiScenarios, name: 'Odpowiedź API' } },
  parameters: {
    ...framed,
    docs: {
      ...framed.docs,
      description: {
        component:
          'Odrzucenie prośby o sesję próbną w M2 (E3-S7): powód z listy ze skutkiem przy każdej opcji albo „Inne” 10–300 znaków. Ten sam wzorzec służy decyzjom w weryfikacji mentorów A1 (E2-S4: „poproś o zmiany”, „odrzuć z powodem”).',
      },
    },
  },
} satisfies Meta<typeof RequestWithDecision>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = { name: 'Prośba (dialog zamknięty)' };
export const Open: Story = { name: 'Dialog otwarty', args: { startOpen: true } };

async function openDialog(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole('button', { name: 'Odrzuć…' }));
  return waitFor(() => screen.getByRole('dialog', { name: 'Odrzucić prośbę: Paweł R.?' }));
}

export const ValidationTest: Story = {
  name: 'Walidacja: bez powodu i za krótkie „Inne”',
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    const body = within(dialog);
    onDecision.mockClear();
    await userEvent.click(body.getByRole('button', { name: 'Odrzuć prośbę' }));
    await expect(body.getByRole('alert')).toHaveTextContent('Wybierz powód');
    await expect(body.getByRole('radio', { name: 'Termin mi nie pasuje' })).toHaveFocus();
    await userEvent.click(body.getByRole('radio', { name: 'Inne' }));
    await userEvent.type(body.getByLabelText('Powód własnymi słowami'), 'Brak');
    await userEvent.click(body.getByRole('button', { name: 'Odrzuć prośbę' }));
    await expect(body.getByLabelText('Powód własnymi słowami')).toHaveFocus();
    await expect(body.getByRole('alert')).toHaveTextContent('10–300 znakach (teraz 4)');
    await expect(onDecision).not.toHaveBeenCalled();
  },
};

export const SuccessTest: Story = {
  name: 'API: sukces',
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    await userEvent.click(within(dialog).getByRole('radio', { name: 'Termin mi nie pasuje' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Odrzuć prośbę' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Odrzucić prośbę: Paweł R.?' })).toBeNull(),
    );
    await expect(onDecision).toHaveBeenLastCalledWith('time', '');
    await waitFor(() => expect(screen.getByText('Prośba odrzucona')).toBeVisible());
  },
};

export const PendingTest: Story = {
  name: 'API: oczekiwanie',
  args: { api: 'pending' },
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    await userEvent.click(within(dialog).getByRole('radio', { name: 'Termin mi nie pasuje' }));
    const submit = within(dialog).getByRole('button', { name: 'Odrzuć prośbę' });
    await userEvent.click(submit);
    await waitFor(() => expect(submit).toHaveAttribute('aria-busy', 'true'));
    await expect(within(dialog).getByRole('button', { name: 'Wróć' })).toBeDisabled();
  },
};

export const ServerErrorTest: Story = {
  name: 'API: błąd serwera',
  args: { api: 'server-error' },
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    await userEvent.click(within(dialog).getByRole('radio', { name: 'Termin mi nie pasuje' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Odrzuć prośbę' }));
    await expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Prośba nie została odrzucona',
    );
    await expect(within(dialog).getByRole('radio', { name: 'Termin mi nie pasuje' })).toBeChecked();
  },
};

export const OfflineTest: Story = {
  name: 'API: brak sieci',
  args: { api: 'offline' },
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    await userEvent.click(within(dialog).getByRole('radio', { name: 'Termin mi nie pasuje' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Odrzuć prośbę' }));
    await expect(await within(dialog).findByRole('alert')).toHaveTextContent('Brak połączenia');
  },
};
