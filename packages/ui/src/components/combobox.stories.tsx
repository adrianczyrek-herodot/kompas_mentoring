import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import {
  type PreviewState,
  StateMatrix,
  ViewportFrame,
} from '../../.storybook/blocks/component-docs';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from './combobox';
import { Field, FieldDescription, FieldError, FieldLabel } from './field';

const topics = [
  'React',
  'TypeScript',
  'Rozmowa rekrutacyjna',
  'Architektura frontendu',
  'Product management',
  'UX research',
  'Negocjacje wynagrodzenia',
  'Zmiana branży na IT',
];

function TopicList() {
  return (
    <ComboboxContent>
      <ComboboxEmpty>Nie znamy takiego tematu. Spróbuj krótszej frazy, np. „React”.</ComboboxEmpty>
      <ComboboxList>
        {(topic: string) => (
          <ComboboxItem key={topic} value={topic}>
            {topic}
          </ComboboxItem>
        )}
      </ComboboxList>
    </ComboboxContent>
  );
}

type PlaygroundArgs = { disabled: boolean; invalid: boolean; placeholder: string };

const meta = {
  title: 'Komponenty bazowe/Formularze/Combobox',
  args: { disabled: false, invalid: false, placeholder: 'np. React, rozmowa rekrutacyjna' },
  render: ({ disabled, invalid, placeholder }) => (
    <Field className="max-w-form">
      <FieldLabel htmlFor="pg-topic">Temat</FieldLabel>
      <Combobox items={topics} disabled={disabled}>
        <ComboboxInput
          id="pg-topic"
          placeholder={placeholder}
          triggerLabel="Pokaż tematy"
          clearLabel="Wyczyść temat"
          aria-invalid={invalid ? true : undefined}
        />
        <TopicList />
      </Combobox>
    </Field>
  ),
} satisfies Meta<PlaygroundArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const tags = [
  'React',
  'TypeScript',
  'Next.js',
  'Testy',
  'Code review',
  'Architektura',
  'Mentoring juniorów',
];

function TagChips({ value }: { value: string[] }) {
  return (
    <ComboboxChips aria-label="Wybrane tagi">
      {value.map((tag) => (
        <ComboboxChip key={tag} removeLabel={`Usuń tag ${tag}`}>
          {tag}
        </ComboboxChip>
      ))}
    </ComboboxChips>
  );
}

function TagsField({ id, defaultValue }: { id: string; defaultValue: string[] }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Tagi</FieldLabel>
      <Combobox items={tags} multiple defaultValue={defaultValue}>
        <ComboboxValue>
          {(value: string[]) => (
            <ComboboxInput
              id={id}
              triggerLabel="Pokaż tagi"
              aria-describedby={`${id}-hint`}
              placeholder={value.length > 0 ? '' : 'np. React'}
              chips={value.length > 0 ? <TagChips value={value} /> : null}
            />
          )}
        </ComboboxValue>
        <ComboboxContent>
          <ComboboxEmpty>Nie ma takiego tagu na liście.</ComboboxEmpty>
          <ComboboxList>
            {(tag: string) => (
              <ComboboxItem key={tag} value={tag}>
                {tag}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription id={`${id}-hint`}>Od 3 do 15 tagów.</FieldDescription>
    </Field>
  );
}

export const Variants: Story = {
  name: 'Odmiany: jeden wybór i wiele (tagi)',
  render: () => (
    <div className="flex max-w-form flex-col gap-group">
      <Field>
        <FieldLabel htmlFor="v-topic">Temat</FieldLabel>
        <Combobox items={topics} defaultValue="TypeScript">
          <ComboboxInput id="v-topic" triggerLabel="Pokaż tematy" clearLabel="Wyczyść temat" />
          <TopicList />
        </Combobox>
      </Field>
      <TagsField id="v-tags" defaultValue={['React', 'TypeScript']} />
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
        { label: 'Puste', value: null },
        { label: 'Wybrane', value: 'React' },
      ].map((row) => ({
        label: row.label,
        cells: columns.map((c) => (
          <Combobox key={c.column} items={topics} defaultValue={row.value} disabled={c.disabled}>
            <ComboboxInput
              aria-label={`Temat — ${row.label}, ${c.column}`}
              triggerLabel={`Pokaż tematy — ${row.label}, ${c.column}`}
              placeholder="np. React"
              data-preview-state={c.preview}
              aria-invalid={c.invalid ? true : undefined}
            />
            <TopicList />
          </Combobox>
        )),
      }))}
    />
  ),
};

export const LongContent: Story = {
  name: 'Długa treść i wąski ekran',
  render: () => (
    <ViewportFrame width={320}>
      <div className="flex flex-col gap-group">
        <TagsField
          id="long-tags"
          defaultValue={['Mentoring juniorów', 'Architektura', 'Code review', 'TypeScript']}
        />
        <Field>
          <FieldLabel htmlFor="long-topic">Temat, w którym szukasz mentora</FieldLabel>
          <Combobox items={topics} defaultValue="Negocjacje wynagrodzenia">
            <ComboboxInput
              id="long-topic"
              triggerLabel="Pokaż tematy"
              aria-invalid
              aria-describedby="long-topic-error"
            />
            <TopicList />
          </Combobox>
          <FieldError id="long-topic-error">Fraza może mieć najwyżej 80 znaków.</FieldError>
        </Field>
      </div>
    </ViewportFrame>
  ),
};

export const FilterAndSelect: Story = {
  name: 'Test: filtrowanie, brak wyników i wybór',
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox', { name: 'Temat' });
    await userEvent.type(input, 'xyz');
    const empty = await screen.findByText(/Nie znamy takiego tematu/);
    // The popup fades in (opacity 0 → 1), so wait for the end of the transition.
    await waitFor(() => expect(empty).toBeVisible());
    await userEvent.clear(input);
    await userEvent.type(input, 'rek');
    const option = await screen.findByRole('option', { name: 'Rozmowa rekrutacyjna' });
    await expect(screen.queryByRole('option', { name: 'React' })).not.toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(input).toHaveValue('Rozmowa rekrutacyjna');
    await waitFor(() => expect(option).not.toBeInTheDocument());
  },
};

export const ChipsAddAndRemove: Story = {
  name: 'Test: tagi — dodaj i usuń',
  render: () => <TagsField id="test-tags" defaultValue={['React']} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Tagi' });
    await userEvent.type(input, 'Type');
    await userEvent.click(await screen.findByRole('option', { name: 'TypeScript' }));
    await expect(canvas.getByRole('button', { name: 'Usuń tag TypeScript' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Usuń tag React' }));
    await expect(canvas.queryByRole('button', { name: 'Usuń tag React' })).not.toBeInTheDocument();
  },
};
