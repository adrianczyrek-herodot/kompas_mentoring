import type { Meta, StoryObj } from '@storybook/react-vite';
import type * as React from 'react';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Field, FieldDescription, FieldLabel } from './field';
import { VideoLinkField } from './video-link-field';

const onChange = fn();

/** The field with its own state — the state lives in a component, not in the story. */
function VideoField(args: React.ComponentProps<typeof VideoLinkField>) {
  const [value, setValue] = useState(args.value);
  return (
    <div className="max-w-form">
      <Field>
        <FieldLabel htmlFor="video">Link do wideo</FieldLabel>
        <VideoLinkField
          {...args}
          id="video"
          value={value}
          onChange={(next) => {
            setValue(next);
            onChange(next);
          }}
        />
        <FieldDescription>{args.description}</FieldDescription>
      </Field>
    </div>
  );
}

const meta = {
  title: 'Produkt/E2 Katalog i onboarding/VideoLinkField',
  component: VideoLinkField,
  args: {
    value: '',
    onChange,
    description: 'Link do filmu na YouTube albo Vimeo. Film jest opcjonalny.',
  },
  render: (args) => <VideoField {...args} />,
} satisfies Meta<typeof VideoLinkField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const RecognisedLink: Story = {
  args: { value: 'https://youtu.be/dQw4w9WgXcQ' },
};

export const VimeoLink: Story = {
  args: { value: 'https://vimeo.com/123456789' },
};

export const WithError: Story = {
  args: {
    value: 'https://example.com/film',
    error: 'Wklej link do filmu na YouTube albo Vimeo.',
  },
};

export const TypesTheLink: Story = {
  name: 'Test: rozpoznanie dostawcy',
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Link do wideo' });
    await userEvent.clear(input);
    await userEvent.type(input, 'https://vimeo.com/123456789');
    await expect(canvasElement.textContent).toContain('Vimeo');
  },
};
