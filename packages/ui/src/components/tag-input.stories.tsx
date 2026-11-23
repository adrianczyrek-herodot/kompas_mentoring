import type { Meta, StoryObj } from '@storybook/react-vite';
import type * as React from 'react';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Field, FieldDescription, FieldLabel } from './field';
import { TagInput } from './tag-input';

const onChange = fn();

/** The field with its own list — the state lives in a component, not in the story. */
function TagsField(args: React.ComponentProps<typeof TagInput>) {
  const [tags, setTags] = useState<string[]>([...args.value]);
  return (
    <div className="max-w-form">
      <Field>
        <FieldLabel htmlFor="tags">Tagi</FieldLabel>
        <TagInput
          {...args}
          value={tags}
          onChange={(next) => {
            setTags(next);
            onChange(next);
          }}
        />
        <FieldDescription>3–15 tagów, każdy 2–30 znaków.</FieldDescription>
      </Field>
    </div>
  );
}

const meta = {
  title: 'Produkt/E2 Katalog i onboarding/TagInput',
  component: TagInput,
  args: {
    value: ['typescript', 'mentoring'],
    onChange,
    label: 'Tagi',
    removeLabel: 'Usuń tag',
    placeholder: 'Dodaj tag i zatwierdź Enterem',
    max: 15,
  },
  render: (args) => <TagsField {...args} />,
} satisfies Meta<typeof TagInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Empty: Story = {
  args: { value: [] },
};

export const WithSuggestions: Story = {
  name: 'Podpowiedzi (istniejące tagi)',
  args: { suggestions: ['typescript', 'react', 'leadership', 'ai'] },
};

export const WithError: Story = {
  args: { error: 'Masz już 15 tagów — usuń jeden, żeby dodać kolejny.' },
};

export const AddsAndRemoves: Story = {
  name: 'Test: dodawanie i usuwanie tagów',
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Tagi' });
    await userEvent.type(input, 'ai{Enter}');
    await expect(onChange).toHaveBeenCalledWith(['typescript', 'mentoring', 'ai']);
    const remove = within(canvasElement).getByRole('button', { name: 'Usuń tag: typescript' });
    await userEvent.click(remove);
    await expect(onChange).toHaveBeenCalledWith(['mentoring', 'ai']);
  },
};
