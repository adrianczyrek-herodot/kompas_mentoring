import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';
import { Button } from './button';

const framed = { docs: { story: { inline: false, height: '440px' } } };

function CancelSession({
  defaultOpen = false,
  onConfirm,
  late = false,
}: {
  defaultOpen?: boolean;
  onConfirm?: () => void;
  late?: boolean;
}) {
  return (
    <AlertDialog defaultOpen={defaultOpen}>
      <AlertDialogTrigger render={<Button variant="outline" />}>Anuluj sesję</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Anulować sesję z Anną Kowalczyk we wtorek, 25 listopada, 18:00?</AlertDialogTitle>
          <AlertDialogDescription>
            {late
              ? 'Do sesji zostało mniej niż 12 godzin. Kredyt za sesję nie wróci na Twoje saldo.'
              : 'Do sesji zostało ponad 12 godzin. Kredyt wróci na Twoje saldo.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="outline" />}>Zostaw sesję</AlertDialogClose>
          <AlertDialogClose render={<Button variant="destructive" onClick={onConfirm} />}>
            Anuluj sesję
          </AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type Args = { onConfirm: () => void };

const meta = {
  title: 'Komponenty bazowe/Nakładki/AlertDialog',
  args: { onConfirm: fn() },
  render: ({ onConfirm }) => <CancelSession onConfirm={onConfirm} />,
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Odmiany: bez kosztu i z kosztem (reguła 12 h)',
  parameters: framed,
  render: () => <CancelSession defaultOpen late />,
};

export const States: Story = {
  name: 'Macierz stanów',
  parameters: {
    ...framed,
    docs: {
      ...framed.docs,
      description: {
        story: 'Otwarty: fokus na „Zostaw sesję” (bezpieczna odpowiedź). Kliknięcie tła nie zamyka.',
      },
    },
  },
  render: () => <CancelSession defaultOpen />,
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  parameters: framed,
  globals: { viewport: { value: 'mobile320', isRotated: false } },
  render: () => <CancelSession defaultOpen late />,
};

export const SafeDefaultAndConfirm: Story = {
  name: 'Test: fokus na rezygnacji, potwierdzenie czasownikiem',
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Anuluj sesję' }));
    const dialog = await screen.findByRole('alertdialog');
    const keep = within(dialog).getByRole('button', { name: 'Zostaw sesję' });
    await waitFor(() => expect(keep).toHaveFocus());
    await userEvent.click(within(dialog).getByRole('button', { name: 'Anuluj sesję' }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  },
};
