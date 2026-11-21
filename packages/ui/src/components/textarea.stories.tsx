import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  type PreviewState,
  StateMatrix,
  ViewportFrame,
} from '../../.storybook/blocks/component-docs';
import { Field, FieldDescription, FieldError, FieldLabel, FieldOptional } from './field';
import { Textarea } from './textarea';

const meta = {
  title: 'Komponenty bazowe/Formularze/Textarea',
  component: Textarea,
  args: { showCount: true, maxLength: 2000, rows: 4, disabled: false, placeholder: '' },
  render: (args) => (
    <Field className="max-w-form">
      <FieldLabel htmlFor="playground-bio">O mnie</FieldLabel>
      <Textarea id="playground-bio" aria-describedby="playground-bio-hint" {...args} />
      <FieldDescription id="playground-bio-hint">
        Od 300 do 2000 znaków. Napisz, z czym pomagasz i jak wygląda sesja.
      </FieldDescription>
    </Field>
  ),
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Z licznikiem i bez',
  render: () => (
    <div className="flex max-w-form flex-col gap-group">
      <Field>
        <FieldLabel htmlFor="v-reason">Powód odrzucenia</FieldLabel>
        <Textarea
          id="v-reason"
          showCount
          maxLength={300}
          rows={3}
          aria-describedby="v-reason-hint"
        />
        <FieldDescription id="v-reason-hint">
          Od 10 do 300 znaków. Uczeń zobaczy ten tekst.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="v-comment">
          Komentarz do decyzji <FieldOptional>(opcjonalnie)</FieldOptional>
        </FieldLabel>
        <Textarea id="v-comment" rows={3} />
      </Field>
    </div>
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
  render: () => (
    <StateMatrix
      columns={columns.map((c) => c.column)}
      rows={[
        { label: 'Puste', value: undefined },
        {
          label: 'Wypełnione',
          value: 'Chcę przygotować się do rozmowy na stanowisko mid frontend.',
        },
      ].map((row) => ({
        label: row.label,
        cells: columns.map((c) => (
          <Textarea
            key={c.column}
            aria-label={`Cel sesji — ${row.label}, ${c.column}`}
            rows={3}
            defaultValue={row.value}
            data-preview-state={c.preview}
            aria-invalid={c.invalid ? true : undefined}
            disabled={c.disabled}
          />
        )),
      }))}
    />
  ),
};

const longBio =
  'Od 12 lat buduję aplikacje webowe, ostatnie 5 lat jako tech lead w zespołach produktowych. Pomagam juniorom i midom uporządkować naukę, przygotować się do rozmów technicznych i zaplanować pierwsze kroki w nowym zespole. Na sesji pracujemy na Twoim kodzie albo na zadaniu rekrutacyjnym, a po sesji dostajesz notatkę z planem na kolejne dwa tygodnie.';

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <Field>
        <FieldLabel htmlFor="long-bio">O mnie</FieldLabel>
        <Textarea
          id="long-bio"
          showCount
          maxLength={2000}
          rows={6}
          defaultValue={longBio}
          aria-invalid
          aria-describedby="long-bio-error"
        />
        <FieldError id="long-bio-error">
          Opis musi mieć co najmniej 300 znaków. Dopisz jeszcze kilka zdań.
        </FieldError>
      </Field>
    </ViewportFrame>
  ),
};

export const CounterUpdates: Story = {
  name: 'Test: licznik i limit znaków',
  args: { maxLength: 20, showCount: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'O mnie' });
    await expect(canvas.getByText('0 / 20')).toBeInTheDocument();
    await userEvent.type(textarea, 'Pomagam w React');
    await expect(canvas.getByText('15 / 20')).toBeInTheDocument();
    await userEvent.type(textarea, ' i TypeScript');
    await expect(textarea).toHaveValue('Pomagam w React i Ty');
    await expect(canvas.getByText('20 / 20')).toBeInTheDocument();
    await expect(textarea.getAttribute('aria-describedby')).toContain(
      canvas.getByText('20 / 20').id,
    );
  },
};
