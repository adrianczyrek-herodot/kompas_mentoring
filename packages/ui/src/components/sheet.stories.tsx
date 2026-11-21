import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Field, FieldLabel } from './field';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

const framed = { docs: { story: { inline: false, height: '560px' } } };

function FiltersSheet({
  side = 'bottom',
  defaultOpen = false,
}: {
  side?: 'right' | 'bottom';
  defaultOpen?: boolean;
}) {
  return (
    <Sheet defaultOpen={defaultOpen}>
      <SheetTrigger render={<Button variant="outline" />}>Filtry</SheetTrigger>
      <SheetContent side={side} closeLabel="Zamknij filtry">
        <SheetHeader>
          <SheetTitle>Filtry</SheetTitle>
          <SheetDescription>Wyniki zmienią się po kliknięciu „Pokaż wyniki”.</SheetDescription>
        </SheetHeader>
        <Field orientation="horizontal">
          <Checkbox id={`verified-${side}`} defaultChecked />
          <FieldLabel htmlFor={`verified-${side}`}>Tylko zweryfikowani mentorzy</FieldLabel>
        </Field>
        <SheetFooter>
          <Button variant="ghost">Wyczyść filtry</Button>
          <SheetClose render={<Button />}>Pokaż wyniki</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

const meta = {
  title: 'Komponenty bazowe/Nakładki/Sheet',
  render: () => <FiltersSheet />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Odmiana: panel z prawej (desktop)',
  parameters: framed,
  render: () => <FiltersSheet side="right" defaultOpen />,
};

export const States: Story = {
  name: 'Macierz stanów: otwarty panel dolny (telefon)',
  parameters: framed,
  globals: { viewport: { value: 'mobile320', isRotated: false } },
  render: () => <FiltersSheet side="bottom" defaultOpen />,
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  parameters: framed,
  globals: { viewport: { value: 'mobile320', isRotated: false } },
  render: () => (
    <Sheet defaultOpen>
      <SheetTrigger render={<Button variant="outline" />}>Przełóż sesję</SheetTrigger>
      <SheetContent side="bottom" closeLabel="Zamknij">
        <SheetHeader>
          <SheetTitle>
            Przełóż sesję z Katarzyną Wiśniewską-Zalewską na inny termin w tym tygodniu
          </SheetTitle>
          <SheetDescription>
            Bezpłatnie do 12 godzin przed startem. Mentor dostanie powiadomienie i może zaproponować
            inną godzinę.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose render={<Button variant="ghost" />}>Anuluj</SheetClose>
          <Button>Wybierz termin</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const OpenAndClose: Story = {
  name: 'Test: otwarcie, przycisk zamknięcia, powrót fokusu',
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Filtry' });
    await userEvent.click(trigger);
    const sheet = await screen.findByRole('dialog', { name: 'Filtry' });
    await userEvent.click(within(sheet).getByRole('button', { name: 'Zamknij filtry' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
