import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  type PreviewState,
  StateMatrix,
  ViewportFrame,
} from '../../.storybook/blocks/component-docs';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from './field';
import { RadioGroup, RadioGroupItem } from './radio-group';

type PlaygroundArgs = { disabled: boolean; onValueChange: (value: unknown) => void };

const meta = {
  title: 'Komponenty bazowe/Formularze/RadioGroup',
  args: { disabled: false, onValueChange: fn() },
  render: ({ disabled, onValueChange }) => (
    <FieldSet>
      <FieldLegend variant="label" id="pg-want">
        Chcę
      </FieldLegend>
      <RadioGroup
        aria-labelledby="pg-want"
        defaultValue="student"
        disabled={disabled}
        onValueChange={onValueChange}
      >
        <Field orientation="horizontal">
          <RadioGroupItem id="pg-student" value="student" />
          <FieldLabel htmlFor="pg-student">się uczyć</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id="pg-mentor" value="mentor" />
          <FieldLabel htmlFor="pg-mentor">mentorować</FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
  ),
} satisfies Meta<PlaygroundArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const reasons = [
  {
    value: 'time',
    label: 'Termin mi nie pasuje',
    hint: 'Uczeń dostanie link do Twoich wolnych terminów.',
  },
  {
    value: 'topic',
    label: 'Temat poza moją specjalizacją',
    hint: 'Zaproponujemy uczniowi innych mentorów.',
  },
  {
    value: 'full',
    label: 'Nie przyjmuję teraz nowych uczniów',
    hint: 'Możesz wstrzymać przyjmowanie w kalendarzu.',
  },
  { value: 'other', label: 'Inne', hint: 'Opiszesz powód w polu poniżej.' },
];

export const Variants: Story = {
  name: 'Odmiany: proste i z opisem',
  render: () => (
    <FieldSet className="max-w-form">
      <FieldLegend id="v-reason">Powód odrzucenia prośby</FieldLegend>
      <RadioGroup aria-labelledby="v-reason" defaultValue="time">
        {reasons.map((reason) => (
          <Field key={reason.value} orientation="horizontal">
            <RadioGroupItem id={`v-${reason.value}`} value={reason.value} />
            <FieldContent>
              <FieldLabel htmlFor={`v-${reason.value}`}>{reason.label}</FieldLabel>
              <FieldDescription>{reason.hint}</FieldDescription>
            </FieldContent>
          </Field>
        ))}
      </RadioGroup>
    </FieldSet>
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
  render: () => (
    <StateMatrix
      columns={columns.map((c) => c.column)}
      rows={[
        { label: 'Niewybrany', checked: false },
        { label: 'Wybrany', checked: true },
      ].map((row) => ({
        label: row.label,
        cells: columns.map((c) => (
          <RadioGroup
            key={c.column}
            aria-label={`${row.label}, ${c.column}`}
            defaultValue={row.checked ? 'a' : undefined}
            disabled={c.disabled}
          >
            <RadioGroupItem
              value="a"
              aria-label="Opcja"
              data-preview-state={c.preview}
              aria-invalid={c.invalid ? true : undefined}
            />
          </RadioGroup>
        )),
      }))}
    />
  ),
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <FieldSet>
        <FieldLegend id="long-decision">
          Decyzja w sprawie wniosku Katarzyny Wiśniewskiej-Zalewskiej
        </FieldLegend>
        <RadioGroup aria-labelledby="long-decision" aria-describedby="long-decision-error">
          {[
            'Zatwierdź profil i opublikuj go w wyszukiwarce',
            'Poproś o zmiany w opisie i zdjęciu',
            'Odrzuć wniosek',
          ].map((label, index) => (
            <Field key={label} orientation="horizontal">
              <RadioGroupItem id={`long-d${index}`} value={String(index)} aria-invalid />
              <FieldLabel htmlFor={`long-d${index}`}>{label}</FieldLabel>
            </Field>
          ))}
        </RadioGroup>
        <FieldError id="long-decision-error">Wybierz decyzję, zanim ją zapiszesz.</FieldError>
      </FieldSet>
    </ViewportFrame>
  ),
};

export const ArrowKeys: Story = {
  name: 'Test: strzałki zmieniają wybór',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const student = canvas.getByRole('radio', { name: 'się uczyć' });
    const mentor = canvas.getByRole('radio', { name: 'mentorować' });
    await userEvent.tab();
    await expect(student).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(mentor).toHaveFocus();
    await expect(mentor).toHaveAttribute('aria-checked', 'true');
    await expect(args.onValueChange).toHaveBeenCalledWith('mentor', expect.anything());
    await userEvent.click(canvas.getByText('się uczyć'));
    await expect(student).toHaveAttribute('aria-checked', 'true');
  },
};
