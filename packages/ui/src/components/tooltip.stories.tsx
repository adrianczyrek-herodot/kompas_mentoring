import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

const framed = { docs: { story: { inline: false, height: '200px' } } };

function WeekNav({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <TooltipProvider>
      <div className="flex gap-inline pt-section">
        <Tooltip defaultOpen={defaultOpen}>
          <TooltipTrigger
            render={<Button variant="outline" size="icon" aria-label="Poprzedni tydzień" />}
          >
            <ChevronLeft aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent>Poprzedni tydzień</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={<Button variant="outline" size="icon" aria-label="Następny tydzień" />}
          >
            <ChevronRight aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent>Następny tydzień</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

const meta = {
  title: 'Komponenty bazowe/Nakładki/Tooltip',
  render: () => <WeekNav />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Podpowiedź przycisku z ikoną',
  parameters: framed,
  render: () => <WeekNav defaultOpen />,
};

export const States: Story = {
  name: 'Macierz stanów: widoczna podpowiedź',
  parameters: {
    ...framed,
    docs: {
      ...framed.docs,
      description: {
        story:
          'Pokazuje się po najechaniu lub fokusie, znika po Escape, opuszczeniu kursora albo fokusu.',
      },
    },
  },
  render: () => <WeekNav defaultOpen />,
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  parameters: framed,
  globals: { viewport: { value: 'mobile320', isRotated: false } },
  render: () => (
    <TooltipProvider>
      <div className="pt-section">
        <Tooltip defaultOpen>
          <TooltipTrigger
            render={<Button variant="outline" size="icon" aria-label="Synchronizuj teraz" />}
          >
            <ChevronRight aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent>Synchronizuj teraz z Kalendarzem Google</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};

export const ShowsOnFocus: Story = {
  name: 'Test: pokazuje się przy fokusie, znika po Escape',
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Poprzedni tydzień' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await waitFor(() =>
      expect(
        screen.getByText('Poprzedni tydzień', { selector: '[data-slot=tooltip-content]' }),
      ).toBeVisible(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        screen.queryByText('Poprzedni tydzień', { selector: '[data-slot=tooltip-content]' }),
      ).not.toBeInTheDocument(),
    );
  },
};
