import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  type PreviewState,
  StateMatrix,
  ViewportFrame,
} from '../../.storybook/blocks/component-docs';
import { Field, FieldDescription, FieldError, FieldLabel } from './field';
import { Input } from './input';

const meta = {
  title: 'Komponenty bazowe/Formularze/Input',
  component: Input,
  args: { type: 'email', placeholder: 'np. anna@example.com', disabled: false },
  argTypes: {
    type: { control: 'inline-radio', options: ['text', 'email', 'password', 'url', 'number'] },
  },
  render: (args) => (
    <Field className="max-w-form">
      <FieldLabel htmlFor="playground-email">E-mail</FieldLabel>
      <Input id="playground-email" {...args} />
    </Field>
  ),
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Typy pól',
  parameters: {
    docs: {
      description: {
        story:
          'Input nie ma wariantów wyglądu. Typ (`email`, `password`, `url`) wybiera klawiaturę na telefonie i autouzupełnianie.',
      },
    },
  },
  render: () => (
    <div className="flex max-w-form flex-col gap-group">
      <Field>
        <FieldLabel htmlFor="v-name">Imię</FieldLabel>
        <Input id="v-name" autoComplete="given-name" defaultValue="Anna" />
      </Field>
      <Field>
        <FieldLabel htmlFor="v-email">E-mail</FieldLabel>
        <Input id="v-email" type="email" autoComplete="email" placeholder="np. anna@example.com" />
      </Field>
      <Field>
        <FieldLabel htmlFor="v-password">Hasło</FieldLabel>
        <Input
          id="v-password"
          type="password"
          autoComplete="new-password"
          aria-describedby="v-password-hint"
        />
        <FieldDescription id="v-password-hint">Min. 10 znaków</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="v-video">Link do wideo (YouTube lub Vimeo)</FieldLabel>
        <Input id="v-video" type="url" placeholder="np. https://youtu.be/…" />
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
          'Najechanie nie zmienia wyglądu pola (kursor tekstowy wystarcza). Fokus to zamrożony podgląd `:focus-visible`.',
      },
    },
  },
  render: () => (
    <StateMatrix
      columns={columns.map((c) => c.column)}
      rows={[
        { label: 'Puste (przykład)', value: undefined },
        { label: 'Wypełnione', value: 'anna@example.com' },
      ].map((row) => ({
        label: row.label,
        cells: columns.map((c) => (
          <Input
            key={c.column}
            aria-label={`E-mail — ${row.label}, ${c.column}`}
            type="email"
            placeholder="np. anna@example.com"
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

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <Field>
        <FieldLabel htmlFor="long-headline">
          Nagłówek profilu, który zobaczą uczniowie w wynikach
        </FieldLabel>
        <Input
          id="long-headline"
          defaultValue="Senior Frontend Developer — pomagam przejść z juniora na mida w 6 miesięcy"
          aria-invalid
          aria-describedby="long-headline-error"
        />
        <FieldError id="long-headline-error">
          Nagłówek może mieć najwyżej 80 znaków. Skróć go o 3 znaki.
        </FieldError>
      </Field>
    </ViewportFrame>
  ),
};

export const TypeAndKeyboard: Story = {
  name: 'Test: wpisywanie i klawiatura',
  args: { type: 'email', placeholder: 'np. anna@example.com' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'E-mail' });
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await userEvent.type(input, 'anna@example.com');
    await expect(input).toHaveValue('anna@example.com');
  },
};
