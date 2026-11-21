import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarDays } from 'lucide-react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { Button } from './button';
import { Field, FieldTitle } from './field';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from './popover';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

const framed = { docs: { story: { inline: false, height: '360px' } } };

function DaytimeFilter({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Popover defaultOpen={defaultOpen}>
      <PopoverTrigger render={<Button variant="outline" />}>Pora dnia</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Pora dnia</PopoverTitle>
        <PopoverDescription>Godziny w Twojej strefie czasowej (Warszawa).</PopoverDescription>
        <Field>
          <FieldTitle id="daytime" className="sr-only">
            Pora dnia
          </FieldTitle>
          <ToggleGroup
            aria-labelledby="daytime"
            multiple
            defaultValue={['evening']}
            className="w-full"
          >
            <ToggleGroupItem value="morning">Rano</ToggleGroupItem>
            <ToggleGroupItem value="afternoon">Po południu</ToggleGroupItem>
            <ToggleGroupItem value="evening">Wieczorem</ToggleGroupItem>
          </ToggleGroup>
        </Field>
        <PopoverClose render={<Button size="sm" className="self-end" />}>Zastosuj</PopoverClose>
      </PopoverContent>
    </Popover>
  );
}

const meta = {
  title: 'Komponenty bazowe/Nakładki/Popover',
  render: () => <DaytimeFilter />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Odmiany: filtr i wybór tygodnia',
  parameters: framed,
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger render={<Button variant="outline" />}>
        <CalendarDays aria-hidden="true" />
        24–30 listopada
      </PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Wybierz tydzień</PopoverTitle>
        <div className="flex flex-col gap-tight">
          {['24–30 listopada', '1–7 grudnia', '8–14 grudnia'].map((week) => (
            <PopoverClose key={week} render={<Button variant="ghost" className="justify-start" />}>
              {week}
            </PopoverClose>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const States: Story = {
  name: 'Macierz stanów: otwarty',
  parameters: framed,
  render: () => <DaytimeFilter defaultOpen />,
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  parameters: framed,
  globals: { viewport: { value: 'mobile320', isRotated: false } },
  render: () => <DaytimeFilter defaultOpen />,
};

export const OpenEscapeReturn: Story = {
  name: 'Test: otwarcie, Escape i powrót fokusu',
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Pora dnia' });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Pora dnia' });
    await expect(dialog).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
