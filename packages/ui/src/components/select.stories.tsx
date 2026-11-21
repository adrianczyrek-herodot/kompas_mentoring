import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import {
  type PreviewState,
  StateMatrix,
  ViewportFrame,
} from '../../.storybook/blocks/component-docs';
import { Field, FieldDescription, FieldError, FieldLabel } from './field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

const sortOptions = [
  { value: 'relevance', label: 'Trafność' },
  { value: 'price-asc', label: 'Cena: od najniższej' },
  { value: 'price-desc', label: 'Cena: od najwyższej' },
  { value: 'rating', label: 'Ocena' },
  { value: 'sessions', label: 'Liczba sesji' },
];

type PlaygroundArgs = {
  disabled: boolean;
  invalid: boolean;
  onValueChange: (value: unknown) => void;
};

const meta = {
  title: 'Komponenty bazowe/Formularze/Select',
  args: { disabled: false, invalid: false, onValueChange: fn() },
  render: ({ disabled, invalid, onValueChange }) => (
    <Field className="max-w-form">
      <FieldLabel htmlFor="pg-sort">Sortowanie</FieldLabel>
      <Select
        items={sortOptions}
        defaultValue="relevance"
        disabled={disabled}
        onValueChange={onValueChange}
      >
        <SelectTrigger id="pg-sort" aria-invalid={invalid ? true : undefined}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  ),
} satisfies Meta<PlaygroundArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const timezones = {
  europe: [
    { value: 'Europe/Warsaw', label: 'Warszawa (UTC+1)' },
    { value: 'Europe/London', label: 'Londyn (UTC+0)' },
    { value: 'Europe/Berlin', label: 'Berlin (UTC+1)' },
  ],
  america: [
    { value: 'America/New_York', label: 'Nowy Jork (UTC−5)' },
    { value: 'America/Toronto', label: 'Toronto (UTC−5)' },
  ],
};
const allTimezones = [...timezones.europe, ...timezones.america];

function TimezoneField() {
  return (
    <Field>
      <FieldLabel htmlFor="v-tz">Strefa czasowa</FieldLabel>
      <Select items={allTimezones} defaultValue="Europe/Warsaw">
        <SelectTrigger id="v-tz" aria-describedby="v-tz-hint">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectGroupLabel>Europa</SelectGroupLabel>
            {timezones.europe.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectGroupLabel>Ameryka</SelectGroupLabel>
            {timezones.america.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldDescription id="v-tz-hint">Godziny sesji pokażemy w tej strefie.</FieldDescription>
    </Field>
  );
}

export const Variants: Story = {
  name: 'Odmiany: z grupami, z podpowiedzią, z placeholderem',
  render: () => (
    <div className="flex max-w-form flex-col gap-group">
      <TimezoneField />
      <Field>
        <FieldLabel htmlFor="v-notice">Minimalne wyprzedzenie rezerwacji</FieldLabel>
        <Select>
          <SelectTrigger id="v-notice">
            <SelectValue placeholder="Wybierz wyprzedzenie" />
          </SelectTrigger>
          <SelectContent>
            {['2 godziny', '6 godzin', '12 godzin', '24 godziny', '48 godzin'].map((label) => (
              <SelectItem key={label} value={label}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  ),
};

const columns: { column: string; preview?: PreviewState; invalid?: boolean; disabled?: boolean }[] =
  [
    { column: 'Domyślny' },
    { column: 'Najechanie', preview: 'hover' },
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
          'Otwarta lista (wybrany, podświetlony element) jest pokazana w teście „Test: klawiatura i wybór”.',
      },
    },
  },
  render: () => (
    <StateMatrix
      columns={columns.map((c) => c.column)}
      rows={[
        { label: 'Bez wyboru', value: undefined },
        { label: 'Wybrany', value: 'rating' },
      ].map((row) => ({
        label: row.label,
        cells: columns.map((c) => (
          <Select key={c.column} items={sortOptions} defaultValue={row.value} disabled={c.disabled}>
            <SelectTrigger
              aria-label={`Sortowanie — ${row.label}, ${c.column}`}
              data-preview-state={c.preview}
              aria-invalid={c.invalid ? true : undefined}
            >
              <SelectValue placeholder="Wybierz" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <FieldLabel htmlFor="long-tz">Strefa czasowa, w której pokażemy godziny sesji</FieldLabel>
        <Select items={allTimezones} defaultValue="America/New_York">
          <SelectTrigger id="long-tz" aria-invalid aria-describedby="long-tz-error">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {allTimezones.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError id="long-tz-error">
          Ta strefa różni się od strefy Twojego urządzenia o 6 godzin. Sprawdź, czy to zamierzone.
        </FieldError>
      </Field>
    </ViewportFrame>
  ),
};

export const KeyboardAndSelect: Story = {
  name: 'Test: klawiatura i wybór',
  play: async ({ args, canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox', { name: 'Sortowanie' });
    await expect(trigger).toHaveTextContent('Trafność');
    await userEvent.click(trigger);
    const option = await screen.findByRole('option', { name: 'Ocena' });
    await userEvent.click(option);
    await expect(args.onValueChange).toHaveBeenCalledWith('rating', expect.anything());
    await expect(trigger).toHaveTextContent('Ocena');
    // Focus returns to the field after the closing transition.
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await expect(screen.getByRole('option', { name: 'Ocena' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};
