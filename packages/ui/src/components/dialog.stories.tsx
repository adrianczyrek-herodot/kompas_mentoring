import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { Button } from './button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Field, FieldLabel } from './field';
import { Textarea } from './textarea';

// Open dialogs cover the page, so on the docs page they render in their own frame.
const framed = { docs: { story: { inline: false, height: '520px' } } };

function ExceptionDialog({ defaultOpen = false, long = false }: { defaultOpen?: boolean; long?: boolean }) {
  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger render={<Button variant="outline" />}>Dodaj wyjątek</DialogTrigger>
      <DialogContent closeLabel="Zamknij">
        <DialogHeader>
          <DialogTitle>
            {long ? 'Dodaj wyjątek w dostępności na okres urlopu od 22 grudnia do 6 stycznia' : 'Dodaj wyjątek'}
          </DialogTitle>
          <DialogDescription>
            Uczniowie nie zarezerwują sesji w tym czasie. Umówione sesje zostają — przełóż je osobno.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="exception-note">Notatka dla siebie</FieldLabel>
          <Textarea id="exception-note" rows={2} />
        </Field>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Anuluj</DialogClose>
          <Button>Zapisz wyjątek</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const meta = {
  title: 'Komponenty bazowe/Nakładki/Dialog',
  render: () => <ExceptionDialog />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Otwarty dialog z formularzem',
  parameters: framed,
  render: () => <ExceptionDialog defaultOpen />,
};

export const States: Story = {
  name: 'Macierz stanów',
  parameters: {
    ...framed,
    docs: {
      ...framed.docs,
      description: {
        story:
          'Stany: zamknięty (przycisk otwierający ma stany `Button`), otwarty (poniżej), zamykanie — zanikanie `duration-overlay`, przy `prefers-reduced-motion` krócej.',
      },
    },
  },
  render: () => <ExceptionDialog defaultOpen />,
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  parameters: { ...framed, viewport: { defaultViewport: 'mobile320' } },
  globals: { viewport: { value: 'mobile320', isRotated: false } },
  render: () => <ExceptionDialog defaultOpen long />,
};

export const FocusTrapAndEscape: Story = {
  name: 'Test: fokus w dialogu, Escape i powrót fokusu',
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Dodaj wyjątek' });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Dodaj wyjątek' });
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
    await expect(dialog).toHaveAccessibleDescription(/Uczniowie nie zarezerwują sesji/);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
