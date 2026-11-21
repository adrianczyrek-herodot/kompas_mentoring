import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  type PreviewState,
  StateMatrix,
  ViewportFrame,
} from '../../.storybook/blocks/component-docs';
import { Checkbox } from './checkbox';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from './field';

const meta = {
  title: 'Komponenty bazowe/Formularze/Checkbox',
  component: Checkbox,
  args: { disabled: false, indeterminate: false, onCheckedChange: fn() },
  render: (args) => (
    <Field orientation="horizontal">
      <Checkbox id="pg-verified" {...args} />
      <FieldLabel htmlFor="pg-verified">Tylko zweryfikowani mentorzy</FieldLabel>
    </Field>
  ),
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Odmiany: pojedynczy, z opisem, karta wyboru',
  render: () => (
    <div className="flex max-w-form flex-col gap-group">
      <Field orientation="horizontal">
        <Checkbox id="v-terms" defaultChecked />
        <FieldLabel htmlFor="v-terms">Akceptuję regulamin i politykę prywatności</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Checkbox id="v-reminder" />
        <FieldContent>
          <FieldLabel htmlFor="v-reminder">Przypomnienie 1 godzinę przed sesją</FieldLabel>
          <FieldDescription>E-mail z linkiem do pokoju sesji.</FieldDescription>
        </FieldContent>
      </Field>
      <FieldLabel htmlFor="v-card">
        <Field orientation="horizontal">
          <Checkbox id="v-card" defaultChecked />
          <FieldContent>
            <span className="text-label font-medium">Zdjęcie przedstawia twarz mentora</span>
            <FieldDescription>Punkt checklisty weryfikacji wniosku.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
    </div>
  ),
};

const columns: {
  column: string;
  preview?: PreviewState;
  invalid?: boolean;
  disabled?: boolean;
}[] = [
  { column: 'Domyślny' },
  { column: 'Najechanie', preview: 'hover' },
  { column: 'Fokus', preview: 'focus' },
  { column: 'Błąd', invalid: true },
  { column: 'Zablokowany', disabled: true },
];

const rows: { label: string; checked?: boolean; indeterminate?: boolean }[] = [
  { label: 'Niezaznaczony' },
  { label: 'Zaznaczony', checked: true },
  { label: 'Częściowo', indeterminate: true },
];

export const States: Story = {
  name: 'Macierz stanów',
  render: () => (
    <StateMatrix
      columns={columns.map((c) => c.column)}
      rows={rows.map((row) => ({
        label: row.label,
        cells: columns.map((c) => (
          <Checkbox
            key={c.column}
            aria-label={`${row.label}, ${c.column}`}
            defaultChecked={row.checked}
            indeterminate={row.indeterminate}
            data-preview-state={c.preview}
            aria-invalid={c.invalid ? true : undefined}
            disabled={c.disabled}
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
      <Field orientation="horizontal" data-invalid>
        <Checkbox id="long-terms" aria-invalid aria-describedby="long-terms-error" />
        <FieldContent>
          <FieldLabel htmlFor="long-terms">
            Akceptuję regulamin serwisu Kompas i politykę prywatności, w tym zasady przetwarzania
            danych w trakcie sesji
          </FieldLabel>
          <FieldError id="long-terms-error">Akceptacja regulaminu jest wymagana.</FieldError>
        </FieldContent>
      </Field>
    </ViewportFrame>
  ),
};

export const ClickLabelAndSpace: Story = {
  name: 'Test: etykieta i spacja przełączają',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: 'Tylko zweryfikowani mentorzy' });
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(canvas.getByText('Tylko zweryfikowani mentorzy'));
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
    await expect(checkbox).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(2);
  },
};
