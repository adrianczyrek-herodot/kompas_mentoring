import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { expect, within } from 'storybook/test';
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/alert-dialog';
import { Button } from '../components/button';

function DeleteConfirmationDemo({
  objectName = 'profil mentora Piotra Nowaka',
  confirmVerb = 'Usuń profil',
  cancelText = 'Nie usuwaj, zachowaj profil',
  warningDetails = 'Wszystkie przyszłe sesje zostaną odwołane, a opłaty zwrócone uczniom.',
}: {
  objectName?: string;
  confirmVerb?: string;
  cancelText?: string;
  warningDetails?: string;
}) {
  const [deleted, setDeleted] = React.useState(false);
  const [inFlight, setInFlight] = React.useState(false);

  const handleDelete = () => {
    setInFlight(true);
    setTimeout(() => {
      setInFlight(false);
      setDeleted(true);
    }, 400);
  };

  return (
    <div className="p-panel space-y-group max-w-form">
      <p className="text-body text-text-default">
        Strefa nieodwracalnych akcji konta. Usunięcie profilu wymaga jednoznacznego potwierdzenia.
      </p>

      {deleted ? (
        <div className="rounded-panel border border-border-divider p-panel bg-surface-sunken">
          <p className="text-body font-medium text-text-default">
            Obiekt został pomyślnie usunięty.
          </p>
        </div>
      ) : (
        <AlertDialog defaultOpen>
          <AlertDialogTrigger render={<Button variant="danger">Usuń profil</Button>} />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Czy na pewno chcesz usunąć {objectName}?</AlertDialogTitle>
              <AlertDialogDescription>{warningDetails}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogClose
                render={
                  <Button variant="outline" disabled={inFlight}>
                    {cancelText}
                  </Button>
                }
              />
              <Button variant="danger" loading={inFlight} onClick={handleDelete}>
                {confirmVerb}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

const meta = {
  title: 'Wzorce/Potwierdzenie usunięcia',
  component: DeleteConfirmationDemo,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof DeleteConfirmationDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DeleteProfile: Story = {
  name: '1. Usunięcie profilu mentora (nazwa + czasownik)',
};

export const CancelBooking: Story = {
  name: '2. Odwołanie sesji ucznia',
  args: {
    objectName: 'sesję z Anną Kowalską we wtorek, 25 listopada',
    confirmVerb: 'Odwołaj sesję',
    cancelText: 'Wróć, zachowaj termin',
    warningDetails:
      'Do sesji zostało mniej niż 12 godzin. Kredyt nie zostanie zwrócony do Twojego portfela.',
  },
};

export const ConfirmFlowTest: Story = {
  name: 'Test: obecność nazwy obiektu i brak etykiety „OK”',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Sprawdzenie, że nie ma generycznego OK
    await expect(canvas.queryByRole('button', { name: /^ok$/i })).not.toBeInTheDocument();
    // Przycisk usuwania zawiera czasownik
    await expect(canvas.getByRole('button', { name: 'Usuń profil' })).toBeVisible();
    // Przycisk rezygnacji jest łatwy do znalezienia
    await expect(canvas.getByRole('button', { name: /Nie usuwaj/i })).toBeVisible();
  },
};
