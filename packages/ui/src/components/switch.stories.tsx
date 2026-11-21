import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  type PreviewState,
  StateMatrix,
  ViewportFrame,
} from '../../.storybook/blocks/component-docs';
import { Field, FieldContent, FieldDescription, FieldLabel, FieldLegend, FieldSet } from './field';
import { Switch } from './switch';

const meta = {
  title: 'Komponenty bazowe/Formularze/Switch',
  component: Switch,
  args: { disabled: false, defaultChecked: true, onCheckedChange: fn() },
  render: (args) => (
    <Field orientation="horizontal" className="max-w-form">
      <FieldContent>
        <FieldLabel htmlFor="pg-accepting">Przyjmuję nowych uczniów</FieldLabel>
        <FieldDescription>
          Wyłączone: nikt nowy nie zarezerwuje sesji próbnej. Obecni uczniowie rezerwują dalej.
        </FieldDescription>
      </FieldContent>
      <Switch id="pg-accepting" {...args} />
    </Field>
  ),
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Odmiany: pojedynczy i lista ustawień',
  render: () => (
    <FieldSet className="max-w-form">
      <FieldLegend>Przypomnienia e-mail</FieldLegend>
      {[
        { id: 'v-24h', label: '24 godziny przed sesją', on: true },
        { id: 'v-1h', label: '1 godzinę przed sesją', on: true },
        { id: 'v-requests', label: 'Nowe prośby o sesję próbną', on: false },
      ].map((item) => (
        <Field key={item.id} orientation="horizontal">
          <FieldLabel htmlFor={item.id}>{item.label}</FieldLabel>
          <Switch id={item.id} defaultChecked={item.on} />
        </Field>
      ))}
    </FieldSet>
  ),
};

const columns: { column: string; preview?: PreviewState; invalid?: boolean; disabled?: boolean }[] =
  [
    { column: 'Domyślny' },
    { column: 'Fokus', preview: 'focus' },
    { column: 'Błąd', invalid: true },
    { column: 'Zablokowany', disabled: true },
  ];

export const States: Story = {
  name: 'Macierz stanów',
  parameters: {
    docs: {
      description: {
        story:
          'Najechanie i wciśnięcie nie zmieniają wyglądu — przełącznik reaguje od razu zmianą położenia.',
      },
    },
  },
  render: () => (
    <StateMatrix
      columns={columns.map((c) => c.column)}
      rows={[
        { label: 'Wyłączony', on: false },
        { label: 'Włączony', on: true },
      ].map((row) => ({
        label: row.label,
        cells: columns.map((c) => (
          <Switch
            key={c.column}
            aria-label={`${row.label}, ${c.column}`}
            defaultChecked={row.on}
            disabled={c.disabled}
            data-preview-state={c.preview}
            aria-invalid={c.invalid ? true : undefined}
          />
        )),
      }))}
    />
  ),
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="long-sync">
            Blokuj terminy zajęte w Kalendarzu Google (katarzyna.wisniewska@example.com)
          </FieldLabel>
          <FieldDescription>Sprawdzamy kalendarz co 5 minut.</FieldDescription>
        </FieldContent>
        <Switch id="long-sync" defaultChecked />
      </Field>
    </ViewportFrame>
  ),
};

export const ToggleWithLabelAndSpace: Story = {
  name: 'Test: etykieta i spacja przełączają',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Przyjmuję nowych uczniów' });
    await expect(control).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(canvas.getByText('Przyjmuję nowych uczniów'));
    await expect(control).toHaveAttribute('aria-checked', 'false');
    await expect(control).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(control).toHaveAttribute('aria-checked', 'true');
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(2);
  },
};
