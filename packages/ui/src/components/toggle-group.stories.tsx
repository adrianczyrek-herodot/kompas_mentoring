import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  type PreviewState,
  StateMatrix,
  ViewportFrame,
} from '../../.storybook/blocks/component-docs';
import { Field, FieldDescription, FieldTitle } from './field';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

type PlaygroundArgs = { disabled: boolean; onValueChange: (value: unknown) => void };

const meta = {
  title: 'Komponenty bazowe/Akcje/ToggleGroup',
  args: { disabled: false, onValueChange: fn() },
  render: ({ disabled, onValueChange }) => (
    <Field>
      <FieldTitle id="pg-duration">Długość sesji</FieldTitle>
      <ToggleGroup
        aria-labelledby="pg-duration"
        defaultValue={['30']}
        disabled={disabled}
        onValueChange={onValueChange}
      >
        <ToggleGroupItem value="30">30 min</ToggleGroupItem>
        <ToggleGroupItem value="60">60 min</ToggleGroupItem>
      </ToggleGroup>
    </Field>
  ),
} satisfies Meta<PlaygroundArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Odmiany: jeden wybór i wiele',
  render: () => (
    <div className="flex flex-col gap-group">
      <Field>
        <FieldTitle id="v-duration">Długość sesji</FieldTitle>
        <ToggleGroup aria-labelledby="v-duration" defaultValue={['60']}>
          <ToggleGroupItem value="30">30 min</ToggleGroupItem>
          <ToggleGroupItem value="60">60 min</ToggleGroupItem>
        </ToggleGroup>
      </Field>
      <Field>
        <FieldTitle id="v-daytime">Pora dnia</FieldTitle>
        <ToggleGroup aria-labelledby="v-daytime" multiple defaultValue={['morning', 'evening']}>
          <ToggleGroupItem value="morning">Rano</ToggleGroupItem>
          <ToggleGroupItem value="afternoon">Po południu</ToggleGroupItem>
          <ToggleGroupItem value="evening">Wieczorem</ToggleGroupItem>
        </ToggleGroup>
        <FieldDescription>Możesz wybrać kilka pór.</FieldDescription>
      </Field>
    </div>
  ),
};

const columns: { column: string; preview?: PreviewState; disabled?: boolean }[] = [
  { column: 'Domyślny' },
  { column: 'Najechanie', preview: 'hover' },
  { column: 'Fokus', preview: 'focus' },
  { column: 'Zablokowany', disabled: true },
];

export const States: Story = {
  name: 'Macierz stanów',
  parameters: {
    docs: {
      description: {
        story: 'Błąd nie dotyczy — jedna opcja jest zawsze wybrana. Wybrany element = „Wciśnięty”.',
      },
    },
  },
  render: () => (
    <StateMatrix
      columns={columns.map((c) => c.column)}
      rows={[
        { label: 'Niewybrany', pressed: false },
        { label: 'Wybrany', pressed: true },
      ].map((row) => ({
        label: row.label,
        cells: columns.map((c) => (
          <ToggleGroup
            key={c.column}
            aria-label={`${row.label}, ${c.column}`}
            defaultValue={row.pressed ? ['60'] : []}
            disabled={c.disabled}
          >
            <ToggleGroupItem value="60" data-preview-state={c.preview}>
              60 min
            </ToggleGroupItem>
          </ToggleGroup>
        )),
      }))}
    />
  ),
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <Field>
        <FieldTitle id="long-daytime">Pora dnia</FieldTitle>
        <ToggleGroup
          aria-labelledby="long-daytime"
          multiple
          defaultValue={['afternoon']}
          className="w-full"
        >
          <ToggleGroupItem value="morning">Rano</ToggleGroupItem>
          <ToggleGroupItem value="afternoon">Po południu</ToggleGroupItem>
          <ToggleGroupItem value="evening">Wieczorem</ToggleGroupItem>
        </ToggleGroup>
        <FieldDescription>
          Na 320 px etykiety zawijają się w opcji; przy więcej niż 4 opcjach albo dłuższych nazwach
          użyj listy checkboxów.
        </FieldDescription>
      </Field>
    </ViewportFrame>
  ),
};

export const ClickAndArrows: Story = {
  name: 'Test: kliknięcie i strzałki',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const short = canvas.getByRole('button', { name: '30 min' });
    const long = canvas.getByRole('button', { name: '60 min' });
    await expect(short).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(long);
    await expect(long).toHaveAttribute('aria-pressed', 'true');
    await expect(short).toHaveAttribute('aria-pressed', 'false');
    await expect(args.onValueChange).toHaveBeenCalledWith(['60'], expect.anything());
    await userEvent.keyboard('{ArrowLeft}');
    await expect(short).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(short).toHaveAttribute('aria-pressed', 'true');
  },
};
