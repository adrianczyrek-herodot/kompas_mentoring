import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ViewportFrame } from '../../.storybook/blocks/component-docs';
import {
  AvailabilityEditor,
  type AvailabilityEditorProps,
  type AvailabilityRuleView,
} from './availability-editor';

const onChange = fn();

/** Weekly template from the mockups: mornings and evenings, weekend free. */
const template: AvailabilityRuleView[] = [
  { weekday: 1, startLocal: '09:00', endLocal: '11:00' },
  { weekday: 2, startLocal: '17:00', endLocal: '20:00' },
  { weekday: 3, startLocal: '09:00', endLocal: '12:00' },
  { weekday: 4, startLocal: '18:00', endLocal: '20:00' },
  { weekday: 5, startLocal: '08:00', endLocal: '10:00' },
];

type InteractiveProps = Partial<AvailabilityEditorProps> & {
  initial?: readonly AvailabilityRuleView[];
};

function Interactive({ initial = [], ...props }: InteractiveProps) {
  const [rules, setRules] = useState<readonly AvailabilityRuleView[]>(initial);
  return (
    <AvailabilityEditor
      {...props}
      value={rules}
      onChange={(next) => {
        setRules(next);
        onChange(next);
      }}
    />
  );
}

const meta = {
  title: 'Produkt/E3 Dostępność i rezerwacje/AvailabilityEditor',
  component: AvailabilityEditor,
  args: { value: [], onChange },
  argTypes: { value: { control: false }, onChange: { control: false } },
} satisfies Meta<typeof AvailabilityEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  name: 'E — pusty szablon (start)',
  render: () => <Interactive />,
};

export const Filled: Story = {
  name: 'S — wypełniony tydzień',
  render: () => <Interactive initial={template} />,
};

export const Disabled: Story = {
  name: 'Wyłączony (podczas zapisu)',
  render: () => <Interactive initial={template} disabled />,
};

export const Narrow: Story = {
  name: 'Wąski ekran 320 px',
  render: () => (
    <ViewportFrame width={320}>
      <Interactive initial={template} />
    </ViewportFrame>
  ),
};

export const KeyboardSelect: Story = {
  name: 'Test: wtorek 18:00–20:00 klawiaturą',
  render: () => <Interactive />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onChange.mockClear();
    canvas.getByRole('gridcell', { name: 'Poniedziałek 00:00' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    for (let step = 0; step < 36; step += 1) {
      await userEvent.keyboard('{ArrowRight}');
    }
    await expect(canvas.getByRole('gridcell', { name: 'Wtorek 18:00' })).toHaveFocus();
    await userEvent.keyboard('{Shift>}{ArrowRight}{ArrowRight}{ArrowRight}{/Shift}');
    await expect(canvas.getByRole('gridcell', { name: 'Wtorek 18:00' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(canvas.getByRole('gridcell', { name: 'Wtorek 19:30' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(canvas.getByText('2 h')).toBeVisible();
    await expect(onChange).toHaveBeenLastCalledWith([
      { weekday: 2, startLocal: '18:00', endLocal: '20:00' },
    ]);
  },
};

export const SpaceToggle: Story = {
  name: 'Test: Spacja przełącza komórkę',
  render: () => <Interactive />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onChange.mockClear();
    const cell = canvas.getByRole('gridcell', { name: 'Środa 09:00' });
    cell.focus();
    await userEvent.keyboard(' ');
    await expect(cell).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByText('30 min')).toBeVisible();
    await expect(onChange).toHaveBeenLastCalledWith([
      { weekday: 3, startLocal: '09:00', endLocal: '09:30' },
    ]);
    await userEvent.keyboard(' ');
    await expect(cell).toHaveAttribute('aria-selected', 'false');
  },
};
