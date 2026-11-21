import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  type PreviewState,
  StateMatrix,
  ViewportFrame,
} from '../../.storybook/blocks/component-docs';
import { Field, FieldDescription, FieldTitle } from './field';
import { Slider } from './slider';

const pln = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  maximumFractionDigits: 0,
});

function PriceRange({
  id,
  initial = [100, 300],
  disabled = false,
  onValueChange,
}: {
  id: string;
  initial?: number[];
  disabled?: boolean;
  onValueChange?: (value: number | readonly number[]) => void;
}) {
  const [value, setValue] = useState<readonly number[]>(initial);
  return (
    <Field className="max-w-form">
      <div className="flex items-baseline justify-between gap-inline">
        <FieldTitle id={id}>Cena za 60 minut</FieldTitle>
        <output aria-live="polite" className="text-body-dense text-text-default tabular-nums">
          {pln.format(value[0] ?? 0)} – {pln.format(value[1] ?? 0)}
        </output>
      </div>
      <Slider
        aria-labelledby={id}
        thumbLabels={['Cena od', 'Cena do']}
        min={0}
        max={1000}
        step={10}
        largeStep={100}
        value={value}
        disabled={disabled}
        onValueChange={(next) => {
          setValue(Array.isArray(next) ? next : [next as number]);
          onValueChange?.(next);
        }}
      />
      <FieldDescription>Od 0 do 1000 zł.</FieldDescription>
    </Field>
  );
}

type PlaygroundArgs = { disabled: boolean; onValueChange: (value: unknown) => void };

const meta = {
  title: 'Komponenty bazowe/Formularze/Slider',
  args: { disabled: false, onValueChange: fn() },
  render: ({ disabled, onValueChange }) => (
    <PriceRange id="pg-price" disabled={disabled} onValueChange={onValueChange} />
  ),
} satisfies Meta<PlaygroundArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Odmiany: zakres i jedna wartość',
  render: () => (
    <div className="flex max-w-form flex-col gap-section">
      <PriceRange id="v-price" />
      <Field>
        <FieldTitle id="v-exp">Doświadczenie: co najmniej 5 lat</FieldTitle>
        <Slider
          aria-labelledby="v-exp"
          thumbLabels={['Lata doświadczenia, minimum']}
          min={0}
          max={20}
          defaultValue={5}
        />
      </Field>
    </div>
  ),
};

const columns: { column: string; preview?: PreviewState; disabled?: boolean }[] = [
  { column: 'Domyślny' },
  { column: 'Zablokowany', disabled: true },
];

export const States: Story = {
  name: 'Macierz stanów',
  parameters: {
    docs: {
      description: {
        story:
          'Fokus uchwytu (obrys `focus-ring`) i przeciąganie są pokazane w teście klawiatury. Najechanie nie zmienia wyglądu; błąd nie dotyczy (zakres jest zawsze poprawny).',
      },
    },
  },
  render: () => (
    <StateMatrix
      columns={columns.map((c) => c.column)}
      rows={[
        { label: 'Zakres', value: [200, 600] },
        { label: 'Pełny zakres', value: [0, 1000] },
      ].map((row) => ({
        label: row.label,
        cells: columns.map((c) => (
          <div key={c.column} className="w-dialog max-w-full">
            <Slider
              thumbLabels={[`Od — ${row.label}, ${c.column}`, `Do — ${row.label}, ${c.column}`]}
              min={0}
              max={1000}
              defaultValue={row.value}
              disabled={c.disabled}
            />
          </div>
        )),
      }))}
    />
  ),
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <PriceRange id="long-price" initial={[0, 1000]} />
    </ViewportFrame>
  ),
};

export const KeyboardMovesThumb: Story = {
  name: 'Test: klawiatura przesuwa uchwyt',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const from = canvas.getByRole('slider', { name: 'Cena od' });
    await userEvent.tab();
    await expect(from).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(from).toHaveAttribute('aria-valuenow', '110');
    await userEvent.keyboard('{PageUp}');
    await expect(from).toHaveAttribute('aria-valuenow', '210');
    await expect(args.onValueChange).toHaveBeenCalled();
    await expect(canvas.getByText(/210/)).toBeVisible();
  },
};
