import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarPlus, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  type PreviewState,
  StateMatrix,
  ViewportFrame,
} from '../../.storybook/blocks/component-docs';
import { Button, type ButtonProps } from './button';

const meta = {
  title: 'Komponenty bazowe/Akcje/Button',
  component: Button,
  args: {
    children: 'Zarezerwuj sesję próbną',
    variant: 'default',
    size: 'default',
    loading: false,
    disabled: false,
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'outline', 'ghost', 'destructive', 'link'],
    },
    size: { control: 'inline-radio', options: ['default', 'lg', 'sm', 'icon', 'icon-sm'] },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const variants: { variant: NonNullable<ButtonProps['variant']>; label: string; text: string }[] = [
  { variant: 'default', label: 'default — akcja główna', text: 'Zarezerwuj sesję próbną' },
  { variant: 'outline', label: 'outline — drugorzędna', text: 'Zmień termin' },
  { variant: 'ghost', label: 'ghost — cicha', text: 'Anuluj' },
  { variant: 'destructive', label: 'destructive — nieodwracalna', text: 'Usuń konto' },
  { variant: 'link', label: 'link — akcja tekstowa', text: 'Pokaż zasady anulowania' },
];

export const Variants: Story = {
  name: 'Warianty',
  render: () => (
    <div className="flex flex-col gap-group">
      {variants.map(({ variant, label, text }) => (
        <div key={variant} className="flex flex-col items-start gap-tight">
          <span className="text-meta text-text-muted">{label}</span>
          <Button variant={variant}>{text}</Button>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  name: 'Rozmiary',
  render: () => (
    <div className="flex flex-col gap-group">
      <div className="flex flex-wrap items-center gap-group">
        <Button size="lg">Zarezerwuj sesję próbną</Button>
        <Button>Zapisz dostępność</Button>
        <Button size="sm" variant="outline">
          Otwórz wniosek
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-group">
        <Button size="icon" variant="outline" aria-label="Poprzedni tydzień">
          <ChevronLeft />
        </Button>
        <Button size="icon" variant="outline" aria-label="Następny tydzień">
          <ChevronRight />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="Więcej akcji dla wniosku Anny Kowalczyk">
          <MoreHorizontal />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-group">
        <Button>
          <CalendarPlus />
          Dodaj wyjątek
        </Button>
      </div>
    </div>
  ),
};

const states: { column: string; props: Partial<ButtonProps>; preview?: PreviewState }[] = [
  { column: 'Domyślny', props: {} },
  { column: 'Najechanie', props: {}, preview: 'hover' },
  { column: 'Fokus', props: {}, preview: 'focus' },
  { column: 'Wciśnięty', props: {}, preview: 'pressed' },
  { column: 'Zablokowany', props: { disabled: true } },
  { column: 'Ładowanie', props: { loading: true } },
];

export const States: Story = {
  name: 'Macierz stanów',
  parameters: {
    docs: {
      description: {
        story:
          'Najechanie, fokus i wciśnięcie to zamrożony podgląd (`data-preview-state`) z tymi samymi deklaracjami co `:hover`, `:focus-visible` i `:active`.',
      },
    },
  },
  render: () => (
    <StateMatrix
      columns={states.map((state) => state.column)}
      rows={variants.map(({ variant, text }) => ({
        label: variant,
        cells: states.map((state) => (
          <Button
            key={state.column}
            variant={variant}
            data-preview-state={state.preview}
            {...state.props}
          >
            {variant === 'link' ? 'Pokaż zasady' : text.split(' ')[0]}
          </Button>
        )),
      }))}
    />
  ),
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <div className="flex flex-col gap-inline">
        <Button className="w-full whitespace-normal">
          Zarezerwuj sesję próbną z Katarzyną Wiśniewską-Zalewską
        </Button>
        <Button variant="outline" className="w-full whitespace-normal">
          Poproś o inny termin w tym tygodniu
        </Button>
      </div>
    </ViewportFrame>
  ),
};

export const ClickAndKeyboard: Story = {
  name: 'Test: kliknięcie i klawiatura',
  args: { children: 'Dołącz do sesji' },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Dołącz do sesji' });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    button.blur();
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};

export const DisabledBlocksClick: Story = {
  name: 'Test: zablokowany nie reaguje',
  args: { children: 'Przełóż sesję', disabled: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Przełóż sesję' });
    await expect(button).toBeDisabled();
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const LoadingKeepsFocus: Story = {
  name: 'Test: ładowanie blokuje podwójne wysłanie',
  args: { children: 'Zaloguj się', loading: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Zaloguj się' });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.click(button);
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
